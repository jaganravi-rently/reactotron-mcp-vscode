import type { MessageStore } from "../message-store"
import type { StateValuesChangePayload } from "../types"

export interface GetStateChangesParams {
  path?: string
  limit?: number
}

export function handleGetStateChanges(
  params: GetStateChangesParams,
  store: MessageStore,
): string {
  const changes = store.getStateChanges({ path: params.path, limit: params.limit })

  if (changes.length === 0) {
    return "No state changes captured yet."
  }

  const lines = changes.map((m) => {
    const p = m.payload as StateValuesChangePayload
    const ts = m.date ? new Date(m.date).toLocaleTimeString() : "?"
    const entries = (p?.changes ?? []).map(
      (c) => `  ${c.path}: ${JSON.stringify(c.value)}`,
    )
    return `[${ts}]\n${entries.join("\n")}`
  })

  return lines.join("\n")
}
