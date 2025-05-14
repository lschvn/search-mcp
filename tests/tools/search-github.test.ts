import { describe, it, expect, vi } from 'vitest';
import type { Mock } from 'vitest';
import { searchGithubHandler } from '../../src/mcp/tools/search-github.handler.js';
import { githubCodeSearch } from '../../src/services/github.service.js';

vi.mock('../../src/services/github.service.js', () => ({
  githubCodeSearch: vi.fn(),
}));

describe('Search GitHub Tool Handler', () => {
  it('should call githubCodeSearch with the query and undefined perPage if not provided', async () => {
    const mockQuery = 'repo:microsoft/vscode language:ts QuickPick';
    const mockHits = { total_count: 1, items: [{ name: 'result.ts' }] };
    (githubCodeSearch as Mock).mockResolvedValue(mockHits);

    // @ts-expect-error - extra is not used
    const result = await searchGithubHandler({ query: mockQuery }, {});

    expect(githubCodeSearch).toHaveBeenCalledWith(mockQuery, undefined);
    expect(result.content[0]!.text).toBe(JSON.stringify(mockHits, null, 2));
  });

  it('should call githubCodeSearch with the query and provided perPage', async () => {
    const mockQuery = 'repo:owner/repo keyword';
    const mockPerPage = 10;
    const mockHits = { total_count: 0, items: [] };
    (githubCodeSearch as Mock).mockResolvedValue(mockHits);

    // @ts-expect-error - extra is not used
    const result = await searchGithubHandler({ query: mockQuery, perPage: mockPerPage }, {});

    expect(githubCodeSearch).toHaveBeenCalledWith(mockQuery, mockPerPage);
    expect(result.content[0]!.text).toBe(JSON.stringify(mockHits, null, 2));
  });
}); 