# Changelog

The hosted server lives at `https://verirouteintel.com/api/mcp`; this repo
carries its public documentation. Versions track the server's `serverInfo.version`.

## 1.2.0 — 2026-09-05
- New tool: `vri_sms_deliverability` — SMS capability, line type, spam standing,
  and recipient-local time with an 8am–9pm TCPA calling-window flag, in one call.
- OAuth discovery metadata (RFC 9728 protected-resource) published so MCP
  clients probing `.well-known` endpoints get correct answers.
- Anonymous `initialize` / `tools/list` discovery, tool annotations, output
  schemas, and `structuredContent` on every tool result.
- Broader gateway auth: `Authorization: Bearer`, bare key, `X-Api-Key`, and
  `apiKey` query/header all accepted.

## 1.1.0 — 2026-09-01
- Async bulk jobs via `vri_submit_job` (up to 10,000 numbers per job over MCP).
- Sandbox test keys (`mpl_test_pk_…`) return deterministic sample data on the
  documented magic numbers — zero charges, zero provider dips.
- Published to the official MCP Registry as `com.verirouteintel/lookup`.

## 1.0.0 — 2026-08-28
- Initial hosted release: `vri_number_lookup`, `vri_spam_check`,
  `vri_bulk_lookup`, `vri_bulk_status` over Streamable HTTP with wallet-billed
  API keys.
