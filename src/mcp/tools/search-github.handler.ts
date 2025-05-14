import { githubCodeSearch } from '../../services/github.service.js';

export const searchGithubHandler = async ({ query, perPage }: { query: string; perPage?: number }) => {
  const hits = await githubCodeSearch(query, perPage);
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify(hits, null, 2),
    }],
  };
}; 