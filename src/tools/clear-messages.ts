import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type { MessageStore } from "../message-store.js"

export function registerClearMessages(server: McpServer, store: MessageStore): void {
  server.tool(
    "clear_messages",
    "Clear captured Reactotron messages from the in-memory buffer. Clears all buffers by default, or a specific message type.",
    {
      type: z
        .enum(["log", "api.response", "state.action.complete", "state.values.change", "benchmark.report"])
        .optional()
        .describe("Message type to clear. Omit to clear all buffers."),
    },
    ({ type }) => {
      const count = store.clear(type)
      const target = type ? `"${type}"` : "all"
      return {
        content: [{ type: "text", text: `Cleared ${count} message(s) from ${target} buffer(s).` }],
      }
    },
  )
}
