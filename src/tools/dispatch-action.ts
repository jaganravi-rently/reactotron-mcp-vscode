import type { ProxyServer } from "../proxy-server"

export interface DispatchActionParams {
  type: string
  payload?: Record<string, unknown>
}

export function handleDispatchAction(
  params: DispatchActionParams,
  proxy: ProxyServer,
): string {
  if (!proxy.connected) {
    return "No app connected to the proxy. Ensure your app is running and pointing at the proxy port."
  }

  proxy.dispatchAction(params.type, params.payload)
  return `Action dispatched: ${params.type}${params.payload ? `\nPayload: ${JSON.stringify(params.payload, null, 2)}` : ""}`
}
