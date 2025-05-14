import { Markdown } from '../../services/markdown.service.js';

export const fetchUrlHandler = async ({ url }: { url: string }) => {
  const md = await Markdown.fetchUrl(url);
  return {
    content: [{
      type: 'text' as const,
      text: md,
    }],
  };
}; 