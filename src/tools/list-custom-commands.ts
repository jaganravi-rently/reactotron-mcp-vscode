import type { MessageStore } from "../message-store"

export function handleListCustomCommands(
  store: MessageStore,
): string {
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
