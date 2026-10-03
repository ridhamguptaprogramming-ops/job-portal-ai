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
