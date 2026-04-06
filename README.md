# Reactotron for VS Code

A VS Code extension that connects to React / React Native apps via [Reactotron](https://github.com/infinitered/reactotron), giving GitHub Copilot full access to your app's logs, state, network requests, benchmarks, and more — directly inside the editor.

## How it works

The extension runs a WebSocket proxy that sits between your app and the Reactotron desktop app:

```
App ──► Extension Proxy (port 9091) ──► Reactotron Desktop (port 9090)
               │                               │
        captures everything              desktop UI works normally
               │
        Copilot Chat tools + @reactotron participant
```

Your app connects to the proxy instead of directly to Reactotron. The proxy forwards all traffic to the desktop app (so the Reactotron UI works normally) and captures every message for the VS Code tools.

**Standalone mode** — if Reactotron Desktop is not open, the app connection is kept alive and all messages are still captured. When Reactotron is opened later, the proxy reconnects automatically with exponential backoff.

## Features

- **16 Language Model tools** — Copilot can automatically discover and invoke Reactotron tools in Agent mode, no explicit invocation needed
- **`@reactotron` chat participant** — guided debugging workflows with slash commands (`/debug`, `/trace`, `/network`, `/performance`, `/errors`)
- **Status bar** — shows live connection status for both the app and Reactotron Desktop
- **Works alongside Reactotron Desktop** — both see all messages simultaneously
- **Auto-start** — proxy starts on VS Code launch (configurable)

## Requirements

- VS Code `1.96.0` or later
- GitHub Copilot Chat extension
- Your app pointed at the proxy port (default `9091`) instead of Reactotron directly
- [Reactotron](https://github.com/infinitered/reactotron) desktop app (optional — for the visual UI)

## Installation

Install from the VS Code Marketplace, or build from source:

```bash
npm install
npm run build
npm run package   # creates .vsix file
```

Then install the `.vsix` via **Extensions → ⋯ → Install from VSIX**.

## App setup

Point your app's Reactotron config at the proxy port instead of the default:

```ts
// Before
Reactotron.configure({ host: 'localhost' }).connect()

// After
Reactotron.configure({ host: 'localhost', port: 9091 }).connect()
```

For Android emulators, you may also need:

```bash
adb reverse tcp:9091 tcp:9091
```

## Configuration

Settings are available under **Reactotron** in VS Code Settings:

| Setting                    | Default | Description                                       |
| -------------------------- | ------- | ------------------------------------------------- |
| `reactotron.proxyPort`     | `9091`  | Port the proxy listens on (apps connect here)     |
| `reactotron.reactotronPort`| `9090`  | Port the Reactotron desktop app is running on     |
| `reactotron.timeout`       | `5000`  | Timeout in ms for state queries                   |
| `reactotron.autoStart`     | `true`  | Automatically start the proxy when VS Code opens  |

## Commands

Available from the Command Palette (`⇧⌘P`):

| Command                           | Description                           |
| --------------------------------- | ------------------------------------- |
| `Reactotron: Start Proxy`         | Start the WebSocket proxy             |
| `Reactotron: Stop Proxy`          | Stop the proxy                        |
| `Reactotron: Restart Proxy`       | Restart the proxy                     |
| `Reactotron: Clear Messages`      | Clear all captured message buffers    |
| `Reactotron: Show Connection Info` | Show app + desktop connection status |

## Copilot Integration

### Automatic tool discovery (Agent mode)

In Copilot Agent mode, the 16 Reactotron tools are automatically discoverable. Just ask naturally:

- *"Why is my API call failing?"* → Copilot calls `getNetwork` + `getErrors`
- *"What actions fired after login?"* → Copilot calls `getStateActions`
- *"Show me the Redux store"* → Copilot calls `getState`

### `@reactotron` chat participant

For guided workflows, use the `@reactotron` participant with slash commands:

| Command         | Description                                                          |
| --------------- | -------------------------------------------------------------------- |
| `/debug`        | Comprehensive snapshot — connection, logs, network, state, actions   |
| `/trace <action>` | Trace a Redux/MST action through state changes, logs, and network |
| `/network`      | Diagnose failed or slow API requests                                 |
| `/performance`  | Analyse benchmarks and identify slow operations                      |
| `/errors`       | Triage all errors — logs, failed requests, error state               |

Or ask free-form: `@reactotron what changed in state after the last button press?`

## Tools

| Tool                    | Description                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| `getLogs`               | Read captured log messages. Filter by level (`log`/`debug`/`warn`/`error`), text search, and limit. |
| `getState`              | Query the app's state tree. Browse keys at a path or read the value.                            |
| `getNetwork`            | View captured API requests and responses. Filter by URL, HTTP method, status code, minimum duration, and limit. |
| `getTimeline`           | Full chronological timeline of all Reactotron messages.                                         |
| `getStateActions`       | View completed Redux or MobX-State-Tree actions. Filter by action type substring and limit.     |
| `getStateChanges`       | View state mutation events. Filter by state path substring and limit.                           |
| `getBenchmarks`         | View performance benchmark reports with per-step timings. Filter by title and limit.            |
| `getDisplays`           | Read custom display messages sent via `reactotron.display()`. Filter by name/preview text and limit. |
| `getErrors`             | Consolidated view of error-level logs and failed network requests (4xx/5xx) in one call.        |
| `getImages`             | Retrieve images logged via `reactotron.image()`.                                                |
| `getAppInfo`            | Show connected app metadata: name, version, platform, React/RN versions.                        |
| `getConnectionStatus`   | Check whether an app is connected, including app name, platform, and proxy port.                |
| `listCustomCommands`    | List all custom commands registered by the connected app.                                       |
| `runCustomCommand`      | Trigger a custom command registered by the app.                                                 |
| `dispatchAction`        | Dispatch a Redux or MobX-State-Tree action to the app.                                          |
| `clearMessages`         | Clear captured messages from the in-memory buffer. Clears all buffers or a specific message type. |

## Development

```bash
npm install
npm run build       # bundle with esbuild
npm run watch       # rebuild on changes
npm run typecheck   # type-check without building
npm run package     # create .vsix
```

Press **F5** to launch the Extension Development Host for testing.

## License

MIT
