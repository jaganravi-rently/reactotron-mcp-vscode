import type { MessageStore } from "../message-store"
import type { ImagePayload } from "../types"

export interface GetImagesParams {
  limit?: number
}

export function handleGetImages(
  params: GetImagesParams,
  store: MessageStore,
): string {
  const items = store.getImages({ limit: params.limit })

  if (items.length === 0) {
    return "No images captured yet."
  }

  const lines: string[] = []

  for (const m of items) {
    const p = m.payload as ImagePayload
    const ts = m.date ? new Date(m.date).toLocaleTimeString() : "?"
    const meta: string[] = [`[${ts}]`]
    if (p?.filename) meta.push(p.filename)
    if (p?.width && p?.height) meta.push(`${p.width}×${p.height}`)
    if (p?.preview) meta.push(`"${p.preview}"`)
    lines.push(meta.join("  "))
    if (p?.uri) {
      lines.push(`URI: ${p.uri}`)
    }
  }

  return lines.join("\n")
}
