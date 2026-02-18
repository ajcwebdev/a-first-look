import { Command } from 'commander'
import { createEmbeddings } from '../operations/create.js'
import { queryEmbeddings } from '../operations/query.js'

export const embedCommand = new Command('embed')
  .description('Manage vector embeddings')

embedCommand
  .command('create')
  .description('Create embeddings from files')
  .requiredOption('--db <type>', 'database type (sqlite, pgvector, vectorize)')
  .requiredOption('--files <path>', 'path to content directory')
  .action(async (options) => {
    console.log(`Creating embeddings with ${options.db} from ${options.files}`)
    try {
      await createEmbeddings(options.db, options.files)
      console.log('Embeddings created successfully')
    } catch (error) {
      console.error('Failed to create embeddings:', error)
      process.exit(1)
    }
  })

embedCommand
  .command('query')
  .description('Query embeddings')
  .requiredOption('--db <type>', 'database type (sqlite, pgvector, vectorize)')
  .requiredOption('--prompt <text>', 'query prompt')
  .action(async (options) => {
    console.log(`Querying ${options.db} with prompt: ${options.prompt}`)
    try {
      const results = await queryEmbeddings(options.db, options.prompt)
      console.log('Query results:')
      results.forEach((result, index) => {
        console.log(`\n${index + 1}. Score: ${result.score.toFixed(4)}`)
        console.log(`   File: ${result.filename}`)
        console.log(`   Content: ${result.content.substring(0, 200)}...`)
      })
    } catch (error) {
      console.error('Failed to query embeddings:', error)
      process.exit(1)
    }
  })