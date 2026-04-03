import type { MessageStore } from "../message-store"
import type { StateActionCompletePayload } from "../types"

export interface GetStateActionsParams {
  actionType?: string
  limit?: number
}

export function handleGetStateActions(
  params: GetStateActionsParams,
  store: MessageStore,
): string {
  const actions = store.getStateActions({ actionType: params.actionType, limit: params.limit })

  if (actions.length === 0) {
    return "No state actions captured yet."
  }

  const lines = actions.map((m) => {
    const p = m.payload as StateActionCompletePayload
    const ts = m.date ? new Date(m.date).toLocaleTimeString() : "?"
    const type = p?.action?.type ?? "(unknown)"
    const ms = p?.ms !== undefined ? ` (${p.ms}ms)` : ""
    const payload = p?.action?.payload !== undefined
      ? `\n  payload: ${JSON.stringify(p.action.payload, null, 2)}`
      : ""
    return `[${ts}] ${type}${ms}${payload}`
  })

  return lines.join("\n")
}
