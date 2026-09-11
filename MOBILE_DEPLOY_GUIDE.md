# BLOGGE — MOBILE CLOUD RUN DEPLOYMENT GUIDE
### Complete Step-by-Step Manual for Android Mobile Users (Google Cloud Shell)

---

## OVERVIEW

This guide allows you to deploy the **Blogge API backend** to **Google Cloud Run** using **only an Android mobile phone** and the **Chrome browser** with **Google Cloud Shell**. No desktop computer is needed.

---

## PREREQUISITES & MOBILE SETUP

1. On your Android phone, open **Google Chrome**.
2. Tap the Chrome three-dot menu (**⋮**) at the top-right and enable **Desktop site** (recommended for easier navigation of Cloud Console).
3. Open: [https://console.cloud.google.com](https://console.cloud.google.com)
4. Sign in with your Google account (`websiteai583@gmail.com` or your GCP account).
5. Ensure you have an active Google Cloud Project (or tap the top project dropdown and tap **New Project**). Note your **Project ID** (e.g. `blogge-prod-12345`).
6. Ensure Billing is linked to the project (Cloud Run free tier includes 2 million free requests/month).

---

## STEP 1: OPEN CLOUD SHELL ON YOUR PHONE

1. In Google Cloud Console on Chrome, look at the top navigation bar.
2. Tap the **Cloud Shell icon** `[>_]` (Activate Cloud Shell) near the top right.
3. A terminal window will open at the bottom half of your screen.
4. If prompted to authorize Cloud Shell, tap **Authorize**.

---

## STEP 2: GET THE PROJECT INTO CLOUD SHELL

Choose **Option A** (Export from AI Studio) or **Option B** (Git clone / direct upload):

### Option A: Upload the Project ZIP from AI Studio
1. In AI Studio, tap Settings / Export -> **Download ZIP**.
2. In the mobile Cloud Shell window, tap the three-dot menu (**⋮**) in the Cloud Shell toolbar and select **Upload**.
3. Select the downloaded ZIP file from your Android Files / Downloads folder.
4. Once uploaded, run these commands in Cloud Shell:

```bash
unzip -q *.zip -d blogge-app
cd blogge-app
```

---

## STEP 3: DATABASE SETUP (PERSISTENT POSTGRESQL)

> ⚠️ **CRITICAL ARCHITECTURAL REQUIREMENT:**  
> Cloud Run containers are ephemeral and stateless. The backend strictly refuses to start in production (`NODE_ENV=production`) without a valid `DATABASE_URL`. Ephemeral local JSON storage (`/data/db.json`) is not permitted.

Choose **Option 1 (Simplest 2-Minute Mobile Setup)** or **Option 2 (Google Cloud SQL)**:

### Option 1: Simplest Mobile Option — Free Managed PostgreSQL (Neon / Supabase)
1. On your mobile browser, open a new tab to [https://neon.tech](https://neon.tech) or [https://supabase.com](https://supabase.com).
2. Sign in with Google with 1 tap.
3. Tap **Create Project** -> Select Region: **Singapore (asia-southeast1)**.
4. Copy the **Connection String** (`DATABASE_URL`). It looks like:  
   `postgresql://neondb_owner:npg_xxxx@ep-cool-fog-12345.asia-southeast-1.neon.tech/neondb?sslmode=require`

### Option 2: Google Cloud SQL (Within the same GCP Project)
Run this single command in Cloud Shell to create a Cloud SQL PostgreSQL instance:

```bash
gcloud sql instances create blogge-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-southeast1 \
  --root-password="REPLACE_WITH_A_STRONG_PASSWORD"
```

Create the database:
```bash
gcloud sql databases create blogge --instance=blogge-db
```

---

## STEP 4: CONFIGURE GCP PROJECT & ENABLE APIS

Tap and copy these exact commands into your mobile Cloud Shell terminal:

### 1. Set your Project ID
Replace `YOUR_PROJECT_ID` with your actual Google Cloud Project ID:

```bash
gcloud config set project YOUR_PROJECT_ID
```

### 2. Enable Cloud Run and Cloud Build APIs
```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com
```

---

## STEP 5: DEPLOY BACKEND TO CLOUD RUN

You can run the interactive deployment script or run the direct `gcloud` command:

### Method A: Using the automated deploy script
```bash
chmod +x deploy.sh
./deploy.sh
```
*The script will prompt you for your `DATABASE_URL` and auto-generate a secure `SESSION_SECRET`.*

### Method B: Direct gcloud deploy command (Environment Variables)
Generate a secure random session secret:
```bash
SESSION_SECRET=$(openssl rand -hex 32)
```

Run the deploy command (replace `YOUR_DATABASE_URL` with your actual PostgreSQL URL):
```bash
gcloud run deploy blogge-api \
  --source . \
  --region asia-southeast1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars "NODE_ENV=production,PORT=3000,SESSION_SECRET=${SESSION_SECRET},DATABASE_URL=YOUR_DATABASE_URL,ADMIN_EMAIL=websiteai583@gmail.com"
```

### Method C: Enterprise Production with Google Secret Manager (Recommended)
This method keeps `DATABASE_URL` and `SESSION_SECRET` fully encrypted inside Google Cloud Secret Manager:

1. Enable Secret Manager API:
```bash
gcloud services enable secretmanager.googleapis.com
```

2. Store `DATABASE_URL` in Secret Manager:
```bash
echo -n "YOUR_SUPABASE_OR_POSTGRES_URL" | gcloud secrets create database-url --data-file=-
```

3. Store `SESSION_SECRET` in Secret Manager:
```bash
openssl rand -hex 32 | tr -d '\n' | gcloud secrets create session-secret --data-file=-
```

4. Grant the default Cloud Run service account access to Secret Manager:
```bash
PROJECT_NUM=$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')
gcloud secrets add-iam-policy-binding database-url \
  --member="serviceAccount:${PROJECT_NUM}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding session-secret \
  --member="serviceAccount:${PROJECT_NUM}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

5. Deploy Cloud Run referencing the secrets:
```bash
gcloud run deploy blogge-api \
  --source . \
  --region asia-southeast1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars "NODE_ENV=production,PORT=3000,ADMIN_EMAIL=websiteai583@gmail.com" \
  --set-secrets "DATABASE_URL=database-url:latest,SESSION_SECRET=session-secret:latest"
```

*Wait 2–3 minutes for Cloud Build to build the container and deploy to Cloud Run.*

Upon completion, Cloud Run will output your live HTTPS service URL:
```text
Service [blogge-api] revision [blogge-api-00001-xyz] has been deployed and is serving 100 percent of traffic.
Service URL: https://blogge-api-xxxxxxxx-as.a.run.app
```

---

## STEP 6: VERIFY THE LIVE BACKEND (POST-DEPLOYMENT TESTS)

Copy your live Cloud Run URL (e.g. `https://blogge-api-xxxxxxxx-as.a.run.app`) and test it directly in Cloud Shell or mobile Chrome:

### 1. Test Health Endpoint
```bash
curl -i https://YOUR_LIVE_URL/api/health
```
**Expected Response:**
- HTTP Status: `200 OK`
- JSON Body:
  ```json
  {
    "success": true,
    "status": "online",
    "environment": "production",
    "database": "postgresql",
    "postgresConnected": true,
    "service": "blogge-api"
  }
  ```

### 2. Test Account Creation (Signup)
```bash
curl -i -X POST https://YOUR_LIVE_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Production Tester","email":"testuser@example.com","password":"Password123!"}'
```
**Expected Response:**
- HTTP Status: `201 Created`
- Returns user object and session token.

### 3. Test Login
```bash
curl -i -X POST https://YOUR_LIVE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"Password123!"}'
```
**Expected Response:**
- HTTP Status: `200 OK`
- Returns JWT/HMAC token.

### 4. Test Authenticated Session Verification
Replace `YOUR_TOKEN` with the token received from login:
```bash
curl -i -X GET https://YOUR_LIVE_URL/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected Response:**
- HTTP Status: `200 OK`
- Returns authenticated user details.

### 5. Test Capacitor Android CORS Preflight
```bash
# Test https://localhost origin
curl -i -X OPTIONS https://YOUR_LIVE_URL/api/auth/login \
  -H "Origin: https://localhost" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization"

# Test capacitor://localhost origin
curl -i -X OPTIONS https://YOUR_LIVE_URL/api/auth/login \
  -H "Origin: capacitor://localhost" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization"
```
**Expected Response:**
- HTTP Status: `204 No Content`
- Headers:
  - `Access-Control-Allow-Origin: https://localhost` (or `capacitor://localhost`)
  - `Access-Control-Allow-Credentials: true`
  - `Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS`


---

## STEP 7: CONNECT THE ANDROID APK TO THE LIVE BACKEND

> ⚠️ **IMPORTANT WARNING:**  
> **DO NOT USE THE OLD APK VERSION 1.3.3.**  
> That APK was built with an empty `VITE_API_URL` and cannot communicate with the backend. You must build a new APK following these steps.

### 1. Insert the Live URL into the App
In your AI Studio workspace or project root:
Update `.env`:
```env
VITE_API_URL=https://YOUR_LIVE_URL
```
And verify `src/utils/safeFetch.ts`:
Set `DEFAULT_PRODUCTION_API_URL`:
```ts
export const DEFAULT_PRODUCTION_API_URL = "https://YOUR_LIVE_URL";
```

### 2. Increment Version & Rebuild Frontend
In `android/app/build.gradle`:
- Set `versionCode 7`
- Set `versionName "1.3.4"`

Run:
```bash
npm run build
npx cap sync android
```

### 3. Build New Production Android APK
```bash
./build_final_apk.sh
```
Or directly:
```bash
cd android && ./gradlew assembleDebug && cd ..
```

### 4. Install & Test on Android Phone
1. Download the newly generated APK (`app-debug.apk`) to your phone.
2. Tap the APK in your Android Downloads to install/update.
3. Open the **Blogge** app.
4. Execute the Physical Android Test Checklist below.

---

## STEP 8: PHYSICAL ANDROID TEST PROTOCOL & VERIFICATION CHECKLIST

Execute these 7 tests in order on your physical Android device:

| # | Test Case | Action | Expected Behavior | Verification / Pass Criteria |
|---|---|---|---|---|
| **1** | **Clean Install** | Transfer `app-debug.apk` to phone. Open Files/Downloads, tap to install. | Package installer displays App icon, name (`Blogge`), and requests zero invasive permissions. Installs cleanly without signature parse errors. | App opens to splash screen, initializes Capacitor runtime, and loads local web shell (`https://localhost`). |
| **2** | **Network Traffic Compliance** | Launch app on cellular data (LTE/5G) and Wi-Fi. Observe network requests to `https://YOUR_LIVE_URL/api/health`. | Android OS enforces `usesCleartextTraffic="false"`. All outbound API traffic is strictly HTTPS. Capacitor internal assets (`https://localhost`) load without network blocking. | Health status indicator shows Online. No SSL/TLS handshake exceptions or cleartext security alerts. |
| **3** | **User Registration** | Tap **Sign Up** -> Enter Name, unique Email, and Password -> Submit. | Instant transition into authenticated dashboard. Backend assigns user record and HMAC-SHA256 session token. | No infinite reload loops. User name and avatar appear in header. Token stored securely in local storage. |
| **4** | **Session Persistence** | Swipe up to open Android App Switcher. Swipe Blogge away (force stop). Re-launch Blogge from App Drawer. | App reads cached credentials from persistent storage. Validates session with backend silently in background. | User remains logged in. Dashboard renders immediately without prompting for credentials. |
| **5** | **Offline Resilience** | Enable **Airplane Mode** (disable Wi-Fi & Cellular). Open Blogge and navigate through cached posts. | App does NOT crash or wipe session. Displays non-intrusive offline indicator: *"Offline Mode - Reconnecting..."*. Cached posts and user state remain accessible. | Disabling Airplane Mode automatically recovers connection and synchronizes without requiring app restart. |
| **6** | **Content Creation** | Tap **New Post** -> Enter title, category, and markdown body -> Tap **Publish**. | Content sanitization runs client and server-side. Post is committed to remote PostgreSQL (`blogge_collections`). | Post appears at top of feed on mobile and is instantly retrievable across other sessions and devices. |
| **7** | **Graceful Logout** | Navigate to Settings / Profile -> Tap **Log Out**. | Clears `blogge_auth_token` and `blogge_current_user` from device storage. Notifies backend to invalidate active session. | Immediate redirect to sign-in / explore screen. Subsequent app restarts open to unauthenticated state. |
