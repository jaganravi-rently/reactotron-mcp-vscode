import * as vscode from "vscode"
import type { MessageStore } from "../message-store"
import type { ProxyServer } from "../proxy-server"
import { handleGetLogs, type GetLogsParams } from "../tools/get-logs"
import { handleGetTimeline, type GetTimelineParams } from "../tools/get-timeline"
import { handleGetNetwork, type GetNetworkParams } from "../tools/get-network"
import { handleGetStateActions, type GetStateActionsParams } from "../tools/get-state-actions"
import { handleGetStateChanges, type GetStateChangesParams } from "../tools/get-state-changes"
import { handleGetBenchmarks, type GetBenchmarksParams } from "../tools/get-benchmarks"
import { handleGetDisplays, type GetDisplaysParams } from "../tools/get-displays"
import { handleGetImages, type GetImagesParams } from "../tools/get-images"
import { handleGetErrors } from "../tools/get-errors"
import { handleGetAppInfo } from "../tools/get-app-info"
import { handleGetConnectionStatus } from "../tools/get-connection-status"
import { handleListCustomCommands } from "../tools/list-custom-commands"
import { handleGetState, type GetStateParams } from "../tools/get-state"
import { handleDispatchAction, type DispatchActionParams } from "../tools/dispatch-action"
import { handleRunCustomCommand, type RunCustomCommandParams } from "../tools/run-custom-command"
import { handleClearMessages, type ClearMessagesParams } from "../tools/clear-messages"

function textResult(text: string): vscode.LanguageModelToolResult {
  return new vscode.LanguageModelToolResult([
    new vscode.LanguageModelTextPart(text),
  ])
}

export interface ProxyRef {
  readonly current: ProxyServer
}

export function registerAllTools(
  context: vscode.ExtensionContext,
  store: MessageStore,
  proxyRef: ProxyRef,
): void {
  // get_logs
  context.subscriptions.push(
    vscode.lm.registerTool<GetLogsParams>("reactotron-mcp_getLogs", {
      invoke(options, _token) {
        return textResult(handleGetLogs(options.input, store))
      },
      prepareInvocation() {
        return { invocationMessage: "Fetching Reactotron logs..." }
      },
    }),
  )

  // get_timeline
  context.subscriptions.push(
    vscode.lm.registerTool<GetTimelineParams>("reactotron-mcp_getTimeline", {
      invoke(options, _token) {
        return textResult(handleGetTimeline(options.input, store))
      },
      prepareInvocation() {
        return { invocationMessage: "Fetching Reactotron timeline..." }
      },
    }),
  )

  // get_network
  context.subscriptions.push(
    vscode.lm.registerTool<GetNetworkParams>("reactotron-mcp_getNetwork", {
      invoke(options, _token) {
        return textResult(handleGetNetwork(options.input, store))
      },
      prepareInvocation() {
        return { invocationMessage: "Fetching network requests..." }
      },
    }),
  )

  // get_state_actions
  context.subscriptions.push(
    vscode.lm.registerTool<GetStateActionsParams>("reactotron-mcp_getStateActions", {
      invoke(options, _token) {
        return textResult(handleGetStateActions(options.input, store))
      },
      prepareInvocation() {
        return { invocationMessage: "Fetching state actions..." }
      },
    }),
  )

  // get_state_changes
  context.subscriptions.push(
    vscode.lm.registerTool<GetStateChangesParams>("reactotron-mcp_getStateChanges", {
      invoke(options, _token) {
        return textResult(handleGetStateChanges(options.input, store))
      },
      prepareInvocation() {
        return { invocationMessage: "Fetching state changes..." }
      },
    }),
  )

  // get_benchmarks
  context.subscriptions.push(
    vscode.lm.registerTool<GetBenchmarksParams>("reactotron-mcp_getBenchmarks", {
      invoke(options, _token) {
        return textResult(handleGetBenchmarks(options.input, store))
      },
      prepareInvocation() {
        return { invocationMessage: "Fetching benchmarks..." }
      },
    }),
  )

  // get_displays
  context.subscriptions.push(
    vscode.lm.registerTool<GetDisplaysParams>("reactotron-mcp_getDisplays", {
      invoke(options, _token) {
        return textResult(handleGetDisplays(options.input, store))
      },
      prepareInvocation() {
        return { invocationMessage: "Fetching display messages..." }
      },
    }),
  )

  // get_images
  context.subscriptions.push(
    vscode.lm.registerTool<GetImagesParams>("reactotron-mcp_getImages", {
      invoke(options, _token) {
        return textResult(handleGetImages(options.input, store))
      },
      prepareInvocation() {
        return { invocationMessage: "Fetching images..." }
      },
    }),
  )

  // get_errors
  context.subscriptions.push(
    vscode.lm.registerTool("reactotron-mcp_getErrors", {
      invoke(_options, _token) {
        return textResult(handleGetErrors(store))
      },
      prepareInvocation() {
        return { invocationMessage: "Fetching errors..." }
      },
    }),
  )

  // get_app_info
  context.subscriptions.push(
    vscode.lm.registerTool("reactotron-mcp_getAppInfo", {
      invoke(_options, _token) {
        return textResult(handleGetAppInfo(store))
      },
      prepareInvocation() {
        return { invocationMessage: "Fetching app info..." }
      },
    }),
  )

  // get_connection_status
  context.subscriptions.push(
    vscode.lm.registerTool("reactotron-mcp_getConnectionStatus", {
      invoke(_options, _token) {
        return textResult(handleGetConnectionStatus(proxyRef.current, store))
      },
      prepareInvocation() {
        return { invocationMessage: "Checking connection status..." }
      },
    }),
  )

  // list_custom_commands
  context.subscriptions.push(
    vscode.lm.registerTool("reactotron-mcp_listCustomCommands", {
      invoke(_options, _token) {
        return textResult(handleListCustomCommands(store))
      },
      prepareInvocation() {
        return { invocationMessage: "Listing custom commands..." }
      },
    }),
  )

  // get_state
  context.subscriptions.push(
    vscode.lm.registerTool<GetStateParams>("reactotron-mcp_getState", {
      async invoke(options, _token) {
        const result = await handleGetState(options.input, proxyRef.current)
        return textResult(result)
      },
      prepareInvocation() {
        return { invocationMessage: "Querying app state..." }
      },
    }),
  )

  // dispatch_action (requires confirmation)
  context.subscriptions.push(
    vscode.lm.registerTool<DispatchActionParams>("reactotron-mcp_dispatchAction", {
      invoke(options, _token) {
        return textResult(handleDispatchAction(options.input, proxyRef.current))
      },
      prepareInvocation(options) {
        return {
          invocationMessage: `Dispatching action: ${options.input.type}`,
          confirmationMessages: {
            title: "Dispatch Action",
            message: new vscode.MarkdownString(
              `Dispatch **${options.input.type}** to the connected app?${
                options.input.payload
                  ? `\n\nPayload:\n\`\`\`json\n${JSON.stringify(options.input.payload, null, 2)}\n\`\`\``
                  : ""
              }`,
            ),
          },
        }
      },
    }),
  )

  // run_custom_command (requires confirmation when command is specified)
  context.subscriptions.push(
    vscode.lm.registerTool<RunCustomCommandParams>("reactotron-mcp_runCustomCommand", {
      invoke(options, _token) {
        return textResult(handleRunCustomCommand(options.input, store, proxyRef.current))
      },
      prepareInvocation(options) {
        if (options.input.command) {
          return {
            invocationMessage: `Running custom command: ${options.input.command}`,
            confirmationMessages: {
              title: "Run Custom Command",
              message: new vscode.MarkdownString(
                `Run custom command **${options.input.command}**?`,
              ),
            },
          }
        }
        return { invocationMessage: "Listing custom commands..." }
      },
    }),
  )

  // clear_messages (requires confirmation)
  context.subscriptions.push(
    vscode.lm.registerTool<ClearMessagesParams>("reactotron-mcp_clearMessages", {
      invoke(options, _token) {
        return textResult(handleClearMessages(options.input, store))
      },
      prepareInvocation(options) {
        const target = options.input.type ? `"${options.input.type}"` : "all"
        return {
          invocationMessage: `Clearing ${target} messages...`,
          confirmationMessages: {
            title: "Clear Messages",
            message: new vscode.MarkdownString(`Clear ${target} Reactotron message buffer(s)?`),
          },
        }
      },
    }),
  )
}
