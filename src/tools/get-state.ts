import type { ProxyServer } from "../proxy-server"
import type { StateKeysResponsePayload, StateValuesResponsePayload } from "../types"

export interface GetStateParams {
  path?: string
  query?: string
}

export async function handleGetState(
  params: GetStateParams,
  proxy: ProxyServer,
): Promise<string> {
  const path = params.path ?? ""
  const query = params.query ?? "values"

  if (!proxy.connected) {
    return "No app connected to the proxy. Ensure your app is running and pointing at the proxy port."
  }

  try {
    if (query === "keys") {
      const result = (await proxy.queryStateKeys(path)) as StateKeysResponsePayload
      if (!result?.valid) {
        return `Invalid state path: "${path}"`
      }
      const keys = result.keys ?? []
      return keys.length === 0
        ? `No keys found at path "${path}"`
        : `Keys at "${path || "root"}":\n${keys.map((k) => `  - ${k}`).join("\n")}`
    } else {
      const result = (await proxy.queryStateValues(path)) as StateValuesResponsePayload
      if (!result?.valid) {
        return `Invalid state path: "${path}"`
      }
      return `State at "${path || "root"}":\n${JSON.stringify(result.value, null, 2)}`
    }
  } catch (err) {
    return `State query failed: ${(err as Error).message}`
  }
}
