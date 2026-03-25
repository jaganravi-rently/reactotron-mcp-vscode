# Changelog

All notable changes to this project will be documented in this file.

## [0.3.0] - 2026-03-25

### Added

- **Image capture** — `reactotron.image()` messages are now captured and exposed via:
  - `get_images` tool — returns images as native MCP image content blocks with timestamp, filename, dimensions, and preview metadata; falls back to URI text if not base64
  - `reactotron://images` resource — metadata-only list directing users to `get_images` for inline rendering
- **New tools**
  - `get_displays` — retrieve `reactotron.display()` messages with name/preview search
  - `get_app_info` — exposes `client.intro` metadata (app name, platform, versions)
  - `get_errors` — consolidated view of error logs and failed network requests
- **New resources** — `reactotron://displays`, `reactotron://custom-commands`, `reactotron://connection`
- **New prompts** — `debug_performance` and `debug_errors`
- **Resource update notifications** — MCP `notifications/resources/updated` sent to subscribed clients when new messages are ingested; covers all resource URIs mapped to their respective message types
- **Standalone/resilient proxy** — server now starts and captures messages without Reactotron desktop; auto-reconnects with exponential backoff (1 s → 2 s → 4 s → 8 s → 16 s) when upstream disconnects

### Improved

- `get_network` — new `method` and `minDuration` filters
- `get_connection_status` — now includes app info from `client.intro` and the proxy port

### Fixed

- McpServer version was reporting `0.1.0` instead of matching `package.json`
- `clear(type)` left cleared messages in the timeline buffer, causing type-specific and timeline buffers to desync
- `log` level was missing from the `LogPayload` type and `get_logs` filter enum; `reactotron.log()` emits level `"log"` which was previously unfilterable

## [0.2.0] - 2026-03-25

### Added

- **MCP Resources** — New resources for reading Reactotron data directly:
  - `logs`, `network`, `timeline`, and `state` resources
  - `state_actions`, `state_changes`, and `benchmarks` resources
- **New Tools**
  - `list_custom_commands` — lists custom commands registered in Reactotron
  - `get_connection_status` — reports the current connection status
  - Four additional tools exposing already-captured Reactotron data (async storage, state, network, logs)
- **MCP Prompts** — Built-in prompts to guide common Reactotron workflows
- **Claude Plugin Manifest** — Added manifest for Claude integration
- **LICENSE** — Added project license

### Documentation

- README updated to document all new tools, resources, and prompts

## [0.1.1] - 2026-03-23

### Added

- `.mcp.json` configuration file
- Install badges in README

## [0.1.0] - 2026-03-23

Initial release.

### Added

- MCP server with WebSocket proxy to Reactotron desktop app
- Tools: `get_logs`, `get_network`, `get_state`, `get_timeline`, `dispatch_action`, `run_custom_command`
- Message store for capturing Reactotron messages
