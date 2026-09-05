#!/usr/bin/env node
/**
 * VeriRoute Intel MCP — local stdio shim.
 *
 * A zero-dependency stdio MCP server that forwards tool calls to the hosted
 * VeriRoute Intel MCP endpoint. Use this only when your client can't speak
 * remote (Streamable HTTP) MCP — otherwise connect directly to
 * https://verirouteintel.com/api/mcp with your API key.
 *
 * Auth: set VRI_API_KEY (a live key, or a free sandbox test key — prefix
 * mpl_test_pk_ — from https://verirouteintel.com/dashboard/sandbox).
 * Discovery (initialize / tools/list) works without a key.
 */

import { createInterface } from "node:readline";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HOSTED_URL = process.env.VRI_MCP_URL || "https://verirouteintel.com/api/mcp";
const API_KEY = process.env.VRI_API_KEY || null;
const VERSION = "1.2.0";
const HERE = dirname(fileURLToPath(import.meta.url));

// Embedded snapshot of the hosted server's tool list so discovery works
// offline (e.g. in build sandboxes). Live tools/list is preferred when the
// network allows; the snapshot ships with each release.
let TOOLS_SNAPSHOT = { tools: [] };
try {
  TOOLS_SNAPSHOT = JSON.parse(readFileSync(join(HERE, "tools.json"), "utf8"));
} catch {
  /* snapshot missing — live fetch only */
}

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

function reply(id, result) {
  send({ jsonrpc: "2.0", id, result });
}

function replyError(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

async function forward(body) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  if (API_KEY) headers["Authorization"] = `Bearer ${API_KEY}`;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(HOSTED_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await res.text();
    // The hosted endpoint may answer as SSE (`data: {...}`) or plain JSON.
    const line = text
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.startsWith("{") || l.startsWith("data: {"));
    if (!line) throw new Error(`Unexpected response (HTTP ${res.status})`);
    return JSON.parse(line.startsWith("data:") ? line.slice(5).trim() : line);
  } finally {
    clearTimeout(t);
  }
}

async function handle(msg) {
  const { id, method, params } = msg;
  if (method === "initialize") {
    reply(id, {
      protocolVersion: params?.protocolVersion || "2025-03-26",
      capabilities: { tools: {} },
      serverInfo: { name: "veriroute-intel-lookup", version: VERSION },
      instructions:
        "Live US/Canada phone intelligence: carrier, line type, LRN, CNAM, " +
        "spam reputation, SMS deliverability, and bulk jobs. Fresh network " +
        "reads on every call. Set VRI_API_KEY to call tools; free sandbox " +
        "test keys: https://verirouteintel.com/dashboard/sandbox",
    });
    return;
  }
  if (method === "notifications/initialized" || method?.startsWith("notifications/")) {
    return; // notifications get no response
  }
  if (method === "ping") {
    reply(id, {});
    return;
  }
  if (method === "tools/list") {
    try {
      const live = await forward({ jsonrpc: "2.0", id: 1, method: "tools/list" });
      if (live?.result?.tools?.length) {
        reply(id, live.result);
        return;
      }
    } catch {
      /* fall through to snapshot */
    }
    reply(id, TOOLS_SNAPSHOT);
    return;
  }
  if (method === "tools/call") {
    if (!API_KEY) {
      reply(id, {
        content: [
          {
            type: "text",
            text:
              "No VRI_API_KEY is set. Get a free sandbox test key (deterministic " +
              "sample data, zero charges, no card) at " +
              "https://verirouteintel.com/dashboard/sandbox, then set VRI_API_KEY " +
              "and retry.",
          },
        ],
        isError: true,
      });
      return;
    }
    try {
      const res = await forward({ jsonrpc: "2.0", id: 1, method: "tools/call", params });
      if (res?.error) {
        replyError(id, res.error.code ?? -32000, res.error.message ?? "Upstream error");
      } else {
        reply(id, res.result);
      }
    } catch (e) {
      reply(id, {
        content: [{ type: "text", text: `VeriRoute Intel request failed: ${e.message}` }],
        isError: true,
      });
    }
    return;
  }
  if (id !== undefined) {
    replyError(id, -32601, `Method not found: ${method}`);
  }
}

let pending = 0;
let stdinClosed = false;

function maybeExit() {
  if (stdinClosed && pending === 0) process.exit(0);
}

const rl = createInterface({ input: process.stdin, terminal: false });
rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let msg;
  try {
    msg = JSON.parse(trimmed);
  } catch {
    return; // ignore non-JSON noise
  }
  pending += 1;
  handle(msg)
    .catch((e) => {
      if (msg.id !== undefined) replyError(msg.id, -32603, e.message);
    })
    .finally(() => {
      pending -= 1;
      maybeExit();
    });
});
// Exit only after in-flight requests drain — a client closing stdin right
// after its last request must still get that answer.
rl.on("close", () => {
  stdinClosed = true;
  maybeExit();
});
