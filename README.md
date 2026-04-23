# SwiftFlow

SwiftFlow is a Johor-Singapore commuter web app focused on train, bus, carpool, border readiness, notifications, credits, and rewards.

The project has:

- a `frontend/` Vite app
- a `backend/` Node.js API
- Firebase Anonymous Auth for silent guest sessions
- Firestore for per-user persisted state
- Firebase Storage for profile photos
- optional Google Maps Platform features
- optional Cloud Scheduler / Cloud Tasks automation
- optional Cloud Translation support

## Stack

- Frontend: Vite, vanilla JS, CSS
- Backend: Node.js HTTP server
- Auth: Firebase Anonymous Auth
- Database: Firestore
- File storage: Firebase Storage
- AI helper: Vertex AI / Gemini
- Deployment target: Google Cloud Run

## Repository Structure

```text
swiftFlow/
├── frontend/
├── backend/
├── deploy.sh
├── PROJECT_STATUS.md
└── README.md
```

## Current Product Behavior

- Users do not see a login page.
- The frontend creates a silent Firebase anonymous session.
- Each browser/device gets its own Firebase UID.
- Backend APIs require a Firebase ID token unless local dev fallback is enabled.
- Profile photos upload to Firebase Storage.
- Train and bus confirmations can schedule reminder/expiry jobs.
- Google Maps, Places autocomplete, and route ETA are optional.

## Prerequisites

Install these first:

- Node.js 20+ or 22+
- npm
- Google Cloud SDK (`gcloud`)
- a Google Cloud project
- a Firebase project linked to the same Google Cloud project

Check versions:

```bash
node -v
npm -v
gcloud --version
```

## 1. Clone And Install

From the repo root:

```bash
cd /Users/howy/Desktop/swiftFlow

npm --prefix frontend install
npm --prefix backend install
```

## 2. Firebase Setup

In Firebase Console for project `personal-claw-1`:

### Authentication

1. Open `Authentication`
2. Open `Sign-in method`
3. Enable `Anonymous`

This is required because SwiftFlow uses silent anonymous auth.

### Authorized domains

Add these domains in Firebase Authentication settings:

- `localhost`
- `127.0.0.1`
- your frontend Cloud Run domain, for example:
  - `swiftflow-frontend-840535137820.us-central1.run.app`

If this is missing, the frontend may load but backend calls will return:

```json
{"error":"Unauthorized","message":"Sign in is required before calling this API."}
```

### Firestore

1. Open `Firestore Database`
2. Create the database in Native mode if it does not already exist

### Storage

1. Open `Storage`
2. Create the default bucket if it does not already exist
3. Your current bucket name is:

```text
personal-claw-1.firebasestorage.app
```

You also need storage rules that allow the authenticated Firebase user to upload profile photos.

## 3. Google Cloud Setup

Enable required APIs:

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  cloudscheduler.googleapis.com \
  cloudtasks.googleapis.com \
  translate.googleapis.com \
  iamcredentials.googleapis.com \
  containerregistry.googleapis.com \
  --project personal-claw-1
```

If you want Maps features, also enable in Google Cloud Console:

- Maps JavaScript API
- Places API

If you want route/directions behavior, make sure billing is enabled for the Maps project.

## 4. Backend Environment Setup

You can either:

- export variables directly in your terminal, or
- copy the example values into your own local env workflow

Example file: [backend/.env.example](/Users/howy/Desktop/swiftFlow/backend/.env.example)

Key variables:

- `PORT`
- `GOOGLE_CLOUD_PROJECT`
- `FIREBASE_PROJECT_ID`
- `VERTEX_AI_LOCATION`
- `GEMINI_MODEL`
- `TRANSLATION_ENABLED`
- `TRANSLATION_FALLBACK_LANGUAGE`
- `BACKEND_BASE_URL`
- `INTERNAL_TASK_SECRET`
- `CLOUD_TASKS_LOCATION`
- `CLOUD_TASKS_QUEUE`
- `TASK_INVOKER_SERVICE_ACCOUNT`
- `ALLOWED_ORIGINS`
- `ALLOW_UNAUTHENTICATED_DEV`
- `DEV_USER_ID`

### Local backend example

```bash
cd /Users/howy/Desktop/swiftFlow/backend

export PORT=3001
export GOOGLE_CLOUD_PROJECT=personal-claw-1
export FIREBASE_PROJECT_ID=personal-claw-1
export VERTEX_AI_LOCATION=us-central1
export GEMINI_MODEL=gemini-1.5-flash
export TRANSLATION_ENABLED=true
export TRANSLATION_FALLBACK_LANGUAGE=en
export ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
export ALLOW_UNAUTHENTICATED_DEV=false

npm run dev
```

### Local backend with unauthenticated dev fallback

Only use this for local debugging if you want to bypass Firebase token requirements:

```bash
export ALLOW_UNAUTHENTICATED_DEV=true
export DEV_USER_ID=local-dev-user
```

## 5. Frontend Environment Setup

You can either:

- create `frontend/.env`, or
- inject the values during build/deploy

Example file: [frontend/.env.example](/Users/howy/Desktop/swiftFlow/frontend/.env.example)

Required build-time variables:

- `VITE_API_BASE_URL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_GOOGLE_MAPS_API_KEY` (optional)

### Local frontend `.env`

Create `frontend/.env` with something like:

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_WEB_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=personal-claw-1.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=personal-claw-1
VITE_FIREBASE_APP_ID=YOUR_FIREBASE_WEB_APP_ID
VITE_FIREBASE_STORAGE_BUCKET=personal-claw-1.firebasestorage.app
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

If you do not want Google Maps features locally, leave `VITE_GOOGLE_MAPS_API_KEY` empty.

## 6. Run Locally

Start backend:

```bash
cd /Users/howy/Desktop/swiftFlow/backend
npm run dev
```

Start frontend in another terminal:

```bash
cd /Users/howy/Desktop/swiftFlow/frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

## 7. Local Testing Notes

### Recommended local mode

Use:

- frontend -> local backend
- `VITE_API_BASE_URL=http://localhost:3001`
- backend `ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"`

### Local frontend calling cloud backend

If your frontend is local but backend is Cloud Run, backend must allow both local origins:

```bash
ALLOWED_ORIGINS="https://your-frontend-cloud-run-url,http://localhost:5173,http://127.0.0.1:5173"
```

### Common first-load issue

If frontend shows a backend fetch error on first load:

- backend may be cold-starting
- Firebase anonymous auth may not be ready yet
- backend may reject request because no token was attached
- CORS may not allow your exact frontend origin

## 8. Deployment Using `deploy.sh`

The preferred production deploy path is:

```bash
cd /Users/howy/Desktop/swiftFlow
./deploy.sh
```

Before running it:

```bash
gcloud auth login
gcloud config set project personal-claw-1
```

Then export the required variables:

```bash
export PROJECT_ID="personal-claw-1"
export REGION="us-central1"
export INTERNAL_TASK_SECRET="$(openssl rand -hex 32)"
export FIREBASE_API_KEY="your_firebase_web_api_key"
export FIREBASE_APP_ID="your_firebase_web_app_id"
export FIREBASE_AUTH_DOMAIN="personal-claw-1.firebaseapp.com"
export FIREBASE_STORAGE_BUCKET="personal-claw-1.firebasestorage.app"
export GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
export EXTRA_ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
```

Then run:

```bash
./deploy.sh
```

### What `deploy.sh` does

It:

1. enables required Google Cloud APIs
2. ensures the Cloud Tasks queue exists
3. ensures service accounts exist where needed
4. deploys backend to Cloud Run
5. reads the real backend URL
6. creates or updates the Cloud Scheduler job
7. builds frontend with the correct Vite env vars
8. deploys frontend to Cloud Run
9. reads the real frontend URL
10. patches backend `ALLOWED_ORIGINS` and `BACKEND_BASE_URL`

## 9. Manual Cloud Run Deployment

If you do not want to use the script, these are the manual steps.

### Step 1: deploy backend

```bash
gcloud run deploy swiftflow-backend \
  --source backend \
  --region us-central1 \
  --project personal-claw-1 \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=personal-claw-1,FIREBASE_PROJECT_ID=personal-claw-1,VERTEX_AI_LOCATION=us-central1,GEMINI_MODEL=gemini-1.5-flash,TRANSLATION_ENABLED=true,TRANSLATION_FALLBACK_LANGUAGE=en,BACKEND_BASE_URL=,INTERNAL_TASK_SECRET=YOUR_SECRET,CLOUD_TASKS_LOCATION=us-central1,CLOUD_TASKS_QUEUE=swiftflow-trip-tasks,TASK_INVOKER_SERVICE_ACCOUNT=,ALLOW_UNAUTHENTICATED_DEV=false,ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173"
```

### Step 2: get backend URL

```bash
gcloud run services describe swiftflow-backend \
  --region us-central1 \
  --project personal-claw-1 \
  --format='value(status.url)'
```

### Step 3: build frontend image

```bash
gcloud builds submit frontend \
  --config frontend/cloudbuild.yaml \
  --project personal-claw-1 \
  --substitutions "_IMAGE=gcr.io/personal-claw-1/swiftflow-frontend,_VITE_API_BASE_URL=https://YOUR_BACKEND_URL,_VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY,_VITE_FIREBASE_AUTH_DOMAIN=personal-claw-1.firebaseapp.com,_VITE_FIREBASE_PROJECT_ID=personal-claw-1,_VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID,_VITE_FIREBASE_STORAGE_BUCKET=personal-claw-1.firebasestorage.app,_VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY"
```

### Step 4: deploy frontend

```bash
gcloud run deploy swiftflow-frontend \
  --image gcr.io/personal-claw-1/swiftflow-frontend \
  --region us-central1 \
  --project personal-claw-1 \
  --allow-unauthenticated \
  --port 80
```

### Step 5: update backend with real allowed origins

```bash
gcloud run services update swiftflow-backend \
  --region us-central1 \
  --project personal-claw-1 \
  --update-env-vars "BACKEND_BASE_URL=https://YOUR_BACKEND_URL,ALLOWED_ORIGINS=https://YOUR_FRONTEND_URL,http://localhost:5173,http://127.0.0.1:5173"
```

## 10. Background Jobs Setup

SwiftFlow supports:

- broad ticket expiry cleanup with Cloud Scheduler
- per-trip reminder/expiry with Cloud Tasks

### Cloud Tasks queue

```bash
gcloud tasks queues create swiftflow-trip-tasks \
  --location=us-central1 \
  --max-dispatches-per-second=5 \
  --max-concurrent-dispatches=10 \
  --project personal-claw-1
```

### Cloud Scheduler job

```bash
gcloud scheduler jobs create http swiftflow-expire-tickets \
  --location us-central1 \
  --schedule "*/5 * * * *" \
  --time-zone "UTC" \
  --uri "https://YOUR_BACKEND_URL/api/cron/expire-tickets" \
  --http-method POST \
  --headers "X-SwiftFlow-Task-Secret=YOUR_SECRET" \
  --oidc-service-account-email "swiftflow-scheduler@personal-claw-1.iam.gserviceaccount.com" \
  --oidc-token-audience "https://YOUR_BACKEND_URL" \
  --project personal-claw-1
```

## 11. Smoke Tests

### Backend health

```bash
curl -s https://swiftflow-backend-840535137820.us-central1.run.app/health
```

Expected shape:

```json
{"status":"ok","service":"swiftflow-backend"}
```

### Scheduler endpoint

```bash
curl -s -X POST https://swiftflow-backend-840535137820.us-central1.run.app/api/cron/expire-tickets \
  -H "X-SwiftFlow-Task-Secret: YOUR_SECRET"
```

### Queue and scheduler inspection

```bash
gcloud tasks queues describe swiftflow-trip-tasks \
  --location us-central1 \
  --project personal-claw-1

gcloud scheduler jobs describe swiftflow-expire-tickets \
  --location us-central1 \
  --project personal-claw-1
```

## 12. Troubleshooting

### Problem: frontend says backend could not be reached

Possible causes:

- Cloud Run backend cold start
- wrong backend URL baked into frontend
- CORS origin mismatch
- temporary network failure

Check:

```bash
curl -s https://swiftflow-backend-840535137820.us-central1.run.app/health
```

### Problem: backend returns `Unauthorized`

Example:

```json
{"error":"Unauthorized","message":"Sign in is required before calling this API."}
```

This usually means:

- Firebase anonymous auth is not enabled
- frontend domain is not in Firebase Authorized Domains
- Firebase frontend env vars are wrong
- frontend reached backend before a Firebase ID token was ready

Fix:

1. enable Anonymous auth in Firebase
2. add frontend domain to Authorized Domains
3. confirm frontend build-time Firebase env vars
4. redeploy frontend

### Problem: profile photo upload fails

Check:

- Firebase Storage is enabled
- bucket name is `personal-claw-1.firebasestorage.app`
- Storage rules allow the signed-in Firebase user
- Anonymous auth is enabled

### Problem: Google Maps box shows fallback card

Check:

- `VITE_GOOGLE_MAPS_API_KEY`
- Maps JavaScript API enabled
- Places API enabled
- browser key allowed referrers
- billing enabled

### Problem: deployed frontend sometimes fails only on first load

Likely cause:

- backend cold start

Practical mitigation:

```bash
gcloud run services update swiftflow-backend \
  --region us-central1 \
  --project personal-claw-1 \
  --min-instances 1
```

## 13. Useful Commands

### Local build

```bash
npm --prefix frontend run build
node --check backend/src/server.js
```

### View backend logs

```bash
gcloud run services logs read swiftflow-backend \
  --region us-central1 \
  --project personal-claw-1 \
  --limit 100
```

### View frontend logs

```bash
gcloud run services logs read swiftflow-frontend \
  --region us-central1 \
  --project personal-claw-1 \
  --limit 100
```

## 14. Important Limits

- payments are mock only
- carpool is mock/demo only
- anonymous users are browser/device scoped
- no real transport provider integration
- no real government passport verification
- no real payment gateway integration

## 15. Related Files

- [PROJECT_STATUS.md](/Users/howy/Desktop/swiftFlow/PROJECT_STATUS.md)
- [deploy.sh](/Users/howy/Desktop/swiftFlow/deploy.sh)
- [backend/.env.example](/Users/howy/Desktop/swiftFlow/backend/.env.example)
- [frontend/.env.example](/Users/howy/Desktop/swiftFlow/frontend/.env.example)
