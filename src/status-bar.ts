import * as vscode from "vscode"
import type { ProxyServer } from "./proxy-server"

export function createStatusBar(
  context: vscode.ExtensionContext,
  getProxy: () => ProxyServer | null,
): { item: vscode.StatusBarItem; update: () => void } {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 50)
  item.command = "reactotron-mcp.showConnectionInfo"

  function update() {
    const proxy = getProxy()
    if (!proxy) {
      item.text = "$(debug-disconnect) Reactotron: Stopped"
      item.tooltip = "Proxy is not running"
      item.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground")
      return
    }

    const appIcon = proxy.connected ? "$(check)" : "$(close)"
    const desktopIcon = proxy.reactotronConnected ? "$(check)" : "$(close)"

    if (proxy.connected && proxy.reactotronConnected) {
      item.text = `$(plug) Reactotron: App ${appIcon} Desktop ${desktopIcon}`
      item.tooltip = `App connected | Reactotron Desktop connected | Port ${proxy.proxyPort}`
      item.backgroundColor = undefined
    } else if (proxy.connected) {
      item.text = `$(plug) Reactotron: App ${appIcon} Desktop ${desktopIcon}`
      item.tooltip = `App connected | Reactotron Desktop not connected | Port ${proxy.proxyPort}`
      item.backgroundColor = undefined
    } else {
      item.text = `$(debug-disconnect) Reactotron: App ${appIcon} Desktop ${desktopIcon}`
      item.tooltip = `Waiting for app on port ${proxy.proxyPort}`
      item.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground")
    }
  }

  update()
  item.show()

  context.subscriptions.push(item)
  return { item, update }
}
