// mcpServerTutorial-step5.ts

import 'dotenv/config' // must be before everything else
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import OpenAI from 'openai'
import { z } from 'zod'

async function startMcpServer() {
  // Pass process.env's key to OpenAI
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })

  // If you want to ensure it's loaded:
  if (!openai.apiKey) {
    throw new Error('No OPENAI_API_KEY found! Check your .env')
  }

  const server = new McpServer({
    name: 'DirectChatGPTServer',
    version: '0.0.5',
    introspection: true
  })

  server.tool(
    'chatgpt-api-call',
    { prompt: z.string().describe('Prompt to ChatGPT') },
    async ({ prompt }) => {
      try {
        // Now we rely on `openai.apiKey` set from .env
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are ChatGPT...' },
            { role: 'user', content: prompt }
          ]
        })
        const msg = response.choices?.[0]?.message?.content ?? '(No response)'

        return {
          content: [{ type: 'text', text: `ChatGPT response: ${msg}` }],
          isError: false
        }
      } catch (err: any) {
        console.error('OpenAI API error', err)
        return {
          content: [
            { type: 'text', text: `Error calling OpenAI: ${String(err.message || err)}` }
          ],
          isError: true
        }
      }
    }
  )

  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('DirectChatGPTServer running. Waiting for requests...')
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  startMcpServer().catch(err => {
    console.error('Fatal error in startMcpServer()', err)
    process.exit(1)
  })
}