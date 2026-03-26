import { Hono } from 'hono';
import { sql } from '../db/database.ts';
import { optionalAuth } from '../middleware/auth.ts';

const categories = new Hono();

categories.get('/', optionalAuth, async (c) => {
  try {
    const allCategories = await sql`
      SELECT id, name, slug, description, created_at
      FROM categories
      ORDER BY name ASC
    `;

    return c.json(allCategories);
  } catch (error) {
    console.error('Categories fetch error:', error);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

categories.get('/:id', optionalAuth, async (c) => {
  try {
    const id = c.req.param('id');

    const categoriesResult = await sql`
      SELECT id, name, slug, description, created_at
      FROM categories
      WHERE id = ${id}
    `;

    if (categoriesResult.length === 0) {
      return c.json({ error: 'Category not found' }, 404);
    }

    return c.json(categoriesResult[0]);
  } catch (error) {
    console.error('Category fetch error:', error);
    return c.json({ error: 'Failed to fetch category' }, 500);
  }
});

export default categories;
