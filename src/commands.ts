import * as vscode from "vscode"
import type { MessageStore } from "./message-store"
import type { ProxyServer } from "./proxy-server"

export function registerCommands(
  context: vscode.ExtensionContext,
  store: MessageStore,
  getProxy: () => ProxyServer | null,
  startProxy: () => void,
  stopProxy: () => void,
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("reactotron-mcp.startProxy", () => {
      startProxy()
      vscode.window.showInformationMessage("Reactotron proxy started.")
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("reactotron-mcp.stopProxy", () => {
      stopProxy()
      vscode.window.showInformationMessage("Reactotron proxy stopped.")
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("reactotron-mcp.restartProxy", () => {
      stopProxy()
      startProxy()
      vscode.window.showInformationMessage("Reactotron proxy restarted.")
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("reactotron-mcp.clearMessages", () => {
      const count = store.clear()
      vscode.window.showInformationMessage(`Cleared ${count} Reactotron message(s).`)
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("reactotron-mcp.showConnectionInfo", () => {
      const proxy = getProxy()
      if (!proxy) {
        vscode.window.showWarningMessage("Reactotron proxy is not running.")
        return
      }

      if (!proxy.connected) {
        vscode.window.showInformationMessage(
          `Reactotron proxy listening on port ${proxy.proxyPort}. No app connected.`,
        )
        return
      }

      const info = store.clientInfo
      const lines = [`Connected on port ${proxy.proxyPort}`]
      if (info?.name) lines.push(`App: ${info.name}${info.version ? ` v${info.version}` : ""}`)
      if (info?.platform) lines.push(`Platform: ${info.platform}`)
      if (info?.reactNativeVersion) lines.push(`React Native: ${info.reactNativeVersion}`)

      vscode.window.showInformationMessage(lines.join(" | "))
    }),
  )
}
