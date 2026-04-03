import type { MessageStore } from "../message-store"
import type { ProxyServer } from "../proxy-server"

export interface RunCustomCommandParams {
  command?: string
  args?: Record<string, unknown>
}

export function handleRunCustomCommand(
  params: RunCustomCommandParams,
  store: MessageStore,
  proxy: ProxyServer,
): string {
  if (!params.command) {
    const commands = Array.from(store.customCommands.values())
    if (commands.length === 0) {
      return "No custom commands registered yet."
    }
    const lines = commands.map((c) => {
      const argList =
        c.args && c.args.length > 0 ? `\n  Args: ${c.args.map((a) => a.name).join(", ")}` : ""
      const desc = c.description ? `\n  ${c.description}` : ""
      return `• ${c.command}${c.title ? ` (${c.title})` : ""}${desc}${argList}`
    })
    return `Available custom commands:\n\n${lines.join("\n\n")}`
  }

  if (!proxy.connected) {
    return "No app connected to the proxy. Ensure your app is running and pointing at the proxy port."
  }

  proxy.sendCustomCommand(params.command, params.args)
  return `Custom command "${params.command}" sent.`
}
