import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';

admin.initializeApp();
const db = admin.firestore();

// Helper to get SendGrid API key and email-from address.
function configureSendGrid() {
  const key = process.env.SENDGRID_API_KEY || functions.config().sendgrid?.key;
  const from = process.env.EMAIL_FROM || functions.config().sendgrid?.from;
  const frontend = process.env.FRONTEND_URL || functions.config().app?.frontend_url || 'https://example.com';
  if (key) sgMail.setApiKey(key);
  return { key, from, frontend };
}

// Helper: send push notification to user (reads user.fcmTokens array)
async function sendPushToUser(userId: string, payload: admin.messaging.MulticastMessage) {
  try {
    const userSnap = await db.collection('users').doc(userId).get();
    if (!userSnap.exists) return;
    const user = userSnap.data() as any;
    const tokens: string[] = Array.isArray(user?.fcmTokens) ? user.fcmTokens : (user?.fcmToken ? [user.fcmToken] : []);
    if (tokens.length === 0) return;
    payload.tokens = tokens;
    const res = await admin.messaging().sendMulticast(payload);
    console.log(`Sent push to ${userId}: ${res.successCount} successes, ${res.failureCount} failures`);
  } catch (err) {
    console.error('sendPushToUser error', err);
  }
}

// Callable: sendInvite
export const sendInvite = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Not signed in');
  const { inviteEmail } = data;
  if (!inviteEmail) throw new functions.https.HttpsError('invalid-argument', 'Missing inviteEmail');

  const { key, from, frontend } = configureSendGrid();
  const inviterId = context.auth.uid;
  const inviterSnap = await db.collection('users').doc(inviterId).get();
  const inviter = inviterSnap.exists ? (inviterSnap.data() as any) : null;
  const inviteRef = db.collection('invites').doc();
  const expiresAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days

  const invite = {
    inviteEmail,
    inviterId,
    inviterName: inviter?.name || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt,
    used: false
  } as any;

  await inviteRef.set(invite);
  const inviteId = inviteRef.id;

  // Send email if SendGrid configured
  if (key && from) {
    const link = `${frontend}/join/${inviteId}`;
    const msg = {
      to: inviteEmail,
      from,
      subject: `${inviter?.name || 'Someone'} invited you to join them on Us`,
      html: `<p>Hi —</p><p>${inviter?.name || 'A partner'} invited you to join their private space on <strong>Us</strong>.</p><p>Click <a href="${link}">here</a> to join, or use this code: <strong>${inviteId}</strong>.</p><p>This link expires in 7 days.</p>`
    };
    try {
      await sgMail.send(msg);
      console.log('Invite email sent to', inviteEmail);
    } catch (err) {
      console.error('SendGrid error', err);
    }
  } else {
    console.log('SendGrid not configured; invite created without sending email');
  }

  return { inviteId };
});

// Callable: createCouple via inviteId
export const createCouple = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Not signed in');
  const { inviteId } = data;
  if (!inviteId) throw new functions.https.HttpsError('invalid-argument', 'Missing inviteId');

  const inviteRef = db.collection('invites').doc(inviteId);
  const inviteSnap = await inviteRef.get();
  if (!inviteSnap.exists) throw new functions.https.HttpsError('not-found', 'Invite not found');
  const invite = inviteSnap.data() as any;
  if (invite.used) throw new functions.https.HttpsError('failed-precondition', 'Invite already used');
  if (invite.expiresAt && admin.firestore.Timestamp.now().toMillis() > invite.expiresAt.toMillis()) {
    throw new functions.https.HttpsError('deadline-exceeded', 'Invite expired');
  }

  const inviterId = invite.inviterId;
  const partnerId = context.auth.uid;
  if (inviterId === partnerId) throw new functions.https.HttpsError('failed-precondition', 'Cannot accept your own invite');

  // Check users exist and are not already in a couple
  const inviterUserRef = db.collection('users').doc(inviterId);
  const partnerUserRef = db.collection('users').doc(partnerId);
  const [inviterSnap2, partnerSnap] = await Promise.all([inviterUserRef.get(), partnerUserRef.get()]);
  if (!inviterSnap2.exists || !partnerSnap.exists) throw new functions.https.HttpsError('not-found', 'User record not found for inviter or partner');
  const inviterUser = inviterSnap2.data() as any;
  const partnerUser = partnerSnap.data() as any;
  if (inviterUser.coupleId) throw new functions.https.HttpsError('failed-precondition', 'Inviter already in a couple');
  if (partnerUser.coupleId) throw new functions.https.HttpsError('failed-precondition', 'You are already in a couple');

  // Create couple and atomically update user docs and mark invite used
  const coupleRef = db.collection('couples').doc();
  const batch = db.batch();
  batch.set(coupleRef, {
    partnerAId: inviterId,
    partnerBId: partnerId,
    startDate: admin.firestore.FieldValue.serverTimestamp(),
    nextMeeting: null,
    photoUrl: null,
    timeZones: {
      [inviterId]: inviterUser.timeZone || null,
      [partnerId]: partnerUser.timeZone || null
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  batch.update(inviterUserRef, { coupleId: coupleRef.id });
  batch.update(partnerUserRef, { coupleId: coupleRef.id });
  batch.update(inviteRef, { used: true, usedBy: partnerId, usedAt: admin.firestore.FieldValue.serverTimestamp() });
  await batch.commit();

  // Notify inviter that partner joined via push
  const payload: admin.messaging.MulticastMessage = {
    notification: { title: 'They joined!', body: `${partnerUser.name || 'A partner'} accepted your invite.` },
    data: { type: 'partner_joined', coupleId: coupleRef.id }
  } as any;
  await sendPushToUser(inviterId, payload);

  return { coupleId: coupleRef.id };
});

// On answer created: if both partners answered, mark revealable and notify both
export const onAnswerCreated = functions.firestore
  .document('answers/{answerId}')
  .onCreate(async (snap, ctx) => {
    const answer = snap.data() as any;
    if (!answer) return;
    const q = answer.questionId;
    const coupleId = answer.coupleId;
    if (!q || !coupleId) return;

    const answersSnap = await db.collection('answers')
      .where('questionId', '==', q)
      .where('coupleId', '==', coupleId)
      .get();
    const authors = new Set<string>();
    answersSnap.forEach(a => authors.add(a.data().authorId));
    if (authors.size >= 2) {
      await db.collection('questionsStatus').doc(`${coupleId}_${q}`).set({ revealable: true }, { merge: true });
      // notify both partners
      const coupleSnap = await db.collection('couples').doc(coupleId).get();
      if (!coupleSnap.exists) return;
      const c = coupleSnap.data() as any;
      const partnerA = c.partnerAId;
      const partnerB = c.partnerBId;
      const payload: admin.messaging.MulticastMessage = {
        notification: { title: 'Both answered', body: 'You can now reveal your answers.' },
        data: { type: 'answers_revealable', questionId: q }
      } as any;
      await Promise.all([sendPushToUser(partnerA, payload), sendPushToUser(partnerB, payload)]);
    }
  });

// Optional: scheduled function to clear expired invites daily
export const cleanupExpiredInvites = functions.pubsub.schedule('0 3 * * *').timeZone('UTC').onRun(async (context) => {
  const now = admin.firestore.Timestamp.now();
  const snaps = await db.collection('invites').where('expiresAt', '<=', now).where('used', '==', false).get();
  const batch = db.batch();
  snaps.forEach(s => batch.delete(s.ref));
  if (!snaps.empty) await batch.commit();
  return null;
});
