import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type { MessageStore } from "../message-store.js"
import type { StateValuesChangePayload } from "../types.js"

export function registerGetStateChanges(server: McpServer, store: MessageStore): void {
  server.tool(
    "get_state_changes",
    "Retrieve state mutation events captured from the connected app via Reactotron.",
    {
      path: z.string().optional().describe("Filter by state path substring, e.g. \"user\""),
      limit: z.number().int().positive().optional().describe("Max entries to return (default 50)"),
    },
    ({ path, limit }) => {
      const changes = store.getStateChanges({ path, limit })

      if (changes.length === 0) {
        return {
          content: [{ type: "text", text: "No state changes captured yet." }],
        }
      }

      const lines = changes.map((m) => {
        const p = m.payload as StateValuesChangePayload
        const ts = m.date ? new Date(m.date).toLocaleTimeString() : "?"
        const entries = (p?.changes ?? []).map(
          (c) => `  ${c.path}: ${JSON.stringify(c.value)}`,
        )
        return `[${ts}]\n${entries.join("\n")}`
      })

      return {
        content: [{ type: "text", text: lines.join("\n") }],
      }
    },
  )
}
