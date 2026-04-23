#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Deploying Backend..."
gcloud run deploy swiftflow-backend \
  --source backend \
  --region us-central1 \
  --project personal-claw-1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=personal-claw-1,FIREBASE_PROJECT_ID=personal-claw-1,VERTEX_AI_LOCATION=us-central1,GEMINI_MODEL=gemini-1.5-flash,ALLOW_UNAUTHENTICATED_DEV=false,ALLOWED_ORIGINS="https://swiftflow-frontend-840535137820.us-central1.run.app"

echo "✅ Backend Deployed Successfully!"
echo "-----------------------------------"
echo "🚀 Building and Deploying Frontend..."

cd frontend

# Build the new image and push it to the registry
gcloud builds submit . --config cloudbuild.yaml --project personal-claw-1

# Deploy the new image to Cloud Run
gcloud run deploy swiftflow-frontend \
  --image gcr.io/personal-claw-1/swiftflow-frontend \
  --region us-central1 \
  --project personal-claw-1 \
  --allow-unauthenticated \
  --port 80

cd ..

echo "✅ Frontend Deployed Successfully!"
echo "🎉 Full Stack Deployment Complete!"
