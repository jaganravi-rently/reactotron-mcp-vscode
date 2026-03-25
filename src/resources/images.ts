import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { MessageStore } from "../message-store.js"
import type { ImagePayload } from "../types.js"

export function registerImagesResource(server: McpServer, store: MessageStore): void {
  server.resource(
    "images",
    "reactotron://images",
    { title: "Reactotron Images", mimeType: "text/markdown" },
    (uri) => {
      const items = store.getImages({ limit: 20 })

      if (items.length === 0) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "text/markdown",
              text: "# Images\n\nNo images captured yet.",
            },
          ],
        }
      }

      const lines = items.map((m) => {
        const p = m.payload as ImagePayload
        const ts = m.date ? new Date(m.date).toLocaleTimeString() : "?"
        const parts: string[] = []
        if (p?.filename) parts.push(`**${p.filename}**`)
        if (p?.width && p?.height) parts.push(`${p.width}×${p.height}`)
        if (p?.preview) parts.push(`"${p.preview}"`)
        if (p?.transparent) parts.push("transparent")
        return `- [${ts}] ${parts.join(" — ") || "(no metadata)"}`
      })

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "text/markdown",
            text: `# Images\n\nUse the \`get_images\` tool to view images inline.\n\n${lines.join("\n")}`,
          },
        ],
      }
    },
  )
}
