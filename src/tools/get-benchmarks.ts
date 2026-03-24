import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import type { MessageStore } from "../message-store.js"
import type { BenchmarkReportPayload } from "../types.js"

export function registerGetBenchmarks(server: McpServer, store: MessageStore): void {
  server.tool(
    "get_benchmarks",
    "Retrieve performance benchmark reports captured from the connected app via Reactotron.",
    {
      search: z.string().optional().describe("Filter by benchmark title substring"),
      limit: z.number().int().positive().optional().describe("Max entries to return (default 50)"),
    },
    ({ search, limit }) => {
      const benchmarks = store.getBenchmarks({ search, limit })

      if (benchmarks.length === 0) {
        return {
          content: [{ type: "text", text: "No benchmark reports captured yet." }],
        }
      }

      const lines = benchmarks.map((m) => {
        const p = m.payload as BenchmarkReportPayload
        const ts = m.date ? new Date(m.date).toLocaleTimeString() : "?"
        const steps = (p?.steps ?? []).map((s) => `  ${s.title}: ${s.time}ms`)
        const total = (p?.steps ?? []).reduce((sum, s) => sum + (s.time ?? 0), 0)
        return `[${ts}] ${p?.title ?? "(untitled)"} — total: ${total}ms\n${steps.join("\n")}`
      })

      return {
        content: [{ type: "text", text: lines.join("\n\n") }],
      }
    },
  )
}
