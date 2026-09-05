# Build Android APK (EAS) — quick steps

This guide shows how to produce a standalone Android APK using Expo Application Services (EAS). If you don't have a computer, ask a helper to follow these exact steps and share the produced APK with you.

Prerequisites (for the helper):
- Node.js and npm installed
- An Expo account (create at https://expo.dev if needed)
- Access to this repository (cloned locally)

Quick steps (copy-paste for the helper):
1. Install EAS CLI (one-time):
   npm install -g eas-cli

2. Login to Expo using the helper's Expo account:
   eas login
   (follow browser sign-in)

3. Ensure expo CLI is available (optional):
   npm install -g expo-cli

4. In the repo, go to the expo folder and install deps:
   cd path/to/repo/expo
   npm install

5. Configure app.json if you want a custom Android package name:
   - Open expo/app.json and replace "com.yourcompany.usapp" with your desired package identifier (e.g., com.example.usapp)

6. Run the build (production APK):
   eas build -p android --profile production

   - For the first build, EAS will ask how to handle Android credentials (keystore). Choose the recommended option: "Let EAS handle credentials" unless you already have a keystore.

7. Wait for the build to finish. EAS prints a URL to monitor the build. When complete, the APK can be downloaded from that page.

8. Share the APK with the tester (you). They can install it on Android devices by opening the APK link or transferring the file to the phone.

Notes and tips
- If you prefer an Android App Bundle (.aab) for Play Store submission, change "buildType" to "app-bundle" in expo/eas.json.
- EAS may request the Android package name to be unique; choose a reverse-domain identifier you control (e.g., com.yourcompany.usapp).
- If you want me to run the build for you, I can, but I'll need an Expo account token or a collaborator to run the commands on a machine. I recommend giving the helper the steps above.

Troubleshooting
- Build fails due to missing firebase config: ensure expo/src/firebase/config.ts contains your Firebase project's config.
- If the build fails due to credential problems, re-run `eas build` and choose to let EAS manage credentials.

I can also create a GitHub Action to build APKs automatically on push if you want; that requires adding secrets (EAS_TOKEN) to GitHub.
