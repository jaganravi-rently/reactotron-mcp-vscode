import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type { MessageStore } from "../message-store.js"
import type { ImagePayload } from "../types.js"

function parseDataUri(uri: string): { mimeType: string; data: string } | null {
  const match = uri.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return null
  return { mimeType: match[1], data: match[2] }
}

export function registerGetImages(server: McpServer, store: MessageStore): void {
  server.tool(
    "get_images",
    "Retrieve images logged via reactotron.image(). Returns each image rendered inline alongside its metadata (filename, dimensions, preview).",
    {
      limit: z.number().int().positive().optional().describe("Max images to return (default 20)"),
    },
    ({ limit }) => {
      const items = store.getImages({ limit })

      if (items.length === 0) {
        return {
          content: [{ type: "text", text: "No images captured yet." }],
        }
      }

      const content: Array<{ type: "text"; text: string } | { type: "image"; data: string; mimeType: string }> = []

      for (const m of items) {
        const p = m.payload as ImagePayload
        const ts = m.date ? new Date(m.date).toLocaleTimeString() : "?"
        const meta: string[] = [`[${ts}]`]
        if (p?.filename) meta.push(p.filename)
        if (p?.width && p?.height) meta.push(`${p.width}×${p.height}`)
        if (p?.preview) meta.push(`"${p.preview}"`)

        content.push({ type: "text", text: meta.join("  ") })

        if (p?.uri) {
          const parsed = parseDataUri(p.uri)
          if (parsed) {
            content.push({ type: "image", data: parsed.data, mimeType: parsed.mimeType })
          } else {
            // Not a data URI — surface the URI as text so it's not silently lost
            content.push({ type: "text", text: `URI: ${p.uri}` })
          }
        }
      }

      return { content }
    },
  )
}
