import * as vscode from "vscode"
import type { MessageStore } from "./message-store"
import type { ProxyServer } from "./proxy-server"

const PROMPT_DEBUG = `Please give me a full debug overview of my React app using Reactotron. Follow these steps:

1. Check get_connection_status to confirm an app is connected.
2. Use get_logs to review the last 50 log messages, highlighting any warnings or errors.
3. Use get_network to review the last 20 network requests, noting any failures or slow responses.
4. Use get_state to inspect the root state tree.
5. Use get_state_actions to see the last 20 dispatched actions.

Summarise what you find: are there any errors, unexpected state, or failed requests that need attention?`

const PROMPT_NETWORK = `Please diagnose any network issues in my React app using Reactotron:

1. Use get_network to review the last 50 network requests.
2. Identify any requests that failed (status 4xx or 5xx) or received no response.
3. Look for patterns: are failures limited to specific endpoints, methods, or times?
4. Use get_logs to find any related error logs around the time of failed requests.
5. Check get_state to see if there's any error state stored (e.g. error flags, messages).

Summarise the issues found and suggest likely causes and next steps.`

const PROMPT_PERFORMANCE = `Please analyse the performance of my React app using Reactotron:

1. Use get_benchmarks to retrieve all captured benchmark reports.
2. For each benchmark, identify the slowest steps and total duration.
3. Use get_network with a minDuration filter to find slow network requests (e.g. over 1000ms).
4. Use get_state_actions to see if any expensive actions correlate with slow benchmarks.
5. Use get_logs to check for any performance-related warnings around the same time.

Summarise which operations are slowest, whether there are patterns (specific screens, actions, or endpoints), and suggest what to investigate or optimise.`

const PROMPT_ERRORS = `Please triage all errors in my React app using Reactotron:

1. Use get_errors to get a consolidated view of error logs and failed network requests.
2. Use get_displays to check for any important display messages that may indicate errors from plugins or middleware.
3. Use get_state to inspect the root state tree for any error flags, error messages, or failed status fields.
4. Use get_timeline to understand the sequence of events leading up to the errors.

For each error found: describe what went wrong, when it happened, and what state the app was in. Group related errors together and suggest the most likely root cause and next debugging steps.`

function tracePrompt(action: string): string {
  return `Please trace the action "${action}" through my app using Reactotron:

1. Use get_state_actions to find recent dispatches of "${action}", showing the full payload.
2. Use get_state_changes to find any state changes that occurred around the same time.
3. Use get_logs to check for any log messages around that action.
4. Use get_network to see if any network requests were triggered as a result.

Walk me through what happened: what the action contained, how state changed, and any side effects that followed.`
}

export function registerChatParticipant(
  context: vscode.ExtensionContext,
  _store: MessageStore,
  _proxy: ProxyServer,
): void {
  const participant = vscode.chat.createChatParticipant(
    "reactotron-mcp.reactotron",
    async (
      request: vscode.ChatRequest,
      _chatContext: vscode.ChatContext,
      response: vscode.ChatResponseStream,
      token: vscode.CancellationToken,
    ) => {
      let systemPrompt: string
      const tools = vscode.lm.tools.filter((t) => t.name.startsWith("reactotron-mcp_"))

      switch (request.command) {
        case "debug":
          systemPrompt = PROMPT_DEBUG
          break
        case "trace": {
          const action = request.prompt.trim() || "unknown"
          systemPrompt = tracePrompt(action)
          break
        }
        case "network":
          systemPrompt = PROMPT_NETWORK
          break
        case "performance":
          systemPrompt = PROMPT_PERFORMANCE
          break
        case "errors":
          systemPrompt = PROMPT_ERRORS
          break
        default:
          systemPrompt = request.prompt
            ? `You are a Reactotron debugging assistant. Use the available Reactotron tools to help answer the following question about the user's React/React Native app:\n\n${request.prompt}`
            : "You are a Reactotron debugging assistant. Ask the user what they'd like to debug."
          break
      }

      const messages: vscode.LanguageModelChatMessage[] = [
        vscode.LanguageModelChatMessage.User(systemPrompt),
      ]

      const toolReferences: vscode.LanguageModelChatTool[] = tools.map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
      }))

      const chatResponse = await request.model.sendRequest(
        messages,
        {
          tools: toolReferences,
        },
        token,
      )

      // Stream the LLM response, handling text and tool call fragments
      const toolCallAccumulator = new Map<
        number,
        { callId: string; name: string; inputJson: string }
      >()

      for await (const fragment of chatResponse.stream) {
        if (fragment instanceof vscode.LanguageModelTextPart) {
          response.markdown(fragment.value)
        } else if (fragment instanceof vscode.LanguageModelToolCallPart) {
          const existing = toolCallAccumulator.get(fragment.callId ? 0 : 0)
          if (!existing) {
            toolCallAccumulator.set(toolCallAccumulator.size, {
              callId: fragment.callId,
              name: fragment.name,
              inputJson:
                typeof fragment.input === "string"
                  ? fragment.input
                  : JSON.stringify(fragment.input),
            })
          }
        }
      }

      // If the model requested tool calls, invoke them and feed results back
      if (toolCallAccumulator.size > 0) {
        for (const [, call] of toolCallAccumulator) {
          const input = JSON.parse(call.inputJson || "{}")
          try {
            const result = await vscode.lm.invokeTool(call.name, {
              input,
              toolInvocationToken: undefined,
              tokenizationOptions: undefined,
            }, token)

            // Extract text from the tool result
            for (const part of result.content) {
              if (part instanceof vscode.LanguageModelTextPart) {
                response.markdown(`\n\n**${call.name}:**\n${part.value}`)
              }
            }
          } catch (err) {
            response.markdown(
              `\n\n**${call.name} failed:** ${(err as Error).message}`,
            )
          }
        }
      }

      return {}
    },
  )

  participant.followupProvider = {
    provideFollowups(_result, _context, _token) {
      return [
        {
          prompt: "Show me recent logs",
          label: "$(output) View Logs",
          command: "debug",
        },
        {
          prompt: "What errors are there?",
          label: "$(error) Check Errors",
          command: "errors",
        },
        {
          prompt: "Show network requests",
          label: "$(cloud) Network",
          command: "network",
        },
        {
          prompt: "Analyse performance",
          label: "$(dashboard) Performance",
          command: "performance",
        },
      ]
    },
  }

  context.subscriptions.push(participant)
}
