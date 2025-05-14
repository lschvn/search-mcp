// src/index.ts
import express from 'express';
import { buildServer } from './src/mcp/server';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';

const app = express().use(express.json());
const PORT = process.env.PORT ?? 3000;

/* --- sessions en mémoire (stateless possible) --- */
const transports: Record<string, StreamableHTTPServerTransport> = {};

app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports[sessionId]) {
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest(req.body)) {
    const server = buildServer();
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sid) => { transports[sid] = transport; },
    });
    transport.onclose = () => { if (transport.sessionId) delete transports[transport.sessionId]; };
    await server.connect(transport);
  } else {
    res.status(400).json({ error: 'Invalid session' });
    return;
  }

  await transport.handleRequest(req, res, req.body);
});

/* notifications SSE (optional) */
app.get('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  const transport = sessionId && transports[sessionId];
  if (!transport) { res.status(400).end(); return; }
  await transport.handleRequest(req, res);
});

app.listen(PORT, () => console.log(`🚀 MCP server on http://localhost:${PORT}`));
