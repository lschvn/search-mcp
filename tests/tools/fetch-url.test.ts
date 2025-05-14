import { describe, it, expect, vi } from 'vitest';
import type { Mock } from 'vitest';
import { fetchUrlHandler } from '../../src/mcp/tools/fetch-url.handler.js';
import { Markdown } from '../../src/services/markdown.service.js';

vi.mock('../../src/services/markdown.service.js', () => ({
  Markdown: {
    fetchUrl: vi.fn(),
  },
}));

describe('Fetch URL Tool Handler', () => {
  it('should call Markdown.fetchUrl with the provided URL and return its result', async () => {
    const mockUrl = 'http://example.com';
    const mockMarkdownContent = '# Example Content';
    (Markdown.fetchUrl as Mock).mockResolvedValue(mockMarkdownContent);

    // @ts-expect-error - extra is not used
    const result = await fetchUrlHandler({ url: mockUrl }, {});

    expect(Markdown.fetchUrl).toHaveBeenCalledWith(mockUrl);
    expect(result.content[0]!.text).toBe(mockMarkdownContent);
  });
}); 