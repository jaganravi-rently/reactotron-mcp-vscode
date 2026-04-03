import * as vscode from "vscode"
import { MessageStore } from "./message-store"
import { ProxyServer } from "./proxy-server"
import { registerAllTools } from "./lm-tools/register-all"
import { registerChatParticipant } from "./chat-participant"
import { createStatusBar } from "./status-bar"
import { registerCommands } from "./commands"

let store: MessageStore
let proxy: ProxyServer | null = null

function readConfig() {
  const config = vscode.workspace.getConfiguration("reactotron")
  return {
    proxyPort: config.get<number>("proxyPort", 9091),
    reactotronPort: config.get<number>("reactotronPort", 9090),
    timeout: config.get<number>("timeout", 5000),
    autoStart: config.get<boolean>("autoStart", true),
  }
}

function startProxy() {
  if (proxy) return
  const cfg = readConfig()
  proxy = new ProxyServer(store, {
    proxyPort: cfg.proxyPort,
    reactotronPort: cfg.reactotronPort,
    timeout: cfg.timeout,
  })
  proxy.start()
}

function stopProxy() {
  if (!proxy) return
  proxy.dispose()
  proxy = null
}

export function activate(context: vscode.ExtensionContext): void {
  store = new MessageStore()
  const cfg = readConfig()

  if (cfg.autoStart) {
    startProxy()
  }

  registerAllTools(context, store, proxy!)
  registerChatParticipant(context, store, proxy!)
  createStatusBar(context, proxy!)
  registerCommands(
    context,
    store,
    () => proxy,
    startProxy,
    stopProxy,
  )

  const outputChannel = vscode.window.createOutputChannel("Reactotron")
  context.subscriptions.push(outputChannel)
  outputChannel.appendLine(
    `Reactotron extension activated. Proxy ${cfg.autoStart ? `listening on port ${cfg.proxyPort}` : "not started (autoStart disabled)"}.`,
  )
}

export function deactivate(): void {
  stopProxy()
}
