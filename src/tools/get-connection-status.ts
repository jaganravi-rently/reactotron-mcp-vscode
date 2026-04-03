import type { ProxyServer } from "../proxy-server"
import type { MessageStore } from "../message-store"

export function handleGetConnectionStatus(
  proxy: ProxyServer,
  store: MessageStore,
): string {
  const port = proxy.proxyPort
  if (!proxy.connected) {
    return `Not connected. No app is currently connected to the proxy (port ${port}). Ensure your app is running and pointing at port ${port}.`
  }

  const info = store.clientInfo
  const lines = [`Connected. An app is actively connected to the proxy (port ${port}).`]
  if (info) {
    if (info.name) lines.push(`App: ${info.name}${info.version ? ` v${info.version}` : ""}`)
    if (info.platform) lines.push(`Platform: ${info.platform}`)
    if (info.reactNativeVersion) lines.push(`React Native: ${info.reactNativeVersion}`)
    if (info.reactVersion) lines.push(`React: ${info.reactVersion}`)
  }

  return lines.join("\n")
}
