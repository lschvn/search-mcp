# search-mcp

Welcome to search-mcp! This is a personal Model Context Protocol (MCP) server designed to provide a suite of powerful search and data retrieval tools. It's built with TypeScript and leverages the MCP SDK for seamless integration with AI agents or other MCP-compatible clients.

## Overview

This project implements an MCP server that exposes several tools for interacting with web content, code repositories, and URLs. Each tool is defined with clear schemas using Zod and can be easily called by an MCP client.

## Features

The server currently offers the following tools:

*   **Web Search:** Perform web searches using DuckDuckGo.
*   **GitHub Code Search:** Search for code snippets within public GitHub repositories.
*   **Fetch URL:** Retrieve the content of a webpage and convert it into clean Markdown.

## Technologies Used

*   **Runtime:** Bun (or Node.js)
*   **Language:** TypeScript
*   **Protocol:** Model Context Protocol (via `@modelcontextprotocol/sdk`)
*   **Schema Validation:** Zod
*   **Testing:** Vitest
*   **Core Services & Libraries:**
    *   Web Search: `duck-duck-scrape`
    *   GitHub Search: `@octokit/rest`
    *   URL Fetching & Markdown Conversion: `@mozilla/readability`, `turndown`, `jsdom`
    *   MCP Server: `@modelcontextprotocol/sdk/server`

## Setup and Usage

### Prerequisites

*   Bun (recommended: `curl -fsSL https://bun.sh/install | bash`) or Node.js
*   Git

### Installation

1.  Clone the repository:
    ```bash
    git clone <your-repository-url> # Replace with your actual repo URL once created
    cd search-mcp
    ```
2.  Install dependencies:
    ```bash
    bun install
    # OR if using npm
    # npm install
    ```

### Running the Server

(You'll need to create a main script, e.g., `index.ts` or `src/index.ts`, to build and start the server. Here's a basic example of what that might look like:)

**Example `src/index.ts`:**
```typescript
import { buildServer } from './mcp/server.js';

const port = process.env.PORT || 3000;
const server = buildServer();

server.listen(port, () => {
  console.log(`MCP server '${server.name}' v${server.version} listening on port ${port}`);
  console.log('Available tools:', server.getToolNames().join(', '));
});
```

Then run:
```bash
bun run src/index.ts
# OR if using npm and you have a start script in package.json (e.g., "start": "bun src/index.ts")
# npm start
```

### Running Tests
```bash
npm test
# or
bun test
```

## Making Requests (API Usage)

To interact with the MCP server and use its tools, you need to follow a two-step process:

1.  **Initialize a Session:** Establish a session with the server.
2.  **Call a Tool:** Use the established session to make calls to the available tools.

All interactions happen via `POST` requests to the `/mcp` endpoint of your running server (e.g., `http://localhost:3000/mcp`).

### 1. Initialize a Session

Send a `POST` request to the `/mcp` endpoint with a JSON-RPC "initialize" message. This request does not require an `mcp-session-id` header.

**Example `curl` command:**

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-03-26",
      "clientInfo": {
        "name": "my-readme-client",
        "version": "0.1.0"
      },
      "capabilities": {
        "tools": {}
      }
    },
    "id": "init-example-1"
  }' \
  http://localhost:3000/mcp
```

*   The `Accept` header is required by the server's transport.
*   The server will respond, and in your server's console output, you will see a line like: `MCP Session initialized: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.
*   **Copy this Session ID.** You will need it for all subsequent tool calls within this session.

### 2. Call a Tool

Once you have an active Session ID, you can call any of the available tools by sending another `POST` request to the `/mcp` endpoint. This time, you **must** include the `mcp-session-id` header.

**Example `curl` command (calling `search-web`):**

Replace `YOUR_SESSION_ID_HERE` with the actual Session ID you obtained from the initialization step.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: YOUR_SESSION_ID_HERE" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "search-web",
      "arguments": {
        "query": "What is the Model Context Protocol?",
        "limit": 1
      }
    },
    "id": "tool-call-example-1"
  }' \
  http://localhost:3000/mcp
```

*   `mcp-session-id`: Your active session ID.
*   `method`: Should be `"tools/call"`.
*   `params.name`: The name of the tool to execute (e.g., `"search-web"`, `"search-github"`, `"fetch-url"`).
*   `params.arguments`: An object containing the specific parameters required by that tool.

The server will respond with the result of the tool execution in a JSON-RPC format.

## Tools API

All tools are exposed via the Model Context Protocol.

### 1. Web Search

*   **Tool Name:** `search-web`
*   **Description:** 100% free DuckDuckGo search (no API key required).
*   **Parameters:**
    *   `query` (string, required): The search query.
        *   *Example:* `"latest advancements in AI"`
    *   `limit` (integer, optional, min: 1, max: 30, default: 10): Maximum number of results to return.
        *   *Example:* `5`
*   **Returns:** A JSON string representing an array of search hits, each typically containing a title, URL, and snippet.

### 2. GitHub Code Search

*   **Tool Name:** `search-github`
*   **Description:** Advanced search in public GitHub code (REST v3).
*   **Parameters:**
    *   `query` (string, required): The search query using GitHub's advanced search syntax.
        *   *Example:* `"repo:microsoft/vscode language:ts QuickPick"`
    *   `perPage` (integer, optional, min: 1, max: 100, default: 20): Number of results to return per page.
        *   *Example:* `15`
*   **Returns:** A JSON string representing the GitHub API response for code search, including items and total count.

### 3. Fetch URL

*   **Tool Name:** `fetch-url`
*   **Description:** Downloads a web page, extracts readable content, and converts it to clean Markdown.
*   **Parameters:**
    *   `url` (string, URL format, required): The HTTP/HTTPS URL to fetch.
        *   *Example:* `"https://example.com/article"`
*   **Returns:** A string containing the Markdown representation of the fetched page's content.

---

Happy searching!
