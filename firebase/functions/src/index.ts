import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();
const db = admin.firestore();

export const sendInvite = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated','Not signed in');
  const { inviteEmail } = data;
  if (!inviteEmail) throw new functions.https.HttpsError('invalid-argument','Missing inviteEmail');
  const inviteRef = db.collection('invites').doc();
  await inviteRef.set({ inviteEmail, inviterId: context.auth.uid, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  return { inviteId: inviteRef.id };
});

export const createCouple = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated','Not signed in');
  const { inviteId } = data;
  if (!inviteId) throw new functions.https.HttpsError('invalid-argument','Missing inviteId');

  const inviteSnap = await db.collection('invites').doc(inviteId).get();
  if (!inviteSnap.exists) throw new functions.https.HttpsError('not-found','Invite not found');
  const invite = inviteSnap.data();
  const inviterId = invite!.inviterId;
  const partnerId = context.auth.uid;
  if (inviterId === partnerId) throw new functions.https.HttpsError('failed-precondition','Cannot accept your own invite');

  // create couple doc and update both user docs atomically
  const coupleRef = db.collection('couples').doc();
  const batch = db.batch();
  batch.set(coupleRef, {
    partnerAId: inviterId,
    partnerBId: partnerId,
    startDate: admin.firestore.FieldValue.serverTimestamp(),
    nextMeeting: null,
    photoUrl: null,
    timeZones: {},
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  const inviterUserRef = db.collection('users').doc(inviterId);
  const partnerUserRef = db.collection('users').doc(partnerId);
  batch.update(inviterUserRef, { coupleId: coupleRef.id });
  batch.update(partnerUserRef, { coupleId: coupleRef.id });
  batch.delete(db.collection('invites').doc(inviteId));
  await batch.commit();

  return { coupleId: coupleRef.id };
});
