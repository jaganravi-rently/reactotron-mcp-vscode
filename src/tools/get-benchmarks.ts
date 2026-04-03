import type { MessageStore } from "../message-store"
import type { BenchmarkReportPayload } from "../types"

export interface GetBenchmarksParams {
  search?: string
  limit?: number
}

export function handleGetBenchmarks(
  params: GetBenchmarksParams,
  store: MessageStore,
): string {
  const benchmarks = store.getBenchmarks({ search: params.search, limit: params.limit })

  if (benchmarks.length === 0) {
    return "No benchmark reports captured yet."
  }

  const lines = benchmarks.map((m) => {
    const p = m.payload as BenchmarkReportPayload
    const ts = m.date ? new Date(m.date).toLocaleTimeString() : "?"
    const steps = (p?.steps ?? []).map((s) => `  ${s.title}: ${s.time}ms`)
    const total = (p?.steps ?? []).reduce((sum, s) => sum + (s.time ?? 0), 0)
    return `[${ts}] ${p?.title ?? "(untitled)"} — total: ${total}ms\n${steps.join("\n")}`
  })

  return lines.join("\n\n")
}
