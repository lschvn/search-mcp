import { duckSearch } from '../../services/duckduck.service.js';

export const searchWebHandler = async ({ query, limit }: { query: string; limit?: number }) => {
  const hits = await duckSearch(query, limit);
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify(hits, null, 2),
    }],
  };
}; 