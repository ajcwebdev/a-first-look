import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

export async function startMcpServer() {
  const server = new McpServer({
    name: 'HelloMCPServer',
    version: '0.0.1',
    introspection: true,
  })
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  startMcpServer()
}