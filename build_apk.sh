#!/usr/bin/env bash
set -e

# 1. Install Java 21 & tools
DEBIAN_FRONTEND=noninteractive apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends openjdk-21-jdk-headless curl unzip

export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export ANDROID_HOME=/opt/android-sdk
export PATH=$JAVA_HOME/bin:$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# 2. Android SDK Setup
mkdir -p /opt/android-sdk/cmdline-tools
if [ ! -d "/opt/android-sdk/cmdline-tools/latest" ]; then
  curl -s -L -o /tmp/cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
  unzip -q -o /tmp/cmdline-tools.zip -d /opt/android-sdk/cmdline-tools/
  mv /opt/android-sdk/cmdline-tools/cmdline-tools /opt/android-sdk/cmdline-tools/latest || true
  rm -f /tmp/cmdline-tools.zip
fi

yes | sdkmanager --licenses > /dev/null 2>&1 || true
sdkmanager "platforms;android-36" "build-tools;36.0.0" "platform-tools" "build-tools;35.0.0"

# 3. Gradle Wrapper pre-cache
mkdir -p /root/.gradle/wrapper/dists/gradle-8.14.3-all/10utluxaxniiv4wxiphsi49nj
if [ ! -f "/root/.gradle/wrapper/dists/gradle-8.14.3-all/10utluxaxniiv4wxiphsi49nj/gradle-8.14.3-all.zip.ok" ]; then
  rm -f /root/.gradle/wrapper/dists/gradle-8.14.3-all/10utluxaxniiv4wxiphsi49nj/*.part
  curl -s -L --retry 5 --retry-delay 2 -o /root/.gradle/wrapper/dists/gradle-8.14.3-all/10utluxaxniiv4wxiphsi49nj/gradle-8.14.3-all.zip https://services.gradle.org/distributions/gradle-8.14.3-all.zip
  unzip -q -o /root/.gradle/wrapper/dists/gradle-8.14.3-all/10utluxaxniiv4wxiphsi49nj/gradle-8.14.3-all.zip -d /root/.gradle/wrapper/dists/gradle-8.14.3-all/10utluxaxniiv4wxiphsi49nj/
  touch /root/.gradle/wrapper/dists/gradle-8.14.3-all/10utluxaxniiv4wxiphsi49nj/gradle-8.14.3-all.zip.ok
fi

# 4. Capacitor sync
npm run cap:build

# 5. Gradle assembleDebug
cd android
chmod +x gradlew
./gradlew assembleDebug

# 6. Verify exact APK output
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
  echo "SUCCESS: APK GENERATED AT android/app/build/outputs/apk/debug/app-debug.apk"
  ls -lh app/build/outputs/apk/debug/app-debug.apk
  cd ..
  mkdir -p /app/applet/public /app/applet/APK_DOWNLOAD /app/applet/.build-outputs
  cp android/app/build/outputs/apk/debug/app-debug.apk /app/applet/public/app-debug.apk
  cp android/app/build/outputs/apk/debug/app-debug.apk /app/applet/APK_DOWNLOAD/app-debug.apk
  cp android/app/build/outputs/apk/debug/app-debug.apk /app/applet/.build-outputs/app-debug.apk
else
  echo "FAILURE: APK not found!"
  exit 1
fi
