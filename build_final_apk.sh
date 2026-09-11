#!/usr/bin/env bash
set -e

echo "=== 1. Removing any stale APK files ==="
rm -f public/app-debug.apk APK_DOWNLOAD/app-debug.apk android/app/src/main/assets/public/app-debug.apk
rm -rf android/app/build/outputs/apk/

echo "=== 2. Frontend production build ==="
npm run build

echo "=== 3. Capacitor Sync Android ==="
npx cap sync android

echo "=== 4. Checking bundled assets ==="
test -f android/app/src/main/assets/public/index.html
test -d android/app/src/main/assets/public/assets
rm -f android/app/src/main/assets/public/server.cjs android/app/src/main/assets/public/*.map android/app/src/main/assets/public/app-debug.apk

echo "=== 5. Setting up Java JDK 21 ==="
if [ ! -x /opt/jdk-21/bin/java ]; then
  echo "Installing JDK 21..."
  mkdir -p /opt/jdk-21
  curl -fsSL "https://api.adoptium.net/v3/binary/latest/21/ga/linux/x64/jdk/hotspot/normal/eclipse" -o /tmp/jdk21.tar.gz
  tar -xzf /tmp/jdk21.tar.gz -C /opt/jdk-21 --strip-components=1
  rm -f /tmp/jdk21.tar.gz
fi
export JAVA_HOME=/opt/jdk-21
export PATH=/opt/jdk-21/bin:$PATH
/opt/jdk-21/bin/java -version

echo "=== 6. Setting up Android SDK Command Line Tools & Platforms ==="
export ANDROID_HOME=/opt/android-sdk
mkdir -p /opt/android-sdk/cmdline-tools
if [ ! -x /opt/android-sdk/cmdline-tools/latest/bin/sdkmanager ]; then
  echo "Installing cmdline-tools..."
  curl -fsSL https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -o /tmp/cmdline.zip
  unzip -q /tmp/cmdline.zip -d /opt/android-sdk/cmdline-tools
  mv /opt/android-sdk/cmdline-tools/cmdline-tools /opt/android-sdk/cmdline-tools/latest
  rm -f /tmp/cmdline.zip
fi

yes | /opt/android-sdk/cmdline-tools/latest/bin/sdkmanager --sdk_root=/opt/android-sdk --licenses > /dev/null 2>&1 || true
/opt/android-sdk/cmdline-tools/latest/bin/sdkmanager --sdk_root=/opt/android-sdk "platforms;android-36" "build-tools;36.0.0" "build-tools;35.0.0" "platform-tools" > /dev/null 2>&1

echo "=== 7. Cleaning Android project ==="
cd android
chmod +x gradlew
./gradlew clean

echo "=== 8. Assembling Debug APK ==="
./gradlew --no-daemon assembleDebug

echo "=== 9. Verifying Output APK ==="
cd ..
if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
  echo "=== BUILD SUCCESSFUL ==="
  ls -lh android/app/build/outputs/apk/debug/app-debug.apk
  mkdir -p APK_DOWNLOAD
  cp -f android/app/build/outputs/apk/debug/app-debug.apk APK_DOWNLOAD/app-debug.apk
  echo "APK ready at: android/app/build/outputs/apk/debug/app-debug.apk"
  echo "APK download copy at: APK_DOWNLOAD/app-debug.apk"
  echo "=== APK DETAILS ==="
  echo "APK Path: android/app/build/outputs/apk/debug/app-debug.apk"
  echo "APK Size: $(du -h android/app/build/outputs/apk/debug/app-debug.apk | cut -f1)"
  echo "APK Bytes: $(stat -c %s android/app/build/outputs/apk/debug/app-debug.apk)"
  echo "Package Name: io.blogge.app"
  echo "Version Name: 1.3.3"
  echo "Version Code: 6"
  echo "Bundled index.html: $(test -f android/app/src/main/assets/public/index.html && echo 'CONFIRMED' || echo 'MISSING')"
  echo "Server URL used: NO (Offline bundled assets loaded directly via Capacitor)"
else
  echo "=== BUILD FAILED: APK not found ==="
  exit 1
fi
