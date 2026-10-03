import { MongoClient, type Collection, type Document } from 'mongodb';

export interface ResumeAnalysisDocument extends Document {
  _id: string;
  fileName: string;
  analysis: Record<string, unknown>;
  updatedAt: Date;
}

declare global {
  // Reuse a client across requests handled by the same warm serverless instance.
  // eslint-disable-next-line no-var
  var resumeMongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getResumeAnalysesCollection(): Promise<Collection<ResumeAnalysisDocument>> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Resume storage is not configured. Set the MONGODB_URI environment variable.');
  }

  if (!globalThis.resumeMongoClientPromise) {
    const client = new MongoClient(uri, {
      // Keep each serverless instance lightweight; high concurrency scales across instances.
      maxPoolSize: 5,
      // Do not reserve idle connections in cold or infrequently used instances.
      minPoolSize: 0,
      // Release connections promptly when a warm instance becomes idle.
      maxIdleTimeMS: 30_000
    });
    globalThis.resumeMongoClientPromise = client.connect().catch((error: unknown) => {
      globalThis.resumeMongoClientPromise = undefined;
      throw error;
    });
  }

  const client = await globalThis.resumeMongoClientPromise;
  return client.db().collection<ResumeAnalysisDocument>('resume_analyses');
}
