import express from 'express';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';

// Import tool handlers
import { searchWebHandler } from './mcp/tools/search-web.handler.js';
import { searchGithubHandler } from './mcp/tools/search-github.handler.js';
import { fetchUrlHandler } from './mcp/tools/fetch-url.handler.js';

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

const mcpSessions: { [sessionId: string]: StreamableHTTPServerTransport } = {};

const getInitializedMcpServer = () => {
  const server = new McpServer({
    name: 'Search-MCP',
    version: '0.1.0',
  });

  const toolDefinitions = [
    {
      name: 'search-web',
      schema: z.object({
        query: z.string().describe('The search query'),
        limit: z.number().int().min(1).max(30).optional().describe('Max number of results (default 10)'),
      }),
      description: '100% free DuckDuckGo search (no API key required)',
      handler: searchWebHandler,
    },
    {
      name: 'search-github',
      schema: z.object({
        query: z.string().describe('GitHub syntax: e.g. repo:microsoft/vscode language:ts "QuickPick"'),
        perPage: z.number().int().min(1).max(100).optional().describe('Results per page (<= 100, default 20)'),
      }),
      description: 'Advanced search in public GitHub code (REST v3)',
      handler: searchGithubHandler,
    },
    {
      name: 'fetch-url',
      schema: z.object({
        url: z.string().url().describe('HTTP/HTTPS URL to fetch'),
      }),
      description: 'Downloads a web page, extracts readable content, and converts it to clean Markdown.',
      handler: fetchUrlHandler,
    },
  ];

  toolDefinitions.forEach(td => {
    // Using the 3-argument version with .shape as per our last successful test setup for tool execution
    // Descriptions here are not passed to this server.tool call variant but kept in toolDefinitions for clarity
    server.tool(td.name, td.schema.shape, td.handler as any);
  });
  // We only need to return the server instance now
  return server;
};

app.all('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && mcpSessions[sessionId]) {
    transport = mcpSessions[sessionId];
  } else if ((!sessionId || !mcpSessions[sessionId]) && req.method === 'POST' && isInitializeRequest(req.body)) {
    const newSessionId = randomUUID();
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => newSessionId,
      onsessioninitialized: (sId) => {
        mcpSessions[sId] = transport;
        console.log(`MCP Session initialized: ${sId}`);
      },
    });

    transport.onclose = () => {
      if (transport.sessionId && mcpSessions[transport.sessionId]) {
        delete mcpSessions[transport.sessionId];
        console.log(`MCP Session closed and removed: ${transport.sessionId}`);
      }
    };
    
    const mcpServerInstance = getInitializedMcpServer(); // Get a new server instance with tools registered
    await mcpServerInstance.connect(transport);
    console.log(`McpServer connected for new session: ${transport.sessionId || newSessionId}`);

  } else {
    res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Bad Request: No valid session ID provided for non-POST-initialize request, or session not found.' },
      id: req.body?.id ?? null,
    });
    return;
  }

  await transport.handleRequest(req, res, req.body);
});

app.listen(port, () => {
  console.log(`search-mcp server running on http://localhost:${port}`);
  console.log(`MCP tools available at POST http://localhost:${port}/mcp`);
});