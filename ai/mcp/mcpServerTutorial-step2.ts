// mcpServerTutorial-step2.ts

import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

/**
 * Start an MCP server that exposes some basic resources and prompts.
 *
 * @public
 */
export async function startMcpServer() {
  const server = new McpServer({
    name: 'ResourcePromptServer',
    version: '0.0.2'
  })

  // 1. A static resource: "hello://world"
  server.resource(
    'hello-world',
    'hello://world',
    async (uri) => {
      return {
        contents: [{
          uri: uri.href,
          text: 'Hello from your MCP resource!'
        }]
      }
    }
  )

  // 2. A parameterized resource: "echo://{message}"
  // e.g. "echo://test" -> returns "Echo: test"
  server.resource(
    'echo-resource',
    new ResourceTemplate('echo://{message}', { list: undefined }),
    async (uri, params) => {
      return {
        contents: [{
          uri: uri.href,
          text: `Echo: ${params.message}`
        }]
      }
    }
  )

  // 3. A simple prompt that can be retrieved by the client
  server.prompt(
    'ask-question',
    { question: z.string() },
    ({ question }) => {
      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `Could you answer this question for me?\n\n${question}`
          }
        }]
      }
    }
  )

  // Connect using stdio
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

/**
 * If run directly, start the server.
 */
if (process.argv[1] === new URL(import.meta.url).pathname) {
  startMcpServer()
}