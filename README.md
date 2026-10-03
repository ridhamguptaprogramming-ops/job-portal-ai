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
