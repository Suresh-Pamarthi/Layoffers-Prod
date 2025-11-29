# LayOffers - Google Cloud Run Deployment Guide

## Overview
This guide walks you through deploying your LayOffers app to Google Cloud Run using your own GCP account with your ₹25,000 budget.

**Estimated Cost:** ₹500-2,000/month depending on traffic (well within budget)

---

## Prerequisites

1. **Google Cloud Account** with active billing (₹25,000 balance)
2. **Google Cloud CLI** installed locally
3. **Docker** installed (for local testing)
4. **Git** installed

---

## Step 1: Setup Google Cloud Project

### 1.1 Create a new GCP Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project
gcloud projects create layoffers-prod --name="LayOffers Production"

# Set the project as active
gcloud config set project layoffers-prod

# Get your PROJECT_ID
gcloud config get-value project
# Output: layoffers-prod (or your chosen ID)
```

### 1.2 Enable Required APIs

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Container Registry / Artifact Registry
gcloud services enable artifactregistry.googleapis.com

# Enable Cloud Build
gcloud services enable cloudbuild.googleapis.com

# Enable Cloud SQL API (for database)
gcloud services enable sqladmin.googleapis.com

# Enable Secret Manager (for storing secrets)
gcloud services enable secretmanager.googleapis.com
```

---

## Step 2: Setup PostgreSQL Database on Cloud SQL

### 2.1 Create Cloud SQL Instance

```bash
# Create PostgreSQL instance (db-f1-micro is free tier eligible, ~₹1,000/month)
gcloud sql instances create layoffers-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-south1 \
  --availability-type=REGIONAL \
  --storage-type=PD_SSD \
  --storage-size=10GB \
  --enable-bin-log \
  --backup

# Wait for instance to be created (5-10 minutes)
# Check status:
gcloud sql instances describe layoffers-db
```

### 2.2 Create Database and User

```bash
# Create database
gcloud sql databases create layoffers_db \
  --instance=layoffers-db

# Create database user
gcloud sql users create layoffers_user \
  --instance=layoffers-db \
  --password=YOUR_STRONG_PASSWORD

# Note: Use a strong password! (min 16 characters, mix of upper/lower/numbers/symbols)
# Example: G@XzP9kL#2mQwR5n
```

### 2.3 Get Database Connection String

```bash
# Get the instance connection name
INSTANCE_CONNECTION_NAME=$(gcloud sql instances describe layoffers-db --format='value(connectionName)')
echo $INSTANCE_CONNECTION_NAME
# Output: project-id:asia-south1:layoffers-db

# Database URL will be:
# postgresql://layoffers_user:YOUR_PASSWORD@/layoffers_db?host=/cloudsql/INSTANCE_CONNECTION_NAME
```

---

## Step 3: Store Secrets in Secret Manager

### 3.1 Generate Session Secret

```bash
# Generate a random 32-char secret
SESSION_SECRET=$(openssl rand -hex 32)
echo "SESSION_SECRET: $SESSION_SECRET"
```

### 3.2 Create secrets in Secret Manager

```bash
# Store DATABASE_URL
echo -n "postgresql://layoffers_user:YOUR_PASSWORD@/layoffers_db?host=/cloudsql/PROJECT_ID:asia-south1:layoffers-db" | \
  gcloud secrets create layoffers-db-url --data-file=-

# Store SESSION_SECRET
echo -n "$SESSION_SECRET" | \
  gcloud secrets create layoffers-session-secret --data-file=-

# Grant Cloud Run access to secrets
PROJECT_NUMBER=$(gcloud projects list --filter="name:layoffers-prod" --format='value(PROJECT_NUMBER)')

gcloud secrets add-iam-policy-binding layoffers-db-url \
  --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

gcloud secrets add-iam-policy-binding layoffers-session-secret \
  --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

---

## Step 4: Prepare Your Application

### 4.1 Export Code from Replit

```bash
# Clone your repository or download the code
git clone https://github.com/YOUR_GITHUB/layoffers.git
cd layoffers

# Or if not on GitHub yet, create a local folder and copy files:
# Copy all your project files to a local directory
```

### 4.2 Verify Local Build

```bash
# Install dependencies
npm install

# Test local build
npm run build

# Test local server
npm start
# Should show: "5:44:57 AM [express] serving on port 5000"
```

---

## Step 5: Build and Deploy

### 5.1 Deploy Manually (First Time)

```bash
# Set your project ID
PROJECT_ID=layoffers-prod
REGION=asia-south1

# Build image locally (optional, for testing)
docker build -t gcr.io/$PROJECT_ID/layoffers:latest .

# Deploy to Cloud Run directly
gcloud run deploy layoffers \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 3600 \
  --max-instances 100 \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="DATABASE_URL=layoffers-db-url:latest,SESSION_SECRET=layoffers-session-secret:latest" \
  --service-account=$PROJECT_NUMBER-compute@developer.gserviceaccount.com

# Output will show your service URL:
# Service URL: https://layoffers-RANDOM.a.run.app
```

### 5.2 Verify Deployment

```bash
# Get the service URL
SERVICE_URL=$(gcloud run services describe layoffers --region $REGION --format='value(status.url)')

# Test the endpoint
curl $SERVICE_URL
# Should return HTML (the landing page)

# Check logs
gcloud run services describe layoffers --region $REGION
```

---

## Step 6: Connect Your Custom Domain

### 6.1 Add Custom Domain Mapping

```bash
# Add your domain to Cloud Run
gcloud run domain-mappings create \
  --service=layoffers \
  --domain=www.layoffers.in \
  --region=$REGION

# Get DNS records
gcloud run domain-mappings describe www.layoffers.in --region=$REGION
```

### 6.2 Update GoDaddy DNS

1. Go to GoDaddy DNS Management
2. Add/Update these records:
   - **Type**: A
   - **Name**: @
   - **Value**: 216.239.32.21 (or IP shown in Cloud Run)
   
   OR for CNAME:
   - **Type**: CNAME
   - **Name**: www
   - **Value**: ghs.googlehosted.com

3. Wait 5-30 minutes for DNS propagation
4. Test: `curl https://www.layoffers.in`

---

## Step 7: Setup CI/CD with Cloud Build (Optional but Recommended)

### 7.1 Connect GitHub Repository

```bash
# Create a Cloud Build trigger
gcloud builds triggers create github \
  --name="layoffers-deploy" \
  --repo-name=layoffers \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml \
  --service-account=projects/$PROJECT_ID/serviceAccounts/cloud-builds@$PROJECT_ID.iam.gserviceaccount.com
```

### 7.2 Automatic Deployment

Now every time you push to `main` branch:
1. Cloud Build automatically builds Docker image
2. Pushes to Container Registry
3. Deploys to Cloud Run
4. Your app updates automatically!

---

## Step 8: Database Initialization & Migrations

### 8.1 Run Database Migrations (First Time Only)

```bash
# Connect to Cloud SQL instance
gcloud sql connect layoffers-db --user=postgres

# Or run migrations programmatically:
# Your app should run: npm run db:push on startup
```

### 8.2 Setup Database Proxy (Optional for Local Development)

```bash
# If you need to develop locally with production DB:
cloud_sql_proxy -instances=PROJECT_ID:asia-south1:layoffers-db=tcp:5432 &

# Then connect with:
# DATABASE_URL=postgresql://layoffers_user:PASSWORD@localhost:5432/layoffers_db
```

---

## Monitoring & Maintenance

### View Logs

```bash
# Stream recent logs
gcloud run services logs read layoffers --limit 50

# Or view in Cloud Console:
# https://console.cloud.google.com/run?project=layoffers-prod
```

### Monitor Resource Usage

```bash
# Check Cloud Run metrics
gcloud run services describe layoffers --region $REGION

# View billing
# https://console.cloud.google.com/billing?project=layoffers-prod
```

### Common Issues

**Issue: "Connection refused" to database**
- Solution: Check Cloud SQL instance is running
- Verify SECRET stores correct DATABASE_URL
- Check service account has secret accessor permission

**Issue: "Request timeout"**
- Increase timeout: `--timeout 3600`
- Check if app is stuck in infinite loop
- View logs for errors

**Issue: High costs**
- Set `--max-instances 10` to limit scaling
- Use `db-f1-micro` for database (free tier)
- Monitor usage in Cloud Console

---

## Cost Estimation (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| Cloud Run | 2 million requests/mo | ₹200-500 |
| Cloud SQL | db-f1-micro | ₹800-1,200 |
| Storage | 10GB | ₹200 |
| Data Transfer | 10GB | ₹150 |
| **Total** | | **₹1,350-1,850/mo** |

With ₹25,000 budget, you have **13+ months of free tier usage!**

---

## Update Your App

To deploy new changes:

```bash
# If using GitHub + Cloud Build (automatic):
git add .
git commit -m "New feature"
git push origin main
# Cloud Build automatically deploys

# If deploying manually:
gcloud run deploy layoffers --source .
```

---

## Rollback to Previous Version

```bash
# View all revisions
gcloud run services describe layoffers --region $REGION

# Traffic splits (if needed)
gcloud run services update-traffic layoffers \
  --to-revisions REVISION_NAME=100 \
  --region $REGION
```

---

## Next Steps

1. ✅ Setup GCP Project
2. ✅ Create Cloud SQL Database
3. ✅ Deploy to Cloud Run
4. ✅ Connect Custom Domain
5. ✅ Setup Auto-deployment (CI/CD)
6. ✅ Monitor and Scale

**Need help?** Check Cloud Run documentation: https://cloud.google.com/run/docs

---

## Support & Documentation

- **Cloud Run Docs**: https://cloud.google.com/run/docs
- **Cloud SQL Docs**: https://cloud.google.com/sql/docs
- **Cloud Build Docs**: https://cloud.google.com/build/docs
- **Pricing Calculator**: https://cloud.google.com/products/calculator

---

**Happy deploying! 🚀**
