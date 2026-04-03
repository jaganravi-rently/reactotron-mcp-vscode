import type { MessageStore } from "../message-store"
import type { ApiResponsePayload } from "../types"

export interface GetNetworkParams {
  url?: string
  method?: string
  status?: number
  minDuration?: number
  limit?: number
}

export function handleGetNetwork(
  params: GetNetworkParams,
  store: MessageStore,
): string {
  const items = store.getNetwork(params)

  if (items.length === 0) {
    return "No network requests captured yet."
  }

  const lines = items.map((m) => {
    const p = m.payload as ApiResponsePayload
    const ts = m.date ? new Date(m.date).toLocaleTimeString() : "?"
    const req = p?.request
    const res = p?.response
    const parts = [
      `[${ts}] ${req?.method ?? "?"} ${req?.url ?? "?"}`,
      `  Status: ${res?.status ?? "?"} | Duration: ${p?.duration ?? "?"}ms`,
    ]
    if (req?.params) parts.push(`  Params: ${JSON.stringify(req.params)}`)
    if (req?.data) parts.push(`  Request body: ${JSON.stringify(req.data, null, 2)}`)
    if (res?.body) parts.push(`  Response body: ${JSON.stringify(res.body, null, 2)}`)
    return parts.join("\n")
  })

  return lines.join("\n\n---\n\n")
}
