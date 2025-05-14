import { describe, it, expect, vi } from 'vitest';
import type { Mock } from 'vitest'; // Import Mock as a type
import { searchWebHandler } from '../../src/mcp/tools/search-web.handler.js'; // Updated path
import { duckSearch } from '../../src/services/duckduck.service.js';

// Mock the duckSearch service
vi.mock('../../src/services/duckduck.service.js', () => ({
  duckSearch: vi.fn(),
}));

describe('Search Web Tool Handler', () => {
  it('should call duckSearch and return stringified hits', async () => {
    const mockQuery = 'test query';
    const mockHits = [{ title: 'Test Result', url: 'http://example.com' }];
    (duckSearch as Mock).mockResolvedValue(mockHits);

    // @ts-expect-error - extra (second arg) is not used in this test
    const result = await searchWebHandler({ query: mockQuery }, {}); 

    expect(duckSearch).toHaveBeenCalledWith(mockQuery, undefined);
    // The handler always returns a content array with one element.
    expect(result.content[0]!.text).toBe(JSON.stringify(mockHits, null, 2));
  });

  it('should call duckSearch with limit and return stringified hits', async () => {
    const mockQuery = 'another query';
    const mockLimit = 5;
    const mockHits = [{ title: 'Another Result', url: 'http://example.org' }];
    (duckSearch as Mock).mockResolvedValue(mockHits);

    // @ts-expect-error - extra (second arg) is not used in this test
    const result = await searchWebHandler({ query: mockQuery, limit: mockLimit }, {});

    expect(duckSearch).toHaveBeenCalledWith(mockQuery, mockLimit);
    // The handler always returns a content array with one element.
    expect(result.content[0]!.text).toBe(JSON.stringify(mockHits, null, 2));
  });

  it('should correctly stringify empty hits array', async () => {
    const mockQuery = 'empty query';
    const mockHits:unknown[] = []; // Ensure mockHits is an empty array
    (duckSearch as Mock).mockResolvedValue(mockHits);

    // @ts-expect-error - extra (second arg) is not used in this test
    const result = await searchWebHandler({ query: mockQuery }, {}); 

    expect(duckSearch).toHaveBeenCalledWith(mockQuery, undefined);
    expect(result.content[0]!.text).toBe(JSON.stringify([], null, 2)); // hits will be an empty array
  });
}); 