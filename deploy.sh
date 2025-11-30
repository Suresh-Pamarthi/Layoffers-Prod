#!/bin/bash
set -e

# -----------------------------
# Configuration
# -----------------------------
SERVICE="layoffers-api"
REGION="asia-south1"
PROJECT="layoffers-prod"

# Get project number for service account
PROJECT_NUMBER=$(gcloud projects describe $PROJECT --format='value(projectNumber)')

# -----------------------------
# Ensure secrets exist
# -----------------------------
# DATABASE_URL secret
gcloud secrets versions add layoffers-db-url \
  --data-file=<(echo -n "postgresql://layoffers_user:Layoffers%40520044@/layoffers_db?host=/cloudsql/$PROJECT:asia-south1:layoffers-db") \
  || echo "Secret already exists, adding new version"

# SESSION_SECRET secret
SESSION_SECRET=$(openssl rand -hex 32)
gcloud secrets versions add layoffers-session-secret \
  --data-file=<(echo -n "$SESSION_SECRET") \
  || echo "Secret already exists, adding new version"

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding layoffers-db-url \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding layoffers-session-secret \
  --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# -----------------------------
# Deploy to Cloud Run
# -----------------------------
gcloud run deploy "$SERVICE" \
  --source . \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 3600 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production" \
  --set-secrets "DATABASE_URL=layoffers-db-url:latest,SESSION_SECRET=layoffers-session-secret:latest" \
  --service-account="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"
