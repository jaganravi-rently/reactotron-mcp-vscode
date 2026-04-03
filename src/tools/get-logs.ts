import type { MessageStore } from "../message-store"
import type { LogPayload } from "../types"

export interface GetLogsParams {
  level?: string
  search?: string
  limit?: number
}

export function handleGetLogs(
  params: GetLogsParams,
  store: MessageStore,
): string {
  const logs = store.getLogs({ level: params.level, search: params.search, limit: params.limit })

  if (logs.length === 0) {
    return "No logs captured yet."
  }

  const lines = logs.map((m) => {
    const p = m.payload as LogPayload
    const ts = m.date ? new Date(m.date).toLocaleTimeString() : "?"
    const lvl = p?.level?.toUpperCase() ?? "LOG"
    const msg = typeof p?.message === "object" ? JSON.stringify(p.message, null, 2) : String(p?.message ?? "")
    const stack = p?.stack ? `\n  ${p.stack}` : ""
    return `[${ts}] ${lvl}: ${msg}${stack}`
  })

  return lines.join("\n")
}
