import { Command } from 'commander'
import { embedCommand } from './src/commands/embed.js'
import { cloudflareCommand } from './src/commands/cloudflare.js'

const program = new Command()

program
  .name('autoshow-rag')
  .description('CLI for vector database operations with sql-vec, pgvector, and vectorize')
  .version('1.0.0')

program.addCommand(embedCommand)
program.addCommand(cloudflareCommand)

try {
  await program.parseAsync(process.argv)
} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}