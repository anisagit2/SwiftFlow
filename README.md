# SwiftFlow

Project structure:

- `frontend/`: Vite frontend app
- `backend/`: Node backend with Firebase Auth, Firestore persistence, and Vertex AI helpers

Frontend:

- `cd frontend`
- `npm run dev`

Backend:

- `cd backend`
- `npm run dev`

Backend env:

- Copy `backend/.env.example` into your local env setup
- `ALLOW_UNAUTHENTICATED_DEV=false` is the production-safe default
- For local development only, temporarily set `ALLOW_UNAUTHENTICATED_DEV=true` if you need to bypass Firebase sign-in
- Set `ALLOWED_ORIGINS` to the exact frontend origins allowed to call the backend, comma-separated
- Set `INTERNAL_TASK_SECRET` before enabling Cloud Scheduler or Cloud Tasks. Scheduler/tasks must send it as `X-SwiftFlow-Task-Secret`.
- Set `BACKEND_BASE_URL`, `CLOUD_TASKS_LOCATION`, `CLOUD_TASKS_QUEUE`, and optionally `TASK_INVOKER_SERVICE_ACCOUNT` to enable precise Cloud Tasks reminders/expiry jobs.
- Set `TRANSLATION_ENABLED=true` to translate alert/suggestion responses based on the browser `Accept-Language` header.

Frontend env:

- Copy `frontend/.env.example` into `frontend/.env`
- Add your Firebase web app config so the frontend can create a silent anonymous Firebase session, attach a Firebase ID token to API requests, and upload profile photos to Firebase Storage
- Optional: set `VITE_GOOGLE_MAPS_API_KEY` to enable Google Places autocomplete, interactive pickup maps, and route-based walking ETA estimates. Restrict the key to your frontend domains in Google Cloud.

Backend API coverage:

- `GET /api/state`: full frontend-shaped snapshot
- `POST /api/state/reset`: reset the persisted demo state back to seed data
- `GET /api/options`: selector options for locations, times, and payment methods
- `GET/PATCH /api/bookings/train`: RTS booking details and updates
- `GET/PATCH /api/bookings/bus`: fallback bus details and updates
- `GET /api/bookings/carpool`: carpool drivers and selected ride
- `PATCH /api/bookings/carpool/select-driver`: switch selected driver
- `PATCH /api/bookings/carpool/payment`: update selected driver payment
- `POST /api/check-in`: accept pre-check-in flow
- `POST /api/alerts/accept`: accept the alert-driven slot shift
- `GET /api/credits`: credits summary and activity
- `GET /api/rewards`: rewards marketplace data
- `POST /api/rewards/:rewardId/redeem`: redeem a reward
- `GET /api/profile`: pass/profile summary
- `PATCH /api/profile`: create or edit the signed-in user's profile
- `POST /api/cron/expire-tickets`: internal Cloud Scheduler endpoint that expires confirmed tickets after departure
- `POST /api/tasks/expire-ticket`: internal Cloud Tasks endpoint for one exact ticket expiry
- `POST /api/tasks/send-trip-reminder`: internal Cloud Tasks endpoint for one exact trip reminder
- Alert details and Gemini exploration suggestions can be translated server-side with Cloud Translation API.

Persistence:

- Backend state is structured per user in Firestore under `users/{userId}/...`
- In local development, the backend can fall back to `DEV_USER_ID` only when `ALLOW_UNAUTHENTICATED_DEV=true`
- Use the Profile page `Reset Demo Data` action to reseed the active user's state for repeated testing

Production deploy:

Fast path using the repo script:

```bash
export PROJECT_ID=personal-claw-1
export REGION=us-central1
export BACKEND_URL=https://swiftflow-backend-840535137820.us-central1.run.app
export FRONTEND_URL=https://swiftflow-frontend-840535137820.us-central1.run.app
export INTERNAL_TASK_SECRET="$(openssl rand -hex 32)"
export GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY

./deploy.sh
```

The script will:

- Enable required APIs.
- Create the `swiftflow-trip-tasks` Cloud Tasks queue if missing.
- Create Scheduler/Tasks service accounts if missing and grant Cloud Run invoke access.
- Deploy the backend with Scheduler/Tasks env vars.
- Create or update the `swiftflow-expire-tickets` Cloud Scheduler job.
- Build and deploy the frontend with Firebase, Storage, and Google Maps variables.

Manual command sequence:

1. Enable APIs:

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  cloudscheduler.googleapis.com \
  cloudtasks.googleapis.com \
  translate.googleapis.com \
  --project personal-claw-1
```

2. Create Cloud Tasks queue:

```bash
gcloud tasks queues create swiftflow-trip-tasks \
  --location=us-central1 \
  --max-dispatches-per-second=5 \
  --max-concurrent-dispatches=10 \
  --project personal-claw-1
```

3. Deploy backend:

```bash
gcloud run deploy swiftflow-backend \
  --source backend \
  --region us-central1 \
  --project personal-claw-1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=personal-claw-1,FIREBASE_PROJECT_ID=personal-claw-1,VERTEX_AI_LOCATION=us-central1,GEMINI_MODEL=gemini-1.5-flash,TRANSLATION_ENABLED=true,TRANSLATION_FALLBACK_LANGUAGE=en,BACKEND_BASE_URL=https://YOUR_BACKEND_URL,INTERNAL_TASK_SECRET=YOUR_LONG_RANDOM_SECRET,CLOUD_TASKS_LOCATION=us-central1,CLOUD_TASKS_QUEUE=swiftflow-trip-tasks,TASK_INVOKER_SERVICE_ACCOUNT=swiftflow-tasks@personal-claw-1.iam.gserviceaccount.com,ALLOW_UNAUTHENTICATED_DEV=false,ALLOWED_ORIGINS=https://YOUR_FRONTEND_URL
```

4. Create Scheduler job:

```bash
gcloud scheduler jobs create http swiftflow-expire-tickets \
  --location=us-central1 \
  --schedule="*/5 * * * *" \
  --time-zone="UTC" \
  --uri="https://YOUR_BACKEND_URL/api/cron/expire-tickets" \
  --http-method=POST \
  --headers="X-SwiftFlow-Task-Secret=YOUR_LONG_RANDOM_SECRET" \
  --oidc-service-account-email=swiftflow-scheduler@personal-claw-1.iam.gserviceaccount.com \
  --oidc-token-audience="https://YOUR_BACKEND_URL" \
  --project personal-claw-1
```

Where this is used:

- Cloud Scheduler calls `/api/cron/expire-tickets` every 5 minutes for broad cleanup.
- Confirming an RTS or bus booking queues Cloud Tasks for:
  - `/api/tasks/send-trip-reminder`, 15 minutes before departure.
  - `/api/tasks/expire-ticket`, 5 minutes after departure.
- Task handlers update Firestore read models so the frontend can show reminder/expired states.

5. Build the frontend image with production Vite variables:

```bash
gcloud builds submit frontend \
  --config frontend/cloudbuild.yaml \
  --project personal-claw-1 \
  --substitutions _IMAGE=gcr.io/personal-claw-1/swiftflow-frontend,_VITE_API_BASE_URL=https://YOUR_BACKEND_URL,_VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY,_VITE_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN,_VITE_FIREBASE_PROJECT_ID=personal-claw-1,_VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID,_VITE_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET,_VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

6. Deploy the frontend image:

```bash
gcloud run deploy swiftflow-frontend \
  --image gcr.io/personal-claw-1/swiftflow-frontend \
  --region us-central1 \
  --project personal-claw-1 \
  --allow-unauthenticated \
  --port 80
```

7. After the frontend URL is known, redeploy or update the backend `ALLOWED_ORIGINS` value to the exact frontend URL.

Deployment smoke tests:

```bash
curl -s https://YOUR_BACKEND_URL/health

curl -s -X POST https://YOUR_BACKEND_URL/api/cron/expire-tickets \
  -H "X-SwiftFlow-Task-Secret: YOUR_LONG_RANDOM_SECRET"

gcloud tasks queues describe swiftflow-trip-tasks \
  --location=us-central1 \
  --project personal-claw-1

gcloud scheduler jobs describe swiftflow-expire-tickets \
  --location=us-central1 \
  --project personal-claw-1
```

Firebase setup:

- Enable Firebase Authentication
- Enable the Anonymous sign-in provider
- Add the frontend Cloud Run URL to Firebase Authorized Domains
- Enable Firebase Storage and configure rules for authenticated profile photo uploads

Google Maps setup:

- Enable Maps JavaScript API and Places API in Google Cloud.
- Enable route/directions billing for walking route estimates.
- Restrict the browser API key by HTTP referrer to local dev and Cloud Run frontend domains.

Cloud Translation setup:

- Enable Cloud Translation API.
- The backend reads the browser `Accept-Language` header.
- To force a language during tests, pass `X-SwiftFlow-Language`, for example `ms`, `zh`, or `ta`.
- Translated responses currently cover alert read-model text and Gemini exploration suggestions.

Auth model:

- SwiftFlow uses Firebase Anonymous Auth by default, not Google sign-in
- Users do not see a login screen
- Each browser/device receives its own Firebase UID, so profiles are not shared globally
- If a user clears browser data or switches devices, they may get a new guest profile unless you add account linking later
