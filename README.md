# SwiftFlow

Project structure:

- `frontend/`: Vite frontend app
- `backend/`: Node backend scaffold with in-memory API routes for the current frontend features

Frontend:

- `cd frontend`
- `npm run dev`

Backend:

- `cd backend`
- `npm run dev`

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

Persistence:

- Backend state is stored in a local SQLite file at `backend/data/swiftflow.sqlite`
- Restarting the backend keeps your last saved bookings and confirmations
- Use the Profile page `Reset Demo Data` action to restore the original demo state for repeated testing


gcloud run deploy swiftflow-backend \
  --source ./backend \
  --region us-central1 \
  --allow-unauthenticated



gcloud run deploy swiftflow-frontend \
  --source ./frontend \
  --region us-central1 \
  --allow-unauthenticated

