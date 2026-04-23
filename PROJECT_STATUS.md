# SwiftFlow Project Status

Last updated: 2026-04-23

## Purpose

SwiftFlow is a Johor-Singapore border commute web app. The frontend is a Vite app. The backend is a Node.js HTTP API intended for Google Cloud Run. The backend now uses Firebase Auth identity, Firestore per-user persistence, and Vertex AI/Gemini helper integration.

This file is written as a machine-readable handoff/status summary for future agents or developers.

## Current Product Mode

- Target deployment: Google Cloud Run.
- Auth mode: Firebase Anonymous Auth.
- User login UI: none.
- Identity model: each browser/device silently receives a Firebase anonymous UID.
- Profile model: one Firestore user profile per Firebase UID.
- Profile editing: supported in app Profile page.
- Payment model: mock/display-only.
- Carpool model: mock taxi/driver data.
- Carpool concurrency: not production-ready.
- Main data store: Firestore.
- Compatibility state endpoint: still exists as `/api/state`.

## Major Work Completed

1. Replaced shared demo backend behavior with per-user Firestore-backed state.
2. Added Firebase Admin backend setup.
3. Added backend request user resolution from Firebase ID tokens.
4. Added local dev fallback support, but production-safe default is `ALLOW_UNAUTHENTICATED_DEV=false`.
5. Added anonymous Firebase Auth frontend session bootstrap.
6. Removed Google sign-in requirement and sign-in UI.
7. Added token-aware frontend API client.
8. Added editable one-user-one-profile flow.
9. Added `PATCH /api/profile`.
10. Migrated train booking toward domain-shaped Firestore persistence.
11. Migrated bus booking toward domain-shaped Firestore persistence.
12. Added trip history collection/read model.
13. Added profile read model.
14. Added check-in/pass readiness read model.
15. Added alerts read model.
16. Added credit ledger model.
17. Added reward redemption model.
18. Marked payments as mock/display-only in backend status text and UI copy.
19. Marked carpool cars/taxis as mock data in UI copy.
20. Added env-based Vertex AI config.
21. Added configurable CORS via `ALLOWED_ORIGINS`.
22. Added frontend Docker build args for Vite env values.
23. Added `frontend/cloudbuild.yaml`.
24. Updated README with Cloud Run deployment commands.

## Current Backend Architecture

Entry:

- `backend/src/server.js`

Routing:

- `backend/src/routes/index.js`

Config:

- `backend/src/config/env.js`

Firebase:

- `backend/src/services/firebaseAdmin.js`
- `backend/src/auth/resolveRequestUser.js`

Persistence/store:

- `backend/src/store/firebaseStore.js`

Compatibility response builder:

- `backend/src/services/buildAppState.js`

AI:

- `backend/src/ai/geminiService.js`
- `backend/src/ai/prompts.js`

Legacy unused/demo store still exists:

- `backend/src/store/appStore.js`

Note: `server.js` imports `createAppStore` from `firebaseStore.js`, not the legacy `appStore.js`.

## Current Frontend Architecture

Entry:

- `frontend/src/main.js`
- `frontend/src/app/createApp.js`

API client:

- `frontend/src/api/client.js`

Firebase anonymous session:

- `frontend/src/lib/firebase.js`

State seed:

- `frontend/src/data/initialState.js`

Pages:

- `frontend/src/views/pages/explore.js`
- `frontend/src/views/pages/trainBooking.js`
- `frontend/src/views/pages/busBooking.js`
- `frontend/src/views/pages/carpoolBooking.js`
- `frontend/src/views/pages/carpoolPickup.js`
- `frontend/src/views/pages/passportCheckin.js`
- `frontend/src/views/pages/alerts.js`
- `frontend/src/views/pages/credits.js`
- `frontend/src/views/pages/rewards.js`
- `frontend/src/views/pages/profile.js`

Layout/helpers:

- `frontend/src/views/layout.js`
- `frontend/src/views/helpers.js`

## Backend API Surface

Public-ish unauthenticated:

- `GET /health`
- `GET /api`

Requires Firebase token unless `ALLOW_UNAUTHENTICATED_DEV=true`:

- `GET /api/state`
- `POST /api/state/reset`
- `GET /api/options`
- `GET /api/explore`
- `GET /api/trips/history`
- `GET /api/bookings/train`
- `PATCH /api/bookings/train`
- `POST /api/bookings/train/confirm`
- `GET /api/bookings/bus`
- `PATCH /api/bookings/bus`
- `POST /api/bookings/bus/confirm`
- `GET /api/bookings/carpool`
- `PATCH /api/bookings/carpool/select-driver`
- `PATCH /api/bookings/carpool/payment`
- `POST /api/bookings/carpool/confirm`
- `POST /api/check-in`
- `POST /api/alerts/accept`
- `GET /api/credits`
- `GET /api/rewards`
- `POST /api/rewards/:rewardId/redeem`
- `GET /api/profile`
- `PATCH /api/profile`

## Firestore Shape

Root:

- `users/{uid}`

Known docs/subcollections:

- `users/{uid}`: profile/auth metadata
- `users/{uid}/trips/active`
- `users/{uid}/bookings/train`
- `users/{uid}/bookings/bus`
- `users/{uid}/transport/carpool`
- `users/{uid}/wallets/credits`
- `users/{uid}/meta/catalog`
- `users/{uid}/readModels/profile`
- `users/{uid}/readModels/checkIn`
- `users/{uid}/readModels/alerts`
- `users/{uid}/tripHistory/{historyId}`
- `users/{uid}/creditTransactions/{transactionId}`
- `users/{uid}/rewardRedemptions/{redemptionId}`

## Feature Status

### Auth

Status: implemented for MVP.

- Uses Firebase Anonymous Auth.
- No visible login.
- One profile per anonymous UID.
- Limitation: profile is device/browser-bound unless account linking is added later.

### Profile

Status: implemented for MVP.

- One profile per user UID.
- Editable in Profile page.
- Supports fields:
  - `displayName`
  - `email`
  - `preferredDestination`
  - `primaryMode`
  - `homeHub`
  - `bio`

### Train Booking

Status: partially production-shaped.

- Firestore-backed.
- Domain metadata added:
  - `id`
  - `type`
  - `tripId`
  - `reservationStatus`
  - `passStatus`
  - `confirmedAt`
  - `updatedAt`
- Confirmation writes trip history/profile read model.
- Payment remains mock/display-only.

### Bus Booking

Status: partially production-shaped.

- Firestore-backed.
- Domain metadata added like train booking.
- Confirmation writes trip history/profile read model.
- Payment remains mock/display-only.

### Carpool

Status: mock/demo.

- Cars/taxis/drivers are seed/mock data.
- Payment is mock/display-only.
- Seat reservation is not concurrency-safe.
- Should not be treated as production-ready.

### Passport Check-In / Pass Readiness

Status: MVP implemented.

- Persists check-in read model.
- Updates pass readiness.
- Writes credit transaction.
- Still simplified, not connected to real passport/identity verification.

### Alerts

Status: MVP implemented.

- Persists alert read model.
- Accepting alert updates trip timing and writes credit transaction.
- Vertex/Gemini helper exists but disruption flow is still simplified.

### Credits

Status: MVP ledger implemented.

- Has `creditTransactions` collection.
- Check-in, alert acceptance, and rewards write ledger entries.
- Still not hardened for abuse/accounting.

### Rewards

Status: MVP implemented.

- Reward redemption writes redemption record and negative credit ledger entry.
- Inventory/partner fulfillment is not production-ready.

### Payments

Status: intentionally mock/display-only.

- No real payment provider.
- Backend text uses mock payment status.
- UI copy says no real payment is processed.

## Environment Variables

Backend:

- `PORT`
- `GOOGLE_CLOUD_PROJECT`
- `FIREBASE_PROJECT_ID`
- `VERTEX_AI_LOCATION`
- `GEMINI_MODEL`
- `ALLOWED_ORIGINS`
- `ALLOW_UNAUTHENTICATED_DEV`
- `DEV_USER_ID`

Frontend build-time:

- `VITE_API_BASE_URL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`

## Local Run

Backend:

```bash
cd backend
export PORT=3001
export GOOGLE_CLOUD_PROJECT=personal-claw-1
export FIREBASE_PROJECT_ID=personal-claw-1
export ALLOWED_ORIGINS=http://localhost:5173
export ALLOW_UNAUTHENTICATED_DEV=false
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

## Cloud Run Deploy Outline

Backend first:

```bash
gcloud run deploy swiftflow-backend \
  --source backend \
  --region us-central1 \
  --project personal-claw-1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=personal-claw-1,FIREBASE_PROJECT_ID=personal-claw-1,VERTEX_AI_LOCATION=us-central1,GEMINI_MODEL=gemini-1.5-flash,ALLOW_UNAUTHENTICATED_DEV=false,ALLOWED_ORIGINS="https://swiftflow-frontend-840535137820.us-central1.run.app"
```

Frontend build:

```bash
gcloud builds submit frontend \
  --config frontend/cloudbuild.yaml \
  --project personal-claw-1 \
  --substitutions _IMAGE=gcr.io/personal-claw-1/swiftflow-frontend,_VITE_API_BASE_URL=https://YOUR_BACKEND_URL,_VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY,_VITE_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN,_VITE_FIREBASE_PROJECT_ID=personal-claw-1,_VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
```

Frontend deploy:

```bash
gcloud run deploy swiftflow-frontend \
  --image gcr.io/personal-claw-1/swiftflow-frontend \
  --region us-central1 \
  --project personal-claw-1 \
  --allow-unauthenticated \
  --port 80
```

After frontend deploy, update backend `ALLOWED_ORIGINS` to the exact frontend Cloud Run URL.

## Required Google/Firebase Setup

- Enable Firebase Authentication.
- Enable Anonymous auth provider.
- Add frontend Cloud Run URL to Firebase Authorized Domains.
- Enable Firestore Native mode.
- Enable Vertex AI API.
- Ensure backend Cloud Run service account has:
  - Cloud Datastore User
  - Vertex AI User
  - Firebase Authentication Admin

## Validation Already Run

At the time of this file:

- Backend syntax checks passed for key modified files.
- Frontend `npm run build` passed.
- No active Google sign-in code references remain except documentation saying Google sign-in is not used.

## Known Remaining Work

High priority:

- Make carpool production-safe if it will be used publicly.
- Add rate limiting/abuse controls.
- Add structured logging and monitoring.
- Add readiness endpoint that checks Firestore/Vertex access.
- Add frontend 401/session error handling.
- Remove or retire legacy `backend/src/store/appStore.js`.
- Reduce reliance on compatibility `/api/state`.

Medium priority:

- Add account linking if users need cross-device profile recovery.
- Add custom domain and HTTPS/domain auth setup.
- Add Firestore security rules review.
- Add tests for store mutations and route behavior.
- Add deployment smoke test script.

MVP limitations:

- Payment is mock only.
- Carpool is mock only.
- Anonymous users are browser/device scoped.
- No real transport provider integrations.
- No real payment provider integrations.
- No real passport/identity verification.
