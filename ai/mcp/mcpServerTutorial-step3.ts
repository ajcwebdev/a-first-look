// mcpServerTutorial-step3.ts

import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

export async function startMcpServer() {
  const server = new McpServer({
    name: 'ToolsServer',
    version: '0.0.3'
  })

  // ---------- Resources (same as step2) ----------
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

  // ---------- Prompt (same as step2) ----------
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

  // ---------- Tool: add two numbers (a + b) ----------
  server.tool(
    'add-numbers',
    {
      a: z.number(),
      b: z.number()
    },
    async ({ a, b }) => {
      const sum = a + b
      return {
        content: [{
          type: 'text',
          text: `The sum of a and b is ${sum}`
        }]
      }
    }
  )

  // Connect via stdio
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  startMcpServer()
}