# SwiftFlow Project Status

Last updated: 2026-04-24

## Purpose

SwiftFlow is a Johor-Singapore border commute web app. The frontend is a Vite app. The backend is a Node.js HTTP API intended for Google Cloud Run. The backend now uses Firebase Auth identity, Firestore per-user persistence, and Vertex AI/Gemini helper integration.

This file is written as a machine-readable handoff/status summary for future agents or developers.

## Current Product Mode

- Target deployment: Google Cloud Run.
- Auth mode: Firebase Anonymous Auth.
- User login UI: none.
- Identity model: each browser/device silently receives a Firebase anonymous UID.
- Profile model: one Firestore user profile per Firebase UID.
- Profile editing: supported in app Profile page with focused name/email editing.
- Profile photo upload: supported in frontend via Firebase Storage when configured.
- Payment model: mock/display-only.
- Carpool model: mock taxi/driver data.
- Carpool concurrency: not production-ready.
- Main data store: Firestore.
- Compatibility state endpoint: still exists as `/api/state`.
- Notification model: frontend simulation that routes predictive alerts to app pages.
- Passport/arrival card model: frontend simulation for SGAC/MDAC status and QR pass access.
- Google mobility model: optional frontend Google Maps Platform integration enabled by `VITE_GOOGLE_MAPS_API_KEY`.
- Background jobs model: Cloud Scheduler and Cloud Tasks support for ticket expiry and trip reminders.
- Translation model: Cloud Translation API support for alert/read-model text and Gemini exploration suggestions.
- Deployment helper: root `deploy.sh` is the current preferred Cloud Run deploy path.

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
25. Added route-specific confirmation behavior for train, bus, and carpool flows.
26. Added train/bus QR pass access after confirmed bookings.
27. Added profile travel pass wallet with RTS, bus, and passport pre-check-in views.
28. Added document readiness page for passport validity, SGAC/MDAC submission simulation, visa status, and passport QR bar access.
29. Added notification center page linked from the top notification bell.
30. Added predictive notification routes for congestion comparison, pre-check reminders, carbon reward, and Smart-Gate QR access.
31. Added Rewards sustainability dashboard and SwiftFlow leaderboard.
32. Removed profile reset demo button, review saved booking button, and taxi QR pass display.
33. Added optional Google Places autocomplete for origin/destination location fields.
34. Added optional Google Maps pickup map and walking route ETA for carpool pickup.
35. Added polished Profile photo edit control for Firebase Storage uploads.
36. Added internal cron/task backend endpoints for ticket lifecycle automation.
37. Added optional Cloud Tasks scheduling after train/bus confirmation.
38. Added optional Cloud Translation API response localization based on browser language.
39. Added frontend request retry/clearer startup messaging for transient backend cold-start/network failures.
40. Added Google Maps fallback card instead of raw Google error UI.
41. Hardened Firebase Storage profile photo upload with bucket fallback and clearer auth/storage errors.

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

Background jobs:

- `backend/src/services/internalAuth.js`
- `backend/src/services/taskScheduler.js`
- `backend/src/services/language.js`
- `backend/src/services/translationService.js`

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
- `frontend/src/views/pages/documentReadiness.js`
- `frontend/src/views/pages/notifications.js`
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
- `POST /api/cron/expire-tickets`
- `POST /api/tasks/expire-ticket`
- `POST /api/tasks/send-trip-reminder`

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
- Profile page intentionally keeps editing to name/email for simpler UX.
- Shows saved train, bus, and carpool booking details.
- Shows RTS/bus QR pass when the matching booking is confirmed.
- Shows passport pre-check-in pass only after SGAC or MDAC submission is confirmed.

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
- `Access QR Pass` appears only after RTS confirmation.
- Train page includes bus price comparison link to the bus booking page.

### Bus Booking

Status: partially production-shaped.

- Firestore-backed.
- Domain metadata added like train booking.
- Confirmation writes trip history/profile read model.
- Payment remains mock/display-only.
- Bus page shows QR pass access after bus confirmation.

### Carpool

Status: mock/demo.

- Cars/taxis/drivers are seed/mock data.
- Payment is mock/display-only.
- Seat reservation is not concurrency-safe.
- Should not be treated as production-ready.

### Passport Check-In / Pass Readiness

Status: MVP UI implemented with simulated document checks.

- Persists check-in read model.
- Updates pass readiness.
- Writes credit transaction.
- Passport pre-check-in now leads to document readiness.
- Document readiness shows passport validity, SGAC/MDAC status, and visa status.
- SGAC and MDAC submission states are tracked separately in frontend state.
- Submitting one arrival card does not update the other card.
- Confirmed SGAC or MDAC unlocks the passport QR bar in Profile.
- Still simplified, not connected to real passport/identity verification or official arrival card systems.

### Alerts

Status: MVP implemented.

- Persists alert read model.
- Accepting alert updates trip timing and writes credit transaction.
- Top notification bell opens a simulated notification center.
- Time-to-leave notification opens Alerts with road congestion vs RTS train comparison visible.
- Vertex/Gemini helper exists but disruption flow is still simplified.

### Credits

Status: MVP ledger implemented.

- Has `creditTransactions` collection.
- Check-in, alert acceptance, and rewards write ledger entries.
- Still not hardened for abuse/accounting.

### Rewards

Status: MVP implemented.

- Reward redemption writes redemption record and negative credit ledger entry.
- Rewards page includes a sustainability dashboard and SwiftFlow leaderboard.
- Inventory/partner fulfillment is not production-ready.

### Notifications

Status: frontend simulation implemented.

- Top notification bell routes to `notifications`.
- Notification center includes:
  - Time to Leave predictive mobility alert.
  - Pre-check Reminder for missing SGAC.
  - Carbon Reward impact alert.
- Smart-Gate Token QR alert.
- Notification actions route to Alerts, Document Readiness, Rewards, and the passport QR bar in Profile.
- Triggers are simulated in frontend copy, not connected to live traffic, GPS/geofencing, or trip completion detection.

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

Frontend build-time:

- `VITE_API_BASE_URL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_GOOGLE_MAPS_API_KEY`

Google Maps behavior:

- When `VITE_GOOGLE_MAPS_API_KEY` is unset, the app falls back to local datalist suggestions and static pickup-map UI.
- When configured, Places autocomplete attaches to origin/destination fields.
- When configured, the carpool pickup page loads an interactive Google map and walking route estimate.
- When Google Maps fails to authorize/render, the carpool pickup page now shows a designed fallback card instead of the default Google error box.
- Required Google Cloud APIs: Maps JavaScript API and Places API. Route estimates use the Maps JavaScript routing service.

Firebase frontend behavior:

- Frontend bootstraps a silent Firebase Anonymous Auth session before first protected API call.
- If the frontend reaches backend without a Firebase ID token, backend returns `401 Unauthorized`.
- Deployed frontend requires Firebase Anonymous Auth enabled plus the frontend domain added to Firebase Authorized Domains.
- Profile photo upload now tries configured Storage bucket, `${projectId}.appspot.com`, and `${projectId}.firebasestorage.app`.

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

Preferred path:

```bash
./deploy.sh
```

The script:

- deploys backend first,
- reads the real backend Cloud Run URL,
- builds/deploys frontend against that URL,
- reads the real frontend Cloud Run URL,
- patches backend `ALLOWED_ORIGINS`,
- provisions Cloud Scheduler/Cloud Tasks pieces when configured.

Manual outline:

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
  --substitutions _IMAGE=gcr.io/personal-claw-1/swiftflow-frontend,_VITE_API_BASE_URL=https://YOUR_BACKEND_URL,_VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY,_VITE_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN,_VITE_FIREBASE_PROJECT_ID=personal-claw-1,_VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID,_VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
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
- Add `localhost` and `127.0.0.1` too if local frontend will call cloud backend during development.
- Enable Firestore Native mode.
- Enable Vertex AI API.
- Enable Cloud Translation API for localized alerts and AI suggestions.
- Enable Cloud Scheduler API and Cloud Tasks API for automated ticket lifecycle jobs.
- Enable Maps JavaScript API and Places API if location autocomplete/maps are needed.
- Restrict the Google Maps browser API key to allowed frontend HTTP referrers.
- Ensure backend Cloud Run service account has:
  - Cloud Datastore User
  - Vertex AI User
  - Firebase Authentication Admin
  - Cloud Tasks Enqueuer

## Background Jobs

Status: MVP implemented.

- `POST /api/cron/expire-tickets` expires confirmed train/bus tickets after departure plus grace time.
- `POST /api/tasks/expire-ticket` expires one exact user booking from Cloud Tasks.
- `POST /api/tasks/send-trip-reminder` writes a Firestore alert/reminder for one exact user booking.
- Confirming train or bus booking attempts to enqueue reminder and expiry tasks.
- If Cloud Tasks env vars are missing, scheduling is skipped without breaking booking confirmation.
- Internal endpoints require `X-SwiftFlow-Task-Secret` unless `ALLOW_UNAUTHENTICATED_DEV=true`.

## Validation Already Run

At the time of this file:

- Backend syntax checks passed for key modified files.
- Frontend `npm run build` passed.
- No active Google sign-in code references remain except documentation saying Google sign-in is not used.
- Recent frontend render checks passed for SGAC/MDAC separation, Profile pre-check-in pass gating, train QR gating, notification routes, alert comparison, and rewards leaderboard.
- `deploy.sh` shell syntax check passed.
- Frontend request retry behavior is in place for transient `fetch` failures on first load.

## Known Remaining Work

High priority:

- Make carpool production-safe if it will be used publicly.
- Add rate limiting/abuse controls.
- Add structured logging and monitoring.
- Add readiness endpoint that checks Firestore/Vertex access.
- Improve frontend handling of backend `401 Unauthorized` by surfacing a Firebase session/auth setup message instead of a generic request error.
- Remove or retire legacy `backend/src/store/appStore.js`.
- Reduce reliance on compatibility `/api/state`.
- Consider setting backend Cloud Run `min-instances=1` if first-load cold starts remain noticeable in production.

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
- Google route/map data only works when a valid browser API key is configured.
- Deployed frontend depends on Firebase Anonymous Auth and correct Firebase Authorized Domains; otherwise initial protected API calls fail with backend `401 Unauthorized`.
