/**
 * Video Processing Worker
 * 
 * This worker handles video transcoding using FFmpeg.
 * It converts uploaded videos to HLS format for adaptive streaming.
 * 
 * Usage: deno task worker
 */

import { Client } from 'npm:minio@^7.1.3';
import { sql } from '../db/database.ts';
import { env } from '../utils/env.ts';
import { initDatabase } from '../db/database.ts';

// Initialize database connection
await initDatabase();

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

interface VideoJob {
  videoId: string;
  rawKey: string;
  title: string;
}

/**
 * Process a video: download from MinIO, transcode to HLS, upload back to MinIO
 */
async function processVideoJob(job: VideoJob): Promise<boolean> {
  const { videoId, rawKey, title } = job;
  const workDir = `/tmp/streamflow/${videoId}`;
  
  console.log(`🎬 Processing video: ${title} (${videoId})`);
  
  try {
    // Create work directory
    await Deno.mkdir(workDir, { recursive: true });
    
    // 1. Download raw video from MinIO
    console.log(`📥 Downloading ${rawKey}...`);
    const rawPath = `${workDir}/input.mp4`;
    const rawStream = await minioClient.getObject(BUCKETS.RAW, rawKey);
    const rawChunks: Uint8Array[] = [];
    for await (const chunk of rawStream) {
      rawChunks.push(chunk);
    }
    await Deno.writeFile(rawPath, new Uint8Array(rawChunks.reduce((acc, c) => acc + c.length, 0)));
    
    // Write chunks properly
    const rawData = new Uint8Array(rawChunks.reduce((acc, c) => acc + c.length, 0));
    let offset = 0;
    for (const chunk of rawChunks) {
      rawData.set(chunk, offset);
      offset += chunk.length;
    }
    await Deno.writeFile(rawPath, rawData);
    
    // 2. Get video metadata using ffprobe
    console.log(`🔍 Analyzing video...`);
    const probe = await runCommand('ffprobe', [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format', '-show_streams',
      rawPath
    ]);
    const metadata = JSON.parse(probe);
    const videoStream = metadata.streams.find((s: any) => s.codec_type === 'video');
    const duration = parseFloat(metadata.format.duration) || 0;
    
    // 3. Generate thumbnail
    console.log(`🖼️ Generating thumbnail...`);
    await runCommand('ffmpeg', [
      '-y', '-i', rawPath,
      '-ss', '00:00:05',
      '-vframes', '1',
      '-vf', 'scale=640:-1',
      `${workDir}/thumbnail.jpg`
    ]);
    
    // Upload thumbnail
    const thumbData = await Deno.readFile(`${workDir}/thumbnail.jpg`);
    await minioClient.putObject(BUCKETS.THUMBS, `${videoId}.jpg`, thumbData, { 'Content-Type': 'image/jpeg' });
    
    // 4. Transcode to HLS
    console.log(`⚙️ Transcoding to HLS...`);
    const hlsDir = `${workDir}/hls`;
    await Deno.mkdir(hlsDir, { recursive: true });
    
    // HLS encoding with multiple qualities
    const qualities = [
      { name: '360p', width: 640, videoBitrate: '800k', audioBitrate: '96k' },
      { name: '720p', width: 1280, videoBitrate: '2500k', audioBitrate: '128k' },
    ];
    
    const outputPaths: string[] = [];
    for (const q of qualities) {
      console.log(`  → Encoding ${q.name}...`);
      const variantPath = `${hlsDir}/${q.name}.m3u8`;
      
      await runCommand('ffmpeg', [
        '-y', '-i', rawPath,
        '-c:v', 'libx264',
        '-crf', '23',
        '-preset', 'fast',
        '-vf', `scale=${q.width}:-2`,
        '-b:v', q.videoBitrate,
        '-c:a', 'aac',
        '-b:a', q.audioBitrate,
        '-hls_time', '6',
        '-hls_list_size', '0',
        '-hls_segment_filename', `${hlsDir}/${q.name}_%03d.ts`,
        variantPath
      ]);
      outputPaths.push(variantPath);
    }
    
    // 5. Generate master playlist
    const masterPlaylist = `#EXTM3U
#EXT-X-VERSION:3
${qualities.map((q, i) => `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(q.videoBitrate) * 1000 + parseInt(q.audioBitrate) * 1000},RESOLUTION=${q.width}x${Math.round(q.width * 9 / 16)}} ${q.name}/playlist.m3u8`).join('\n')}
`;
    
    await Deno.writeTextFile(`${hlsDir}/master.m3u8`, masterPlaylist);
    
    // 6. Upload HLS segments to MinIO
    console.log(`📤 Uploading HLS segments...`);
    const hlsFiles = Array.from(Deno.readDirSync(hlsDir));
    for (const file of hlsFiles) {
      const data = await Deno.readFile(`${hlsDir}/${file.name}`);
      const segmentPath = `hls/${videoId}/${file.name}`;
      await minioClient.putObject(BUCKETS.VOD, segmentPath, data, { 'Content-Type': 'application/x-mpegURL' });
    }
    
    // 7. Update database
    const hlsPath = `/hls/${videoId}/master.m3u8`;
    const thumbnailUrl = `/thumbnails/${videoId}.jpg`;
    
    await sql`
      UPDATE videos 
      SET is_processed = true, 
          is_published = true,
          hls_path = ${hlsPath},
          poster_path = ${thumbnailUrl},
          duration = ${Math.round(duration)},
          file_size = ${metadata.format.size || null}
      WHERE id = ${videoId}
    `;
    
    console.log(`✅ Video ${title} processed successfully!`);
    
    // Cleanup
    await Deno.remove(workDir, { recursive: true });
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to process video ${videoId}:`, error);
    
    await sql`UPDATE videos SET is_processed = false WHERE id = ${videoId}`;
    
    // Cleanup on error
    try {
      await Deno.remove(workDir, { recursive: true });
    } catch {}
    
    return false;
  }
}

/**
 * Run a shell command
 */
async function runCommand(cmd: string, args: string[]): Promise<string> {
  const process = Deno.run({
    cmd: [cmd, ...args],
    stdout: 'piped',
    stderr: 'piped',
  });
  
  const [stdout, stderr] = await Promise.all([
    process.output(),
    process.stderrOutput(),
  ]);
  
  const exitCode = await process.status();
  
  if (!exitCode.success) {
    const error = new TextDecoder().decode(stderr);
    throw new Error(`Command failed: ${error}`);
  }
  
  return new TextDecoder().decode(stdout);
}

/**
 * Poll for pending video processing jobs
 */
async function pollForJobs() {
  console.log('🔄 Video processor worker started, polling for jobs...');
  
  while (true) {
    try {
      // Find unprocessed videos that need processing
      const pendingVideos = await sql`
        SELECT id, title, hls_path 
        FROM videos 
        WHERE is_processed = false 
        ORDER BY created_at ASC 
        LIMIT 1
      `;
      
      if (pendingVideos.length > 0) {
        const video = pendingVideos[0];
        // Extract raw key from hls_path (it contains the video ID)
        const rawKey = `raw/${video.id}.mp4`; // Assuming mp4 format
        
        await processVideoJob({
          videoId: video.id,
          rawKey,
          title: video.title,
        });
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
    
    // Poll every 10 seconds
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}

// Start the worker
pollForJobs();