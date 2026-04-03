import type { MessageStore } from "../message-store"
import type { DisplayPayload } from "../types"

export interface GetDisplaysParams {
  search?: string
  limit?: number
}

export function handleGetDisplays(
  params: GetDisplaysParams,
  store: MessageStore,
): string {
  const items = store.getDisplays({ search: params.search, limit: params.limit })

  if (items.length === 0) {
    return "No display messages captured yet."
  }

  const lines = items.map((m) => {
    const p = m.payload as DisplayPayload
    const ts = m.date ? new Date(m.date).toLocaleTimeString() : "?"
    const important = p?.important ? " !" : ""
    const preview = p?.preview ? ` — ${p.preview}` : ""
    const value = p?.value !== undefined ? `\n  ${JSON.stringify(p.value, null, 2).replace(/\n/g, "\n  ")}` : ""
    return `[${ts}]${important} ${p?.name ?? "display"}${preview}${value}`
  })

  return lines.join("\n\n")
}
