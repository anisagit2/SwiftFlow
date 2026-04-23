#!/bin/bash

set -euo pipefail

usage() {
  cat <<'EOF'
SwiftFlow Cloud Run deploy

Usage:
  gcloud auth login
  gcloud config set project personal-claw-1

  export PROJECT_ID="personal-claw-1"
  export REGION="us-central1"
  export INTERNAL_TASK_SECRET="$(openssl rand -hex 32)"
  export FIREBASE_API_KEY="your_firebase_web_api_key"
  export FIREBASE_APP_ID="your_firebase_web_app_id"
  export FIREBASE_AUTH_DOMAIN="personal-claw-1.firebaseapp.com"
  export FIREBASE_STORAGE_BUCKET="personal-claw-1.firebasestorage.app"
  export GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
  export EXTRA_ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"

  ./deploy.sh

Notes:
  - Default Firebase Storage bucket in this script is:
      personal-claw-1.firebasestorage.app
  - Override FIREBASE_STORAGE_BUCKET only if your Firebase project uses a different bucket.
  - Leave TASK_INVOKER_SERVICE_ACCOUNT empty unless you have configured Cloud Tasks OIDC invocation.
  - The script deploys backend first, then frontend, then patches backend CORS with the real frontend URL.
EOF
}

PROJECT_ID="${PROJECT_ID:-personal-claw-1}"
REGION="${REGION:-us-central1}"
BACKEND_SERVICE="${BACKEND_SERVICE:-swiftflow-backend}"
FRONTEND_SERVICE="${FRONTEND_SERVICE:-swiftflow-frontend}"
FRONTEND_IMAGE="${FRONTEND_IMAGE:-gcr.io/${PROJECT_ID}/swiftflow-frontend}"
TASK_QUEUE="${TASK_QUEUE:-swiftflow-trip-tasks}"
TASK_LOCATION="${TASK_LOCATION:-${REGION}}"
TASK_INVOKER_SERVICE_ACCOUNT="${TASK_INVOKER_SERVICE_ACCOUNT:-}"
SCHEDULER_SERVICE_ACCOUNT="${SCHEDULER_SERVICE_ACCOUNT:-swiftflow-scheduler@${PROJECT_ID}.iam.gserviceaccount.com}"
INTERNAL_TASK_SECRET="${INTERNAL_TASK_SECRET:-}"
GOOGLE_MAPS_API_KEY="${GOOGLE_MAPS_API_KEY:-}"
FIREBASE_API_KEY="${FIREBASE_API_KEY:-}"
FIREBASE_AUTH_DOMAIN="${FIREBASE_AUTH_DOMAIN:-${PROJECT_ID}.firebaseapp.com}"
FIREBASE_APP_ID="${FIREBASE_APP_ID:-}"
FIREBASE_STORAGE_BUCKET="${FIREBASE_STORAGE_BUCKET:-${PROJECT_ID}.firebasestorage.app}"
EXTRA_ALLOWED_ORIGINS="${EXTRA_ALLOWED_ORIGINS:-http://localhost:5173}"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "❌ Missing required command: $1"
    exit 1
  fi
}

join_origins() {
  local primary="$1"
  local secondary="$2"

  if [[ -n "${primary}" && -n "${secondary}" ]]; then
    echo "${primary},${secondary}"
    return
  fi

  if [[ -n "${primary}" ]]; then
    echo "${primary}"
    return
  fi

  echo "${secondary}"
}

ensure_service_account() {
  local account="$1"
  if [[ -z "${account}" ]]; then
    return
  fi

  local name="${account%@*}"
  if ! gcloud iam service-accounts describe "${account}" --project "${PROJECT_ID}" >/dev/null 2>&1; then
    gcloud iam service-accounts create "${name}" \
      --display-name="${name}" \
      --project "${PROJECT_ID}"
  fi
}

require_command gcloud

if [[ -z "${INTERNAL_TASK_SECRET}" ]]; then
  echo "❌ INTERNAL_TASK_SECRET is required."
  echo
  usage
  exit 1
fi

if [[ -z "${FIREBASE_API_KEY}" || -z "${FIREBASE_APP_ID}" ]]; then
  echo "❌ FIREBASE_API_KEY and FIREBASE_APP_ID are required for the frontend build."
  echo
  usage
  exit 1
fi

echo "🔎 Using Google Cloud project ${PROJECT_ID} in ${REGION}"
PROJECT_NUMBER="$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')"
DEFAULT_RUNTIME_SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

if [[ -z "${GOOGLE_MAPS_API_KEY}" ]]; then
  echo "⚠️ GOOGLE_MAPS_API_KEY is empty. Map, Places autocomplete, and route visuals will not work in production."
fi

echo "🔧 Enabling required Google Cloud APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  cloudscheduler.googleapis.com \
  cloudtasks.googleapis.com \
  translate.googleapis.com \
  iamcredentials.googleapis.com \
  containerregistry.googleapis.com \
  --project "${PROJECT_ID}"

echo "🧵 Ensuring Cloud Tasks queue exists..."
if ! gcloud tasks queues describe "${TASK_QUEUE}" --location "${TASK_LOCATION}" --project "${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud tasks queues create "${TASK_QUEUE}" \
    --location "${TASK_LOCATION}" \
    --max-dispatches-per-second=5 \
    --max-concurrent-dispatches=10 \
    --project "${PROJECT_ID}"
else
  echo "Cloud Tasks queue ${TASK_QUEUE} already exists."
fi

echo "🔐 Ensuring service accounts exist..."
ensure_service_account "${SCHEDULER_SERVICE_ACCOUNT}"
if [[ -n "${TASK_INVOKER_SERVICE_ACCOUNT}" ]]; then
  ensure_service_account "${TASK_INVOKER_SERVICE_ACCOUNT}"
else
  echo "Cloud Tasks OIDC invoker not configured. Internal task routes will rely on X-SwiftFlow-Task-Secret."
fi

INITIAL_ALLOWED_ORIGINS="$(join_origins "" "${EXTRA_ALLOWED_ORIGINS}")"

echo "🚀 Deploying backend..."
gcloud run deploy "${BACKEND_SERVICE}" \
  --source backend \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=${PROJECT_ID},FIREBASE_PROJECT_ID=${PROJECT_ID},VERTEX_AI_LOCATION=${REGION},GEMINI_MODEL=gemini-1.5-flash,TRANSLATION_ENABLED=true,TRANSLATION_FALLBACK_LANGUAGE=en,BACKEND_BASE_URL=,INTERNAL_TASK_SECRET=${INTERNAL_TASK_SECRET},CLOUD_TASKS_LOCATION=${TASK_LOCATION},CLOUD_TASKS_QUEUE=${TASK_QUEUE},TASK_INVOKER_SERVICE_ACCOUNT=${TASK_INVOKER_SERVICE_ACCOUNT},ALLOW_UNAUTHENTICATED_DEV=false,ALLOWED_ORIGINS=${INITIAL_ALLOWED_ORIGINS}"

BACKEND_URL="$(gcloud run services describe "${BACKEND_SERVICE}" --region "${REGION}" --project "${PROJECT_ID}" --format='value(status.url)')"
echo "Backend URL: ${BACKEND_URL}"

echo "🔑 Granting Cloud Run invoke permission..."
gcloud run services add-iam-policy-binding "${BACKEND_SERVICE}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --member="serviceAccount:${SCHEDULER_SERVICE_ACCOUNT}" \
  --role="roles/run.invoker" >/dev/null

if [[ -n "${TASK_INVOKER_SERVICE_ACCOUNT}" ]]; then
  gcloud run services add-iam-policy-binding "${BACKEND_SERVICE}" \
    --region "${REGION}" \
    --project "${PROJECT_ID}" \
    --member="serviceAccount:${TASK_INVOKER_SERVICE_ACCOUNT}" \
    --role="roles/run.invoker" >/dev/null

  gcloud iam service-accounts add-iam-policy-binding "${TASK_INVOKER_SERVICE_ACCOUNT}" \
    --project "${PROJECT_ID}" \
    --member="serviceAccount:${DEFAULT_RUNTIME_SERVICE_ACCOUNT}" \
    --role="roles/iam.serviceAccountUser" >/dev/null
fi

echo "⏰ Ensuring Cloud Scheduler job exists..."
if gcloud scheduler jobs describe swiftflow-expire-tickets --location "${REGION}" --project "${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud scheduler jobs update http swiftflow-expire-tickets \
    --location "${REGION}" \
    --schedule="*/5 * * * *" \
    --time-zone="UTC" \
    --uri="${BACKEND_URL}/api/cron/expire-tickets" \
    --http-method=POST \
    --update-headers="X-SwiftFlow-Task-Secret=${INTERNAL_TASK_SECRET}" \
    --oidc-service-account-email="${SCHEDULER_SERVICE_ACCOUNT}" \
    --oidc-token-audience="${BACKEND_URL}" \
    --project "${PROJECT_ID}"
else
  gcloud scheduler jobs create http swiftflow-expire-tickets \
    --location "${REGION}" \
    --schedule="*/5 * * * *" \
    --time-zone="UTC" \
    --uri="${BACKEND_URL}/api/cron/expire-tickets" \
    --http-method=POST \
    --headers="X-SwiftFlow-Task-Secret=${INTERNAL_TASK_SECRET}" \
    --oidc-service-account-email="${SCHEDULER_SERVICE_ACCOUNT}" \
    --oidc-token-audience="${BACKEND_URL}" \
    --project "${PROJECT_ID}"
fi

echo "🎨 Building frontend image..."
gcloud builds submit frontend \
  --config frontend/cloudbuild.yaml \
  --project "${PROJECT_ID}" \
  --substitutions "_IMAGE=${FRONTEND_IMAGE},_VITE_API_BASE_URL=${BACKEND_URL},_VITE_FIREBASE_API_KEY=${FIREBASE_API_KEY},_VITE_FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN},_VITE_FIREBASE_PROJECT_ID=${PROJECT_ID},_VITE_FIREBASE_APP_ID=${FIREBASE_APP_ID},_VITE_FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET},_VITE_GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}"

echo "🚀 Deploying frontend..."
gcloud run deploy "${FRONTEND_SERVICE}" \
  --image "${FRONTEND_IMAGE}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --allow-unauthenticated \
  --port 80

FRONTEND_URL="$(gcloud run services describe "${FRONTEND_SERVICE}" --region "${REGION}" --project "${PROJECT_ID}" --format='value(status.url)')"
FINAL_ALLOWED_ORIGINS="$(join_origins "${FRONTEND_URL}" "${EXTRA_ALLOWED_ORIGINS}")"

echo "🔄 Updating backend with final URLs..."
gcloud run services update "${BACKEND_SERVICE}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --update-env-vars "BACKEND_BASE_URL=${BACKEND_URL},ALLOWED_ORIGINS=${FINAL_ALLOWED_ORIGINS},TASK_INVOKER_SERVICE_ACCOUNT=${TASK_INVOKER_SERVICE_ACCOUNT}" >/dev/null

echo "✅ Deployment complete."
echo "Backend: ${BACKEND_URL}"
echo "Frontend: ${FRONTEND_URL}"
echo
echo "Quick checks:"
echo "  curl -s ${BACKEND_URL}/health"
echo "  open ${FRONTEND_URL}"
