import pg from 'pg'
import type { VectorDB, VectorDocument, QueryResult } from './types.js'

const { Client } = pg

export class PgVectorDB implements VectorDB {
  private client: pg.Client
  private connectionString: string

  constructor(connectionString?: string) {
    this.connectionString = connectionString || process.env['DATABASE_URL'] || 'postgresql://localhost/embeddings'
    console.log(`Initializing PostgreSQL connection`)
    this.client = new Client({ connectionString: this.connectionString })
  }

  async initialize(): Promise<void> {
    console.log('Connecting to PostgreSQL')
    await this.client.connect()
    
    console.log('Creating pgvector extension if not exists')
    await this.client.query('CREATE EXTENSION IF NOT EXISTS vector')
    
    console.log('Creating embeddings table if not exists')
    await this.client.query(`
      CREATE TABLE IF NOT EXISTS embeddings (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding vector(1536)
      )
    `)
    
    await this.client.query(`
      CREATE INDEX IF NOT EXISTS idx_embeddings_filename ON embeddings(filename)
    `)
    console.log('PostgreSQL database initialized')
  }

  async insertDocuments(documents: VectorDocument[]): Promise<void> {
    console.log(`Inserting ${documents.length} documents`)
    const values = documents.map((doc, index) => {
      if (!doc.embedding) throw new Error('Document missing embedding')
      const offset = index * 3
      return `($${offset + 1}, $${offset + 2}, $${offset + 3})`
    }).join(', ')
    
    const query = `INSERT INTO embeddings (filename, content, embedding) VALUES ${values}`
    const params = documents.flatMap(doc => [
      doc.filename,
      doc.content,
      JSON.stringify(doc.embedding)
    ])
    
    await this.client.query(query, params)
    console.log(`Successfully inserted ${documents.length} documents`)
  }

  async query(embedding: number[], limit: number = 5): Promise<QueryResult[]> {
    console.log(`Querying for ${limit} nearest neighbors`)
    const result = await this.client.query(`
      SELECT 
        id,
        filename,
        content,
        1 - (embedding <=> $1::vector) as similarity
      FROM embeddings
      ORDER BY embedding <=> $1::vector
      LIMIT $2
    `, [JSON.stringify(embedding), limit])
    
    console.log(`Found ${result.rows.length} results`)
    return result.rows.map(row => ({
      id: row.id,
      filename: row.filename,
      content: row.content,
      score: row.similarity
    }))
  }

  async close(): Promise<void> {
    console.log('Closing PostgreSQL connection')
    await this.client.end()
  }
}