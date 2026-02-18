import Database from 'better-sqlite3'
import * as sqliteVec from 'sqlite-vec'
import type { VectorDB, VectorDocument, QueryResult } from './types.js'

export class SqliteVectorDB implements VectorDB {
  private db: Database.Database

  constructor(dbPath: string = './embeddings.db') {
    console.log(`Initializing SQLite database at ${dbPath}`)
    this.db = new Database(dbPath)
    sqliteVec.load(this.db)
    const versionRow = this.db.prepare("SELECT vec_version() as version").get() as { version: string }
    console.log(`sqlite-vec version: ${versionRow.version}`)
  }

  async initialize(): Promise<void> {
    console.log('Creating embeddings table if not exists')
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding BLOB NOT NULL
      )
    `)
    
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_embeddings_filename ON embeddings(filename)
    `)
    console.log('SQLite database initialized')
  }

  async insertDocuments(documents: VectorDocument[]): Promise<void> {
    console.log(`Inserting ${documents.length} documents`)
    const stmt = this.db.prepare(`
      INSERT INTO embeddings (filename, content, embedding)
      VALUES (?, ?, vec_f32(?))
    `)
    
    const insertMany = this.db.transaction((docs: VectorDocument[]) => {
      docs.forEach(doc => {
        if (!doc.embedding) throw new Error('Document missing embedding')
        const embeddingBuffer = new Float32Array(doc.embedding).buffer
        stmt.run(doc.filename, doc.content, new Uint8Array(embeddingBuffer))
      })
    })
    
    insertMany(documents)
    console.log(`Successfully inserted ${documents.length} documents`)
  }

  async query(embedding: number[], limit: number = 5): Promise<QueryResult[]> {
    console.log(`Querying for ${limit} nearest neighbors`)
    const embeddingBuffer = new Float32Array(embedding).buffer
    
    const results = this.db.prepare(`
      SELECT 
        id,
        filename,
        content,
        vec_distance_cosine(embedding, vec_f32(?)) as distance
      FROM embeddings
      ORDER BY distance ASC
      LIMIT ?
    `).all(new Uint8Array(embeddingBuffer), limit) as any[]
    
    console.log(`Found ${results.length} results`)
    return results.map(row => ({
      id: row.id,
      filename: row.filename,
      content: row.content,
      score: 1 - row.distance
    }))
  }

  async close(): Promise<void> {
    console.log('Closing SQLite database')
    this.db.close()
  }
}