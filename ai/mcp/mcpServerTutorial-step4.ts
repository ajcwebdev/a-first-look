// mcpServerTutorial-step4.ts

import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import express from 'express'
import { z } from 'zod'

export async function startMcpServer(useSSE?: boolean) {
  const server = new McpServer({
    name: 'AdvancedServer',
    version: '0.0.4'
  })

  // --------------------
  // 1. Resources
  // --------------------
  server.resource(
    'hello-world',
    'hello://world',
    async (uri) => {
      return {
        contents: [{
          uri: uri.href,
          text: 'Hello from your advanced MCP resource!'
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

  // --------------------
  // 2. Prompts
  // --------------------
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

  server.prompt(
    'review-code',
    { code: z.string() },
    ({ code }) => {
      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `Please review the following code and provide feedback:\n\n${code}`
          }
        }]
      }
    }
  )

  // --------------------
  // 3. Tools
  // --------------------
  server.tool(
    'add-numbers',
    { a: z.number(), b: z.number() },
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

  server.tool(
    'fetch-joke',
    { category: z.string() },
    async ({ category }) => {
      // Simulate external API
      const joke = `Pretend joke about ${category}`
      return {
        content: [{
          type: 'text',
          text: joke
        }]
      }
    }
  )

  // --------------------
  // 4. Decide the transport
  // --------------------
  if (useSSE) {
    // SSE/HTTP example:
    const app = express()
    const transports: { [sessionId: string]: SSEServerTransport } = {}

    app.get('/sse', async (req, res) => {
      const transport = new SSEServerTransport('/messages', res)
      transports[transport.sessionId] = transport
      res.on('close', () => {
        delete transports[transport.sessionId]
      })
      await server.connect(transport)
    })

    app.post('/messages', express.json(), async (req, res) => {
      const sessionId = req.query.sessionId as string
      const transport = transports[sessionId]
      if (transport) {
        await transport.handlePostMessage(req, res)
      } else {
        res.status(400).send('No transport found for sessionId')
      }
    })

    app.listen(3001, () => {
      console.log('HTTP + SSE server listening on port 3001')
    })

  } else {
    // Default to stdio transport
    const transport = new StdioServerTransport()
    await server.connect(transport)
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  startMcpServer()
}