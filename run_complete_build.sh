#!/bin/bash
set -e

echo "=== STEP 1: Setting up OpenJDK 21 ==="
if ! command -v javac &> /dev/null; then
  echo "Installing openjdk-21-jdk-headless..."
  apt-get update -qq
  apt-get install -y -qq openjdk-21-jdk-headless unzip curl
fi

export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which javac))))
echo "JAVA_HOME is $JAVA_HOME"
$JAVA_HOME/bin/java -version

echo "=== STEP 2: Setting up Android SDK ==="
export ANDROID_HOME=/opt/android-sdk
mkdir -p /opt/android-sdk/cmdline-tools

if [ ! -f /opt/android-sdk/cmdline-tools/latest/bin/sdkmanager ]; then
  echo "Downloading Android Command-Line Tools..."
  curl -fsSL https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -o /tmp/cmdline-tools.zip
  unzip -q /tmp/cmdline-tools.zip -d /opt/android-sdk/cmdline-tools
  mv /opt/android-sdk/cmdline-tools/cmdline-tools /opt/android-sdk/cmdline-tools/latest || true
  rm -f /tmp/cmdline-tools.zip
fi

export PATH=$PATH:$JAVA_HOME/bin:/opt/android-sdk/cmdline-tools/latest/bin:/opt/android-sdk/platform-tools

echo "Accepting licenses..."
yes | sdkmanager --sdk_root=/opt/android-sdk --licenses > /dev/null 2>&1 || true

echo "Installing platforms and build-tools..."
sdkmanager --sdk_root=/opt/android-sdk "platforms;android-36" "build-tools;36.0.0" "build-tools;35.0.0" "platform-tools" > /dev/null 2>&1

echo "=== STEP 3: Frontend Production Build & Capacitor Sync ==="
npm run build
npx cap sync android

echo "=== STEP 4: Verifying Bundled Web Assets ==="
ls -lh android/app/src/main/assets/public/
ls -lh android/app/src/main/assets/public/assets/

echo "=== STEP 5: Cleaning Stale APKs ==="
rm -f public/app-debug.apk APK_DOWNLOAD/app-debug.apk android/app/src/main/assets/public/app-debug.apk
rm -rf android/app/build/outputs/apk/

echo "=== STEP 6: Android Build (Clean & AssembleDebug) ==="
cd android
chmod +x gradlew
./gradlew clean
./gradlew --no-daemon assembleDebug

echo "=== STEP 7: Copying and Verifying Generated APK ==="
cd ..
if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
  echo "=== APK GENERATION SUCCESSFUL ==="
  ls -lh android/app/build/outputs/apk/debug/app-debug.apk
  mkdir -p APK_DOWNLOAD
  cp -f android/app/build/outputs/apk/debug/app-debug.apk APK_DOWNLOAD/app-debug.apk
  echo "APK ready at: android/app/build/outputs/apk/debug/app-debug.apk"
else
  echo "=== APK GENERATION FAILED ==="
  exit 1
fi
