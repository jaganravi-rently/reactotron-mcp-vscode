import * as vscode from "vscode"
import type { ProxyServer } from "./proxy-server"

export function createStatusBar(
  context: vscode.ExtensionContext,
  proxy: ProxyServer,
): vscode.StatusBarItem {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 50)
  item.command = "reactotron-mcp.showConnectionInfo"

  function update() {
    if (proxy.connected) {
      item.text = "$(plug) Reactotron: Connected"
      item.tooltip = `Connected on port ${proxy.proxyPort}`
      item.backgroundColor = undefined
    } else {
      item.text = "$(debug-disconnect) Reactotron: Disconnected"
      item.tooltip = `Listening on port ${proxy.proxyPort}`
      item.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground")
    }
  }

  proxy.on("connectionChange", update)
  update()
  item.show()

  context.subscriptions.push(item)
  context.subscriptions.push({
    dispose() {
      proxy.removeListener("connectionChange", update)
    },
  })

  return item
}
