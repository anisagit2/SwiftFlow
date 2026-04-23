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

Persistence:

- Backend state is structured per user in Firestore under `users/{userId}/...`
- In local development, the backend can fall back to `DEV_USER_ID` only when `ALLOW_UNAUTHENTICATED_DEV=true`
- Use the Profile page `Reset Demo Data` action to reseed the active user's state for repeated testing

Production deploy:

1. Deploy the backend first:

```bash
gcloud run deploy swiftflow-backend \
  --source backend \
  --region us-central1 \
  --project personal-claw-1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=personal-claw-1,FIREBASE_PROJECT_ID=personal-claw-1,VERTEX_AI_LOCATION=us-central1,GEMINI_MODEL=gemini-1.5-flash,ALLOW_UNAUTHENTICATED_DEV=false,ALLOWED_ORIGINS=https://YOUR_FRONTEND_URL
```

2. Build the frontend image with production Vite variables:

```bash
gcloud builds submit frontend \
  --config frontend/cloudbuild.yaml \
  --project personal-claw-1 \
  --substitutions _IMAGE=gcr.io/personal-claw-1/swiftflow-frontend,_VITE_API_BASE_URL=https://YOUR_BACKEND_URL,_VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY,_VITE_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN,_VITE_FIREBASE_PROJECT_ID=personal-claw-1,_VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID,_VITE_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET,_VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

3. Deploy the frontend image:

```bash
gcloud run deploy swiftflow-frontend \
  --image gcr.io/personal-claw-1/swiftflow-frontend \
  --region us-central1 \
  --project personal-claw-1 \
  --allow-unauthenticated \
  --port 80
```

4. After the frontend URL is known, redeploy or update the backend `ALLOWED_ORIGINS` value to the exact frontend URL.

Firebase setup:

- Enable Firebase Authentication
- Enable the Anonymous sign-in provider
- Add the frontend Cloud Run URL to Firebase Authorized Domains
- Enable Firebase Storage and configure rules for authenticated profile photo uploads

Google Maps setup:

- Enable Maps JavaScript API and Places API in Google Cloud.
- Enable route/directions billing for walking route estimates.
- Restrict the browser API key by HTTP referrer to local dev and Cloud Run frontend domains.

Auth model:

- SwiftFlow uses Firebase Anonymous Auth by default, not Google sign-in
- Users do not see a login screen
- Each browser/device receives its own Firebase UID, so profiles are not shared globally
- If a user clears browser data or switches devices, they may get a new guest profile unless you add account linking later
