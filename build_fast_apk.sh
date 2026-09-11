#!/bin/bash
set -e

echo "=== STEP 1: Download and Extract Adoptium OpenJDK 21 ==="
if [ ! -f /opt/jdk-21/bin/java ]; then
  echo "Downloading Adoptium JDK 21 tarball..."
  mkdir -p /opt/jdk-21
  curl -fsSL "https://api.adoptium.net/v3/binary/latest/21/ga/linux/x64/jdk/hotspot/normal/eclipse" -o /tmp/jdk21.tar.gz
  echo "Extracting Adoptium JDK 21..."
  tar -xzf /tmp/jdk21.tar.gz -C /opt/jdk-21 --strip-components=1
  rm -f /tmp/jdk21.tar.gz
fi

export JAVA_HOME=/opt/jdk-21
export PATH=/opt/jdk-21/bin:$PATH
echo "Java Version:"
/opt/jdk-21/bin/java -version

echo "=== STEP 2: Download and Setup Android SDK & Build Tools ==="
export ANDROID_HOME=/opt/android-sdk
mkdir -p /opt/android-sdk/cmdline-tools

if [ ! -f /opt/android-sdk/cmdline-tools/latest/bin/sdkmanager ]; then
  echo "Downloading cmdline-tools..."
  curl -fsSL https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -o /tmp/cmdline.zip
  unzip -q /tmp/cmdline.zip -d /opt/android-sdk/cmdline-tools
  mv /opt/android-sdk/cmdline-tools/cmdline-tools /opt/android-sdk/cmdline-tools/latest || true
  rm -f /tmp/cmdline.zip
fi

export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

echo "Accepting licenses..."
yes | /opt/android-sdk/cmdline-tools/latest/bin/sdkmanager --sdk_root=/opt/android-sdk --licenses > /dev/null 2>&1 || true

echo "Installing platforms and build-tools..."
/opt/android-sdk/cmdline-tools/latest/bin/sdkmanager --sdk_root=/opt/android-sdk "platforms;android-36" "build-tools;36.0.0" "build-tools;35.0.0" "platform-tools" > /dev/null 2>&1

echo "=== STEP 3: Frontend Build & Capacitor Sync ==="
npm run build
npx cap sync android

echo "=== STEP 4: Verify Assets & Remove Stale Artifacts ==="
ls -lh android/app/src/main/assets/public/
ls -lh android/app/src/main/assets/public/assets/
rm -f public/app-debug.apk APK_DOWNLOAD/app-debug.apk android/app/src/main/assets/public/app-debug.apk
rm -rf android/app/build/outputs/apk/

echo "=== STEP 5: Gradle Clean & AssembleDebug ==="
cd android
chmod +x gradlew
./gradlew clean
./gradlew --no-daemon assembleDebug

echo "=== STEP 6: Verify and Copy APK ==="
cd ..
if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
  echo "=== BUILD SUCCESSFUL ==="
  ls -lh android/app/build/outputs/apk/debug/app-debug.apk
  mkdir -p APK_DOWNLOAD
  cp -f android/app/build/outputs/apk/debug/app-debug.apk APK_DOWNLOAD/app-debug.apk
  echo "=== APK DETAILS ==="
  echo "APK Path: android/app/build/outputs/apk/debug/app-debug.apk"
  echo "APK Size: $(du -h android/app/build/outputs/apk/debug/app-debug.apk | cut -f1)"
  echo "APK Bytes: $(stat -c %s android/app/build/outputs/apk/debug/app-debug.apk)"
  echo "Package Name: io.blogge.app"
  echo "Version Name: 1.3.0"
  echo "Version Code: 3"
  echo "Bundled index.html: $(test -f android/app/src/main/assets/public/index.html && echo 'CONFIRMED' || echo 'MISSING')"
  echo "Server URL used: NO (Offline bundled assets loaded directly via Capacitor)"
  echo "=== BUILD COMPLETE ==="
else
  echo "=== BUILD FAILED: APK not found ==="
  exit 1
fi
