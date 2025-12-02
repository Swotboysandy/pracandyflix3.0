# The Premium Thing™ (Dev Edition) 🛠️🎬

Welcome, fellow code-wrangler. This is **The Premium Thing**, a React Native application that streams content. It definitely doesn't infringe on any trademarks because we changed all the colors and names. It's blue. It's red. It's *Premium*.

## 📋 Prerequisites (The Boring Stuff)

Before you try to run this and complain it doesn't work, make sure you have:

*   **Node.js**: Version 18+ (because we like living on the edge, but not *too* close).
*   **Java Development Kit (JDK)**: Version 17 (Android loves it).
*   **Android Studio**: With the SDKs and an emulator (or a real device if you're brave).
*   **Yarn** or **npm**: Pick your poison.

## 🚀 Getting Started

1.  **Clone the Repo** (You probably already did this).

2.  **Install Dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```
    *Time to hydrate while `node_modules` consumes your disk space.*

3.  **Run on Android**:
    ```bash
    npm run android
    # or
    yarn android
    ```
    *If the Metro bundler crashes, try turning it off and on again.*

## 🏗️ Building for Release (The "Ship It" Phase)

So you want to build an APK to send to your friends/users? Here's the magic spell.

### 1. Generate the APK
Navigate to the android directory and run the gradle assembler:

```bash
cd android
./gradlew assembleRelease
```

### 2. Locate the Artifact
Once the matrix code stops scrolling, find your APK here:
`android/app/build/outputs/apk/release/app-release.apk`

### 3. Signing (Optional but Recommended)
Currently, this builds a debug-signed release APK. If you want to put this on a store (or just stop Android from warning users), you'll need to generate a keystore and configure `gradle.properties`. Google "React Native Generate Upload Key" - trust me, the docs explain it better than I can.

## 🔄 OTA Updates (CodePush)

**"How do I update the app without making users reinstall?"**

We don't have this implemented yet, but if you want to be the hero who adds it:
1.  Look into **Microsoft CodePush** (`react-native-code-push`).
2.  It allows you to push JS bundle updates directly to devices.
3.  **Caveat**: You can't update native code (Java/Kotlin/Podfile changes) this way. For that, you still need a new APK.

## 📂 Project Structure

*   `src/components`: The Lego blocks.
*   `src/screens`: The pages where the Lego blocks live.
*   `src/services`: Where we talk to the internet (API calls).
*   `src/navigation`: The map.

## 🐛 Troubleshooting

*   **"Network Error"**: Check your internet. Check the API endpoint. Check if the backend is alive.
*   **"Gradle Build Failed"**: `cd android && ./gradlew clean`. It fixes 90% of problems.
*   **"Red Screen of Death"**: Read the error message. It's usually telling you exactly what's wrong (except when it isn't).

---
*Happy Coding! Don't break production on a Friday.*
