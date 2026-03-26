import { Client } from 'npm:minio@^7.1.3';
import { env } from '../utils/env.ts';

const minioClient = new Client({
  endPoint: env.MINIO_ENDPOINT.split(':')[0] || 'localhost',
  port: parseInt(env.MINIO_ENDPOINT.split(':')[1]) || 9000,
  useSSL: false,
  accessKey: env.MINIO_USER,
  secretKey: env.MINIO_PASSWORD,
});

const BUCKETS = {
  RAW: env.MINIO_BUCKET_RAW,
  VOD: env.MINIO_BUCKET_VOD,
  THUMBS: env.MINIO_BUCKET_THUMBS,
};

export { minioClient, BUCKETS };

export async function ensureBuckets() {
  const buckets = [BUCKETS.RAW, BUCKETS.VOD, BUCKETS.THUMBS];
  
  for (const bucket of buckets) {
    const exists = await minioClient.bucketExists(bucket);
    if (!exists) {
      await minioClient.makeBucket(bucket);
      console.log(`Bucket ${bucket} created`);
    }
  }
}

export async function uploadFile(bucket: string, objectName: string, filePath: string, contentType?: string) {
  await minioClient.fPutObject(bucket, objectName, filePath, { 'Content-Type': contentType || 'application/octet-stream' });
}

export async function uploadBuffer(bucket: string, objectName: string, buffer: Uint8Array, contentType?: string) {
  await minioClient.putObject(bucket, objectName, buffer, { 'Content-Type': contentType || 'application/octet-stream' });
}

export function getPresignedUrl(bucket: string, objectName: string, expirySeconds = 3600): string {
  return minioClient.presignedUrl('GET', bucket, objectName, expirySeconds);
}

export async function getObject(bucket: string, objectName: string): Promise<Uint8Array> {
  const stream = await minioClient.getObject(bucket, objectName);
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
}
