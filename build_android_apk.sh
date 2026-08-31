#!/usr/bin/env bash
set -e

echo "=== 1. INSTALLING JAVA 21 & SYSTEM UTILITIES ==="
DEBIAN_FRONTEND=noninteractive apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends openjdk-21-jdk-headless curl unzip

echo "=== 2. SETTING UP ANDROID SDK ==="
mkdir -p /opt/android-sdk/cmdline-tools
if [ ! -d "/opt/android-sdk/cmdline-tools/latest" ]; then
  curl -s -L -o /tmp/cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
  unzip -q -o /tmp/cmdline-tools.zip -d /opt/android-sdk/cmdline-tools/
  mv /opt/android-sdk/cmdline-tools/cmdline-tools /opt/android-sdk/cmdline-tools/latest || true
  rm -f /tmp/cmdline-tools.zip
fi

export ANDROID_HOME=/opt/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

echo "=== 3. ACCEPTING LICENSES & INSTALLING PLATFORMS ==="
yes | sdkmanager --licenses > /dev/null 2>&1 || true
sdkmanager "platforms;android-36" "build-tools;36.0.0" "platform-tools" "build-tools;35.0.0"

echo "=== 4. DOWNLOADING GRADLE 8.14.3 WRAPPER ==="
mkdir -p /root/.gradle/wrapper/dists/gradle-8.14.3-all/10utluxaxniiv4wxiphsi49nj
if [ ! -f "/root/.gradle/wrapper/dists/gradle-8.14.3-all/10utluxaxniiv4wxiphsi49nj/gradle-8.14.3-all.zip.ok" ]; then
  rm -f /root/.gradle/wrapper/dists/gradle-8.14.3-all/10utluxaxniiv4wxiphsi49nj/*.part
  curl -s -L --retry 5 --retry-delay 2 -o /root/.gradle/wrapper/dists/gradle-8.14.3-all/10utluxaxniiv4wxiphsi49nj/gradle-8.14.3-all.zip https://services.gradle.org/distributions/gradle-8.14.3-all.zip
  unzip -q -o /root/.gradle/wrapper/dists/gradle-8.14.3-all/10utluxaxniiv4wxiphsi49nj/gradle-8.14.3-all.zip -d /root/.gradle/wrapper/dists/gradle-8.14.3-all/10utluxaxniiv4wxiphsi49nj/
  touch /root/.gradle/wrapper/dists/gradle-8.14.3-all/10utluxaxniiv4wxiphsi49nj/gradle-8.14.3-all.zip.ok
fi

echo "=== 5. RUNNING NPM CAP:BUILD ==="
cd /app/applet
npm run cap:build

echo "=== 6. BUILDING ANDROID DEBUG APK ==="
cd /app/applet/android
chmod +x gradlew
./gradlew assembleDebug

echo "=== 7. VERIFYING APK ARTIFACT ==="
if [ -f "/app/applet/android/app/build/outputs/apk/debug/app-debug.apk" ]; then
  echo "APK BUILD SUCCESS!"
  ls -lh /app/applet/android/app/build/outputs/apk/debug/app-debug.apk
  mkdir -p /app/applet/public
  cp /app/applet/android/app/build/outputs/apk/debug/app-debug.apk /app/applet/public/app-debug.apk
else
  echo "ERROR: APK file not found!"
  exit 1
fi
