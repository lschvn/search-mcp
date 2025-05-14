// src/mcp/server.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
// Removed direct service imports as they are now in individual handlers

// Import handlers from their new location
import { searchWebHandler } from './tools/search-web.handler.js';
import { searchGithubHandler } from './tools/search-github.handler.js';
import { fetchUrlHandler } from './tools/fetch-url.handler.js';

// Removed old handler definitions that were here

export function buildServer() {
  const server = new McpServer({
    name: 'Search-MCP',
    version: '0.1.0',
  });

  /* ---------- TOOL 1 : Web search ---------- */
  server.tool(
    'search-web',
    {
      query: z.string().describe('The search query'),
      limit: z.number().int().min(1).max(30).optional()
        .describe('Max number of results (default 10)'),
    },
    {
      description: '100% free DuckDuckGo search (no API key required)',
    },
    searchWebHandler, // Use imported handler
  );

  /* ---------- TOOL 2 : GitHub search ---------- */
  server.tool(
    'search-github',
    {
      query: z.string().describe('GitHub syntax: e.g. repo:microsoft/vscode language:ts "QuickPick"'),
      perPage: z.number().int().min(1).max(100).optional()
        .describe('Results per page (<= 100, default 20)'),
    },
    {
      description: 'Advanced search in public GitHub code (REST v3)',
    },
    searchGithubHandler, // Use imported handler
  );

  /* ---------- TOOL 3 : Fetch URL ---------- */
  server.tool(
    'fetch-url',
    {
      url: z.string().url().describe('HTTP/HTTPS URL to fetch'),
    },
    {
      description: 'Downloads a web page, extracts readable content, and converts it to clean Markdown.',
    },
    fetchUrlHandler, // Use imported handler
  );

  return server;
}