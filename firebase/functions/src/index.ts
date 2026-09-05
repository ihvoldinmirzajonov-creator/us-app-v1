import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();
const db = admin.firestore();

// Send invite email with token (implement email sending via SendGrid or similar)
export const sendInvite = functions.https.onCall(async (data, context) => {
  const { inviteEmail, inviterId } = data;
  if (!context.auth || context.auth.uid !== inviterId) throw new functions.https.HttpsError("unauthenticated", "Not signed in");
  const tokenRef = db.collection("invites").doc();
  await tokenRef.set({ inviteEmail, inviterId, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  return { inviteId: tokenRef.id };
});

// When two users linked to same invite, create couple doc
export const createCouple = functions.https.onCall(async (data, context) => {
  // Implement server-side validation and atomic couple creation
  return { success: true };
});

// Trigger: on answer creation, check if both answers present and notify partner
export const onAnswerCreated = functions.firestore
  .document("answers/{answerId}")
  .onCreate(async (snap, ctx) => {
    const answer = snap.data();
    if (!answer) return;
    const q = answer.questionId;
    const coupleId = answer.coupleId;
    const answersSnap = await db.collection("answers")
      .where("questionId", "==", q)
      .where("coupleId", "==", coupleId)
      .get();
    const authors = new Set<string>();
    answersSnap.forEach(a => authors.add(a.data().authorId));
    if (authors.size >= 2) {
      await db.collection("questionsStatus").doc(`${coupleId}_${q}`).set({ revealable: true }, { merge: true });
    }
  });

// Scheduled: nightly push reminders for unanswered daily question (example every day at 07:00 UTC)
export const scheduleReminders = functions.pubsub.schedule("0 7 * * *").timeZone("UTC").onRun(async (context) => {
  return null;
});
