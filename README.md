# VeriRoute Intel MCP Server

[![smithery badge](https://smithery.ai/badge/verirouteintel/lookup)](https://smithery.ai/servers/verirouteintel/lookup)
[![MCP Registry](https://img.shields.io/badge/MCP_Registry-com.verirouteintel%2Flookup-blue)](https://registry.modelcontextprotocol.io)

Tells your agent whether a number is safe to call or text **right now**. Live reads
of the U.S. and Canadian phone networks — carrier of record, line type, LRN, CNAM
caller ID, spam/scam reputation, SMS deliverability, and a TCPA 8 a.m.–9 p.m.
calling-window verdict — plus bulk lookups. Every query gets a fresh dip, never
stale cached data. Free sandbox key, no card required. Pay per lookup with no
minimums.

This is a **hosted (remote) MCP server** — nothing to install or run.

- **Endpoint:** `https://verirouteintel.com/api/mcp` (Streamable HTTP, JSON-RPC 2.0)
- **Auth:** `Authorization: Bearer <your VeriRoute Intel API key>`
- **Docs:** https://verirouteintel.com/api-docs/mcp
- **Get a key:** https://verirouteintel.com/dashboard/api-keys — free **sandbox test keys**
  return deterministic sample data with zero charges, perfect for wiring an agent up
  before funding.

## Connect

### Claude Code (CLI)
```bash
claude mcp add --transport http vri https://verirouteintel.com/api/mcp \
  --header "Authorization: Bearer YOUR_API_KEY"
```

### Claude.ai / Claude Desktop
Add a custom connector with URL `https://verirouteintel.com/api/mcp` and header
`Authorization: Bearer YOUR_API_KEY`.

### Cursor and other MCP clients (`mcp.json`)
```json
{
  "mcpServers": {
    "vri": {
      "url": "https://verirouteintel.com/api/mcp",
      "headers": { "Authorization": "Bearer YOUR_API_KEY" }
    }
  }
}
```

## Tools

| Tool | What it does |
|---|---|
| `vri_number_lookup` | Live intelligence for one number: carrier, line type, LRN routing, porting date; optional CNAM, spam reputation, messaging provider |
| `vri_spam_check` | Spam / scam / robocall reputation for one number |
| `vri_sms_deliverability` | One verdict for outreach agents: can this number receive SMS, and is now a reasonable time to send? Line type, VoIP flag, spam reputation, and the recipient's approximate local time with an 8am–9pm calling-window flag |
| `vri_bulk_lookup` | Up to 100 numbers in one call |
| `vri_submit_job` | Submit an async bulk job (up to 10,000 numbers); balance reserved up front |
| `vri_bulk_status` | Progress of one of your bulk jobs |

## Billing

Live keys pay the same per-lookup rates as the [REST API](https://verirouteintel.com/api-docs/)
from a prepaid balance. Every result reports what it cost; failed lookups are never
charged, and a call that would exceed your available balance is refused up front.

## Use cases

- Clean calling lists before dialing (dead/ported/VoIP detection)
- Check your own outbound caller IDs for "Spam Likely" labeling
- Verify line type before sending SMS
- Enrich CRM records with live carrier data — from inside an agent workflow

---

© First Light Holdings, LLC, DBA VeriRoute Intel · [Terms](https://verirouteintel.com/terms) · [Privacy](https://verirouteintel.com/privacy)

## Directories

Published in the [Official MCP Registry](https://registry.modelcontextprotocol.io) as `com.verirouteintel/lookup` · [Smithery](https://smithery.ai/servers/verirouteintel/lookup) · [MCP.so](https://mcp.so/servers/veriroute-intel-lookup)

### Local stdio (CI, offline, or clients without remote MCP)

A zero-dependency Node shim, published to npm, forwards to the hosted server:

```bash
VRI_API_KEY=YOUR_API_KEY npx veriroute-intel-mcp
```

Or in an `mcp.json`-style client config:

```json
{
  "mcpServers": {
    "vri": {
      "command": "npx",
      "args": ["-y", "veriroute-intel-mcp"],
      "env": { "VRI_API_KEY": "YOUR_API_KEY" }
    }
  }
}
```

Discovery works without a key; tool calls need one (free sandbox test keys
return sample data with zero charges). Prefer the hosted endpoint whenever
your client supports remote MCP.
