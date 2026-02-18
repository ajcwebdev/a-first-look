import { createVectorDB } from '../db/factory.js'
import { generateEmbedding } from '../utils/embeddings.js'
import type { QueryResult } from '../db/types.js'

export async function queryEmbeddings(dbType: string, prompt: string): Promise<QueryResult[]> {
  console.log(`Starting query process`)
  
  const db = createVectorDB(dbType)
  
  try {
    await db.initialize()
    
    const queryEmbedding = await generateEmbedding(prompt)
    console.log('Generated query embedding')
    
    const results = await db.query(queryEmbedding)
    console.log(`Retrieved ${results.length} results`)
    
    return results
  } finally {
    await db.close()
  }
}