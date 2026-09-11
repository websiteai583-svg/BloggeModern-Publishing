#!/usr/bin/env bash
# ==============================================================================
# BLOGGE PRODUCTION CLOUD RUN DEPLOYMENT SCRIPT
# ==============================================================================
set -euo pipefail

echo "========================================================"
echo " BLOGGE PRODUCTION CLOUD RUN DEPLOYMENT"
echo "========================================================"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo "Error: gcloud CLI is not installed or not in PATH."
  echo "Please install Google Cloud SDK or run from Google Cloud Shell."
  exit 1
fi

PROJECT_ID=$(gcloud config get-value project 2>/dev/null || true)
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "(unset)" ]; then
  read -p "Enter your Google Cloud Project ID: " PROJECT_ID
  gcloud config set project "$PROJECT_ID"
fi

REGION="${REGION:-asia-southeast1}"
SERVICE_NAME="blogge-api"

echo "Project ID: $PROJECT_ID"
echo "Region:     $REGION"
echo "Service:    $SERVICE_NAME"
echo "--------------------------------------------------------"

# Enable required Google Cloud APIs
echo "Enabling Cloud Run & Cloud Build APIs..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# Check for DATABASE_URL
if [ -z "${DATABASE_URL:-}" ]; then
  echo ""
  echo "A persistent PostgreSQL database is required for production."
  read -p "Enter your DATABASE_URL (e.g. postgresql://user:pass@host:5432/db): " DATABASE_URL
fi

# Check for SESSION_SECRET
if [ -z "${SESSION_SECRET:-}" ]; then
  SESSION_SECRET=$(openssl rand -hex 32 2>/dev/null || date +%s%N | sha256sum | head -c 64)
  echo "Generated SESSION_SECRET: [Secure random secret]"
fi

# Deploy container directly from source to Cloud Run
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars "NODE_ENV=production,PORT=3000,DATABASE_URL=$DATABASE_URL,SESSION_SECRET=$SESSION_SECRET,ADMIN_EMAIL=websiteai583@gmail.com"

# Retrieve deployed public URL
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format 'value(status.url)')

echo "========================================================"
echo "DEPLOYMENT COMPLETE!"
echo "Public Cloud Run URL: $SERVICE_URL"
echo ""
echo "Test health endpoint:"
echo "curl -i $SERVICE_URL/api/health"
echo "========================================================"
