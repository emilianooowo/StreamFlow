import { Hono } from 'hono';
import { sql, type Video, type Category } from '../db/database.ts';
import { authMiddleware, optionalAuth } from '../middleware/auth.ts';
import { getPresignedUrl, BUCKETS } from '../services/minio.ts';

const catalog = new Hono();

interface VideoWithCategory extends Video {
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface CatalogResponse {
  videos: VideoWithCategory[];
  total: number;
  page: number;
  page_size: number;
}

catalog.get('/', optionalAuth, async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const pageSize = parseInt(c.req.query('page_size') || '20');
    const category = c.req.query('category');
    const search = c.req.query('search');

    const offset = (page - 1) * pageSize;

    let query = sql`
      SELECT v.id, v.title, v.description, v.category_id, v.hls_path, 
             v.poster_path, v.duration, v.file_size, v.is_processed, 
             v.is_published, v.created_at, v.updated_at,
             c.id as cat_id, c.name as cat_name, c.slug as cat_slug
      FROM videos v
      LEFT JOIN categories c ON v.category_id = c.id
      WHERE v.is_published = true AND v.is_processed = true
    `;

    let totalQuery = sql`
      SELECT COUNT(*) as total FROM videos 
      WHERE is_published = true AND is_processed = true
    `;

    if (category) {
      query = sql`
        SELECT v.id, v.title, v.description, v.category_id, v.hls_path, 
               v.poster_path, v.duration, v.file_size, v.is_processed, 
               v.is_published, v.created_at, v.updated_at,
               c.id as cat_id, c.name as cat_name, c.slug as cat_slug
        FROM videos v
        LEFT JOIN categories c ON v.category_id = c.id
        WHERE v.is_published = true AND v.is_processed = true AND v.category_id = ${category}
        ORDER BY v.created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;

      totalQuery = sql`
        SELECT COUNT(*) as total FROM videos 
        WHERE is_published = true AND is_processed = true AND category_id = ${category}
      `;
    } else if (search) {
      query = sql`
        SELECT v.id, v.title, v.description, v.category_id, v.hls_path, 
               v.poster_path, v.duration, v.file_size, v.is_processed, 
               v.is_published, v.created_at, v.updated_at,
               c.id as cat_id, c.name as cat_name, c.slug as cat_slug
        FROM videos v
        LEFT JOIN categories c ON v.category_id = c.id
        WHERE v.is_published = true AND v.is_processed = true 
          AND (v.title ILIKE ${'%' + search + '%'} OR v.description ILIKE ${'%' + search + '%'})
        ORDER BY v.created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;

      totalQuery = sql`
        SELECT COUNT(*) as total FROM videos 
        WHERE is_published = true AND is_processed = true 
          AND (title ILIKE ${'%' + search + '%'} OR description ILIKE ${'%' + search + '%'})
      `;
    } else {
      query = sql`
        SELECT v.id, v.title, v.description, v.category_id, v.hls_path, 
               v.poster_path, v.duration, v.file_size, v.is_processed, 
               v.is_published, v.created_at, v.updated_at,
               c.id as cat_id, c.name as cat_name, c.slug as cat_slug
        FROM videos v
        LEFT JOIN categories c ON v.category_id = c.id
        WHERE v.is_published = true AND v.is_processed = true
        ORDER BY v.created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `;
    }

    const videos = await query;
    const totalResult = await totalQuery;
    const total = Number(totalResult[0].total);

    const processedVideos = videos.map((v: Record<string, unknown>) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      category_id: v.category_id,
      hls_path: v.hls_path,
      poster_path: v.poster_path,
      duration: v.duration,
      file_size: v.file_size,
      is_processed: v.is_processed,
      is_published: v.is_published,
      created_at: v.created_at,
      updated_at: v.updated_at,
      category: v.cat_id ? {
        id: v.cat_id,
        name: v.cat_name,
        slug: v.cat_slug,
      } : null,
    }));

    return c.json({
      videos: processedVideos,
      total,
      page,
      page_size: pageSize,
    } as CatalogResponse);
  } catch (error) {
    console.error('Catalog error:', error);
    return c.json({ error: 'Failed to fetch catalog' }, 500);
  }
});

catalog.get('/:id', optionalAuth, async (c) => {
  try {
    const id = c.req.param('id');

    const videos = await sql`
      SELECT v.id, v.title, v.description, v.category_id, v.hls_path, 
             v.poster_path, v.duration, v.file_size, v.is_processed, 
             v.is_published, v.created_at, v.updated_at,
             c.id as cat_id, c.name as cat_name, c.slug as cat_slug
      FROM videos v
      LEFT JOIN categories c ON v.category_id = c.id
      WHERE v.id = ${id}
    `;

    if (videos.length === 0) {
      return c.json({ error: 'Video not found' }, 404);
    }

    const v = videos[0] as Record<string, unknown>;

    return c.json({
      id: v.id,
      title: v.title,
      description: v.description,
      category_id: v.category_id,
      hls_path: v.hls_path,
      poster_path: v.poster_path,
      duration: v.duration,
      file_size: v.file_size,
      is_processed: v.is_processed,
      is_published: v.is_published,
      created_at: v.created_at,
      updated_at: v.updated_at,
      category: v.cat_id ? {
        id: v.cat_id,
        name: v.cat_name,
        slug: v.cat_slug,
      } : null,
    });
  } catch (error) {
    console.error('Video fetch error:', error);
    return c.json({ error: 'Failed to fetch video' }, 500);
  }
});

export default catalog;
