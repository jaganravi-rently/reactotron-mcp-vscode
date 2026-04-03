import type { MessageStore } from "../message-store"

export interface GetTimelineParams {
  types?: string[]
  limit?: number
}

export function handleGetTimeline(
  params: GetTimelineParams,
  store: MessageStore,
): string {
  const messages = store.getTimeline({ types: params.types, limit: params.limit })

  if (messages.length === 0) {
    return "No messages captured yet."
  }

  const lines = messages.map((m) => {
    const ts = m.date ? new Date(m.date).toLocaleTimeString() : "?"
    const payload = m.payload !== undefined ? JSON.stringify(m.payload, null, 2) : "(no payload)"
    return `[${ts}] ${m.type}\n${payload}`
  })

  return lines.join("\n\n---\n\n")
}
