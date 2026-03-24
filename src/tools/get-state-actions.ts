import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type { MessageStore } from "../message-store.js"
import type { StateActionCompletePayload } from "../types.js"

export function registerGetStateActions(server: McpServer, store: MessageStore): void {
  server.tool(
    "get_state_actions",
    "Retrieve completed Redux or MobX-State-Tree actions captured from the connected app via Reactotron.",
    {
      actionType: z.string().optional().describe("Filter by action type substring, e.g. \"USER\""),
      limit: z.number().int().positive().optional().describe("Max entries to return (default 50)"),
    },
    ({ actionType, limit }) => {
      const actions = store.getStateActions({ actionType, limit })

      if (actions.length === 0) {
        return {
          content: [{ type: "text", text: "No state actions captured yet." }],
        }
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

      return {
        content: [{ type: "text", text: lines.join("\n") }],
      }
    },
  )
}
