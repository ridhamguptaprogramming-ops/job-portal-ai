# job-portal-ai
Professional AI-powered job discovery and recommendation platform

## Resume analysis storage

The Node/Express API stores each signed-in user's latest resume filename and AI
analysis in the MongoDB-compatible `resume_analyses` collection. Source resume
text and file contents are not stored. The API verifies Firebase ID tokens with
Firebase Admin before reading or writing records.

Configure these server-side environment variables in the API deployment (for
example, Vercel project settings); do not commit their values:

- `MONGODB_URI`: the complete MongoDB-compatible connection URI.
- `FIREBASE_SERVICE_ACCOUNT_JSON`: the Firebase service account JSON for the
  same Firebase project as the client app.

Use Node.js 22 or newer. The Firebase service account must be kept private. The
MongoDB client is reused per warm serverless instance with a small connection
pool (`maxPoolSize` 5); aggregate connections scale with the number of active
instances, so monitor server-side connection counts and latency under peak load
before changing pool settings. Percent-encode reserved characters in MongoDB
usernames and passwords before placing the URI in the environment variable.

## Firebase authentication and account identity

Firebase is the identity provider; PostgreSQL records are keyed only by the
verified Firebase UID. The frontend sends authentication, current-user, legal
document, and onboarding requests to `VITE_AUTH_API_URL` (defaults to the
FastAPI service at `https://job-portal-fastapi.onrender.com`). Set that variable
to the deployed FastAPI origin for a different environment.

Before deploying the FastAPI changes, apply the one-time schema migration to
the PostgreSQL database configured as `DATABASE_URL`:

```sh
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f backend/migrations/001_firebase_identity.sql
```

The migration requires no account backfill because the production database was
confirmed to contain no user accounts. It adds a non-null unique Firebase UID
and case-insensitive unique email index, plus durable consent records. Do not
run it against a database with existing user records without first planning a
UID backfill and conflict review.

Set `FIREBASE_PROJECT_ID` on the FastAPI service when using a project other than
`job-portal-ai-818f8`. Configure FastAPI `CORS_ORIGINS` for each exact frontend
origin. Enable Email/Password and Google providers in Firebase Authentication;
email/password accounts must verify their email before account creation is
synchronized or onboarding is allowed. Google accounts that conflict with an
existing provider must sign in to that account and link Google through Firebase
so the existing UID is preserved.

## Job data and candidate activity

Before deploying the PostgreSQL-backed job and account routes, apply both
migrations in order to the database configured by `DATABASE_URL`:

```sh
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f backend/migrations/001_firebase_identity.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f backend/migrations/002_job_data.sql
```

Configure `VITE_API_URL` to the deployed FastAPI origin for jobs, saved jobs,
applications, and account data. `VITE_AUTH_API_URL` controls the auth and
onboarding routes and defaults to `VITE_API_URL`. The frontend's configured
Render origin must be updated if that service URL changes. Set FastAPI
`CORS_ORIGINS` to the exact deployed frontend origins. The Express server uses
the same variable (as a JSON array or comma-separated list) and does not allow
arbitrary origins.

Job listings are read from PostgreSQL and are limited to active listings from
verified sources. This repository does not include a configured job-feed
ingestion process; until real verified job data is loaded, the job list will
correctly be empty. Applying opens the listing's employer URL and lets the
candidate record a start or self-reported submission in their tracker. The
application record does not confirm employer receipt, and the app does not
dispatch applications or confirmation emails. GitHub and LinkedIn account
linking, OAuth sync, and direct ATS integrations remain unavailable until their
official OAuth/API flows and credentials are configured.
