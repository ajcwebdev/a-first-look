export interface VectorDocument {
  id?: number
  filename: string
  content: string
  embedding?: number[]
}

export interface QueryResult {
  id: number
  filename: string
  content: string
  score: number
}

export interface VectorDB {
  initialize(): Promise<void>
  insertDocuments(documents: VectorDocument[]): Promise<void>
  query(embedding: number[], limit?: number): Promise<QueryResult[]>
  close(): Promise<void>
}