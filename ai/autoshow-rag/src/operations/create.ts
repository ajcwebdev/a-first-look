import { createVectorDB } from '../db/factory.js'
import { readContentFiles } from '../utils/files.js'
import { generateEmbeddings } from '../utils/embeddings.js'
import type { VectorDocument } from '../db/types.js'

export async function createEmbeddings(dbType: string, filesPath: string): Promise<void> {
  console.log(`Starting embedding creation process`)
  
  const db = createVectorDB(dbType)
  
  try {
    await db.initialize()
    
    const files = await readContentFiles(filesPath)
    console.log(`Loaded ${files.length} files`)
    
    const texts = files.map(f => f.content)
    const embeddings = await generateEmbeddings(texts)
    
    const documents: VectorDocument[] = files.map((file, index) => {
      const embedding = embeddings[index]
      if (!embedding) {
        throw new Error(`Missing embedding for file: ${file.filename}`)
      }
      return {
        filename: file.filename,
        content: file.content,
        embedding
      }
    })
    
    await db.insertDocuments(documents)
    console.log('All embeddings created and stored successfully')
  } finally {
    await db.close()
  }
}