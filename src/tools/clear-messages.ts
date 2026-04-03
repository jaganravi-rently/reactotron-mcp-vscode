import type { MessageStore } from "../message-store"

export interface ClearMessagesParams {
  type?: string
}

export function handleClearMessages(
  params: ClearMessagesParams,
  store: MessageStore,
): string {
  const count = store.clear(params.type)
  const target = params.type ? `"${params.type}"` : "all"
  return `Cleared ${count} message(s) from ${target} buffer(s).`
}
