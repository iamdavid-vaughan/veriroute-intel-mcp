# VeriRoute Intel MCP Server

Live **phone number intelligence for AI agents** — current carrier of record, line type,
LRN routing data, porting activation date, caller-ID name (CNAM), spam/scam/robocall
reputation, and bulk lookup jobs for US/Canada numbers. Always a fresh read of live
numbering infrastructure, never a stale cache.

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

© DNS Publishing LLC, DBA VeriRoute Intel · [Terms](https://verirouteintel.com/terms) · [Privacy](https://verirouteintel.com/privacy)
