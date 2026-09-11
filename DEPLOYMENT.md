# Blogge — Complete Real Production Deployment Guide

---

## 1. Architecture Overview

```
[ Blogge Android APK ]
       │  (HTTPS directly over Mobile Data or Wi-Fi)
       ▼
[ Google Cloud Run ] (Public API: https://blogge-api-xxxx-as.a.run.app)
       │  (PORT 3000, Express, Stateless Container)
       ▼
[ Managed PostgreSQL Database ] (Supabase / Neon / Google Cloud SQL)
```

---

## 2. Recommended Database Setup: Option A — Supabase (Recommended for Mobile)

Supabase provides free, managed PostgreSQL with zero maintenance and SSL enabled by default.

### Step-by-Step Instructions:
1. Open [https://supabase.com](https://supabase.com) on your browser and sign up or log in.
2. Tap **"New Project"**.
3. Choose an Organization, enter project name: `blogge-db`.
4. Generate or enter a strong database password (store it securely).
5. Select the closest Region (e.g., `Southeast Asia (Singapore)`).
6. Tap **"Create new project"** and wait ~1-2 minutes for provisioning.
7. Go to **Project Settings** (gear icon) -> **Database**.
8. Scroll to **Connection string** -> Select **URI** mode.
9. Copy the connection string. It looks like:
   ```text
   postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
10. Replace `[YOUR_PASSWORD]` with the database password you created in step 4.

---

## 3. Option B — Neon PostgreSQL

1. Open [https://neon.tech](https://neon.tech) and sign up with GitHub/Google.
2. Tap **"Create Project"**, name it `blogge-db`.
3. Select region `ap-southeast-1` (Singapore) or closest to your users.
4. Tap **"Create Project"**.
5. Copy the connection string displayed on the Neon Dashboard:
   ```text
   postgresql://[user]:[password]@[endpoint].neon.tech/neondb?sslmode=require
   ```

---

## 4. Option C — Google Cloud SQL (PostgreSQL)

If you prefer all resources inside Google Cloud:
1. In Google Cloud Console, navigate to **Cloud SQL** -> **Create Instance**.
2. Select **PostgreSQL**.
3. Set Instance ID to `blogge-postgres`, specify a root password.
4. Under Configuration, choose Cloud SQL edition and region `asia-southeast1`.
5. Under Connections, enable **Public IP** or connect via Cloud Run Cloud SQL connector.
6. Connection string format:
   ```text
   postgresql://postgres:[PASSWORD]@[PUBLIC_IP]:5432/blogge
   ```

---

## 5. Google Cloud Run Deployment Commands

### From Google Cloud Shell:

```bash
# 1. Set your project ID
gcloud config set project YOUR_PROJECT_ID

# 2. Enable required Google Cloud APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 3. Deploy the backend API to Cloud Run
gcloud run deploy blogge-api \
  --source . \
  --region asia-southeast1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars NODE_ENV=production,PORT=3000 \
  --set-env-vars DATABASE_URL="postgresql://postgres.xxx:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" \
  --set-env-vars SESSION_SECRET="A_STRONG_RANDOM_SECRET_AT_LEAST_32_CHARS"
```

---

## 6. Mobile-Only Deployment Guide (মোবাইল দিয়ে ডিপ্লয় করার সহজ নিয়ম - বাংলা)

যদি আপনার কাছে কোনো কম্পিউটার না থাকে এবং শুধুমাত্র একটি অ্যান্ড্রয়েড ফোন থাকে, তবে নিচের ধাপগুলো অনুসরণ করে ডিপ্লয় করুন:

### ধাপ ১: গুগল ক্লাউড শেল (Google Cloud Shell) ওপেন করুন
1. আপনার ফোনে **Google Chrome** ব্রাউজার ওপেন করুন।
2. [https://shell.cloud.google.com](https://shell.cloud.google.com) সাইটে যান।
3. Chrome মেনু (ডানদিকের ৩ ডট) থেকে **"Desktop site"** টিক চিহ্ন দিন।
4. একটি কালো টার্মিনাল স্ক্রিন চালু হবে।

### ধাপ ২: প্রজেক্ট ফাইল ক্লাউড শেলে আপলোড করুন
1. ক্লাউড শেল টার্মিনালের উপরের বারে থাকা **৩ ডট (...)** অথবা **Upload** আইকনে চাপ দিন।
2. আপনার ফোনের মেমোরি থেকে প্রজেক্টের ZIP ফাইল সিলেক্ট করে আপলোড করুন।
3. টার্মিনালে নিচের কমান্ড লিখে আনজিপ করুন:
   ```bash
   unzip blogge-project.zip -d blogge
   cd blogge
   ```

### ধাপ ৩: সুপাবেস (Supabase) ডেটাবেস সংযোগ স্ট্রিং তৈরি করুন
1. ফোনে নতুন ট্যাবে [supabase.com](https://supabase.com) এ ফ্রি অ্যাকাউন্ট খুলে একটি ডেটাবেস বানান।
2. **Project Settings -> Database -> Connection string** থেকে URI কপি করুন।
3. পাসওয়ার্ড বসিয়ে আপনার সম্পূর্ণ `DATABASE_URL` তৈরি করে মোবাইলের নোটপ্যাডে সেভ রাখুন।

### ধাপ ৪: ক্লাউড রানে ডিপ্লয় কমান্ড রান করুন
ক্লাউড শেল টার্মিনালে নিচের কমান্ডটি পেস্ট করুন (আপনার নিজস্ব তথ্য দিয়ে):

```bash
gcloud run deploy blogge-api \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars NODE_ENV=production,PORT=3000,DATABASE_URL="আপনার_কপিকৃত_SUPABASE_URL",SESSION_SECRET="my_super_secret_key_12345678901234"
```

### ধাপ ৫: পাবলিক API URL কপি করুন
কমান্ড শেষ হলে ক্লাউড শেল টার্মিনালে একটি লিংক দেখতে পাবেন:
`Service URL: https://blogge-api-xxxx-as.a.run.app`
এই লিংকটি কপি করে নিন।

### ধাপ ৬: API Health পরীক্ষা করুন
আপনার মোবাইলের ক্রোম ব্রাউজারে লিংকটির শেষে `/api/health` যোগ করে ওপেন করুন:
`https://blogge-api-xxxx-as.a.run.app/api/health`
স্ক্রিনে নিচের মতো JSON রেসপন্স দেখতে পাবেন:
```json
{
  "success": true,
  "status": "online",
  "database": "postgresql",
  "postgresConnected": true
}
```

### ধাপ ৭: অ্যান্ড্রয়েড APK তৈরি ও ডাউনলোড
পাবলিক URL পাওয়ার পর:
1. টার্মিনালে কমান্ড দিন:
   ```bash
   export VITE_API_URL="https://blogge-api-xxxx-as.a.run.app"
   npm run build
   npx cap sync android
   cd android && ./gradlew assembleDebug
   ```
2. তৈরি হওয়া APK ফাইলটি ক্লাউড শেলের **Download File** অপশন ব্যবহার করে আপনার ফোনে ডাউনলোড করুন:
   পাথ: `/home/YOUR_USERNAME/blogge/android/app/build/outputs/apk/debug/app-debug.apk`
3. ফোনে ইনস্টল করে রেজিস্ট্রেশন এবং লগইন টেস্ট করুন।
