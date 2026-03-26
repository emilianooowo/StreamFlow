import { env } from '../utils/env.ts';

const cache = new Map<string, { value: string; expiry: number }>();

export async function setCache(key: string, value: string, ttlSeconds = 3600) {
  cache.set(key, { value, expiry: Date.now() + ttlSeconds * 1000 });
}

export async function getCache(key: string): Promise<string | null> {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

export async function deleteCache(key: string) {
  cache.delete(key);
}

export async function closeRedis() {
  cache.clear();
}
