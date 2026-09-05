// Run with: node scripts/seedQuestions.js (set GOOGLE_APPLICATION_CREDENTIALS for admin SDK)
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

const questions = [
  { text: "What made you smile today?", category: "daily" },
  { text: "What's a small win you had this week?", category: "daily" },
  { text: "What's one thing you miss about me right now?", category: "intimate" }
];

const challenges = [
  { text: "Send a voice note telling a small story from today." },
  { text: "Share a photo of something that reminded you of us." }
];

async function seed() {
  for (const q of questions) {
    await db.collection("questions").add({ ...q, createdBy: "system", createdAt: admin.firestore.FieldValue.serverTimestamp() });
  }
  for (const c of challenges) {
    await db.collection("challenges").add({ ...c, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  }
  console.log("Seed complete");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
