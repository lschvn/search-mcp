import { search } from 'duck-duck-scrape';
import type { WebHit } from '../types/index.js';

export async function duckSearch(query: string, limit = 10): Promise<WebHit[]> {
  const { results } = await search(query, { safeSearch: 0 });
  return results.slice(0, limit).map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.description,
  }));
}
