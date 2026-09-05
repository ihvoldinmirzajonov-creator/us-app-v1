# Firebase scaffold

This folder contains Firestore security rules, Storage rules, Cloud Functions stubs (TypeScript), and a seed script for questions and challenges.

Deployment steps (high level):
1. Install Firebase CLI and login: `npm install -g firebase-tools` then `firebase login`.
2. Initialize project locally: `firebase init` (select Firestore, Functions, Storage)
3. Replace rules and functions with the files in this folder, then deploy: `firebase deploy --only firestore,functions,storage`.
