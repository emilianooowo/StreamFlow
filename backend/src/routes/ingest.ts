import { Hono } from 'hono';
import { sql } from '../db/database.ts';
import { authMiddleware, requireAdmin } from '../middleware/auth.ts';
import { uploadBuffer, BUCKETS } from '../services/minio.ts';

const ingest = new Hono();

async function processVideo(videoId: string, rawKey: string, title: string) {
  // IMPORTANT: This placeholder function is deprecated.
  // Real video processing is handled by src/workers/video-processor.ts
  // This function exists only to mark videos for worker processing.
  // The worker polls the database for is_processed=false videos.
  console.log(`📋 Video ${videoId} queued for worker processing: ${title}`);
}

ingest.post('/', authMiddleware, requireAdmin, async (c) => {
  try {
    const formData = await c.req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const categoryId = formData.get('category_id') as string | null;
    const videoFile = formData.get('video') as File | null;

    if (!title || !videoFile) {
      return c.json({ error: 'Title and video file are required' }, 400);
    }

    if (!title.trim()) {
      return c.json({ error: 'Title cannot be empty' }, 400);
    }

    const videoId = crypto.randomUUID();
    const fileExtension = videoFile.name.split('.').pop() || 'mp4';
    const rawKey = `raw/${videoId}.${fileExtension}`;

    const videoBuffer = await videoFile.arrayBuffer();
    await uploadBuffer(
      BUCKETS.RAW,
      rawKey,
      new Uint8Array(videoBuffer),
      videoFile.type || 'video/mp4'
    );

    const videos = await sql`
      INSERT INTO videos (id, title, description, category_id, hls_path, is_processed, is_published)
      VALUES (${videoId}, ${title}, ${description || null}, ${categoryId || null}, ${`/hls/${videoId}/playlist.m3u8`}, false, false)
      RETURNING id, title, is_processed, is_published
    `;

    const video = videos[0];

    setTimeout(() => {
      processVideo(videoId, rawKey, title);
    }, 100);

    return c.json({
      video_id: video.id,
      status: 'processing',
      title: video.title,
    }, 201);
  } catch (error) {
    console.error('Ingest error:', error);
    return c.json({ error: 'Failed to ingest video' }, 500);
  }
});

ingest.get('/status/:videoId', authMiddleware, requireAdmin, async (c) => {
  try {
    const videoId = c.req.param('videoId');

    const videos = await sql`
      SELECT id, title, is_processed, is_published
      FROM videos
      WHERE id = ${videoId}
    `;

    if (videos.length === 0) {
      return c.json({ error: 'Video not found' }, 404);
    }

    const video = videos[0];

    return c.json({
      video_id: video.id,
      title: video.title,
      status: video.is_processed ? 'completed' : 'processing',
      is_published: video.is_published,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return c.json({ error: 'Failed to check status' }, 500);
  }
});

export default ingest;
