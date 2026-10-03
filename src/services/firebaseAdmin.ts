import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';

export class RequestAuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'RequestAuthError';
  }
}

function getFirebaseAdminAuth() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new RequestAuthError(
      'Firebase Admin authentication is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON.',
      503
    );
  }

  let serviceAccountJsonObject: Record<string, unknown>;
  try {
    serviceAccountJsonObject = JSON.parse(serviceAccountJson);
  } catch {
    throw new RequestAuthError('FIREBASE_SERVICE_ACCOUNT_JSON must contain valid service-account JSON.', 503);
  }

  const serviceAccount: ServiceAccount = {
    projectId: String(serviceAccountJsonObject.project_id || serviceAccountJsonObject.projectId || ''),
    clientEmail: String(serviceAccountJsonObject.client_email || serviceAccountJsonObject.clientEmail || ''),
    privateKey: String(serviceAccountJsonObject.private_key || serviceAccountJsonObject.privateKey || '')
  };
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    throw new RequestAuthError('FIREBASE_SERVICE_ACCOUNT_JSON is missing required service-account fields.', 503);
  }

  try {
    const appName = 'resume-storage-auth';
    const app = getApps().find((existingApp) => existingApp.name === appName)
      || initializeApp({ credential: cert(serviceAccount) }, appName);
    return getAuth(app);
  } catch {
    throw new RequestAuthError('FIREBASE_SERVICE_ACCOUNT_JSON could not initialize Firebase Admin.', 503);
  }
}

export async function verifyFirebaseBearerClaims(authorization: string | undefined): Promise<DecodedIdToken> {
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new RequestAuthError('A valid Firebase sign-in is required for this endpoint.', 401);
  }

  try {
    return await getFirebaseAdminAuth().verifyIdToken(match[1]);
  } catch (error) {
    if (error instanceof RequestAuthError) throw error;
    throw new RequestAuthError('The Firebase sign-in token is invalid or expired.', 401);
  }
}

export async function verifyFirebaseBearerToken(authorization: string | undefined): Promise<string> {
  const decodedToken = await verifyFirebaseBearerClaims(authorization);
  return decodedToken.uid;
}
