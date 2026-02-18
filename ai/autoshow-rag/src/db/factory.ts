import { SqliteVectorDB } from './sqlite.js'
import { PgVectorDB } from './pgvector.js'
import { VectorizeDB } from './vectorize.js'
import type { VectorDB } from './types.js'

export function createVectorDB(type: string): VectorDB {
  console.log(`Creating ${type} vector database`)
  
  switch (type.toLowerCase()) {
    case 'sqlite':
      return new SqliteVectorDB()
    case 'pgvector':
      return new PgVectorDB()
    case 'vectorize':
      return new VectorizeDB()
    default:
      throw new Error(`Unsupported database type: ${type}`)
  }
}