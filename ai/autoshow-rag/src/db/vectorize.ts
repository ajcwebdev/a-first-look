import type { VectorDB, VectorDocument, QueryResult } from './types.js'

interface VectorizeConfig {
  accountId: string
  apiToken: string
  indexName: string
}

interface VectorizeInsertVector {
  id: string
  values: number[]
  metadata?: Record<string, any>
}

interface VectorizeMatch {
  id: string
  score: number
  metadata?: Record<string, any>
}

export class VectorizeDB implements VectorDB {
  private config: VectorizeConfig
  private baseUrl: string

  constructor(indexName?: string) {
    const accountId = process.env['CLOUDFLARE_ACCOUNT_ID']
    const apiToken = process.env['CLOUDFLARE_API_TOKEN']
    
    if (!accountId || !apiToken) {
      throw new Error('CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN must be set')
    }
    
    this.config = {
      accountId,
      apiToken,
      indexName: indexName || 'embeddings-index'
    }
    
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/vectorize/v2/indexes`
    console.log(`Initializing Vectorize with index: ${this.config.indexName}`)
  }

  async initialize(): Promise<void> {
    console.log('Checking if Vectorize index exists')
    
    try {
      const response = await fetch(`${this.baseUrl}/${this.config.indexName}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`
        }
      })
      
      if (response.status === 404) {
        console.log('Index not found, creating new index')
        await this.createIndex()
      } else if (response.ok) {
        const data = await response.json() as any
        console.log(`Index exists: ${data.result.name} (${data.result.config.dimensions} dimensions)`)
      } else {
        throw new Error(`Failed to check index: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error initializing Vectorize:', error)
      throw error
    }
  }

  private async createIndex(): Promise<void> {
    console.log('Creating Vectorize index')
    
    const body = {
      name: this.config.indexName,
      description: 'Embeddings index created by autoshow-rag',
      config: {
        dimensions: 1536,
        metric: 'cosine'
      }
    }
    
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create index: ${error}`)
    }
    
    const data = await response.json() as any
    console.log(`Index created: ${data.result.name}`)
    
    console.log('Waiting for index to be ready...')
    await new Promise(resolve => setTimeout(resolve, 3000))
  }

  async insertDocuments(documents: VectorDocument[]): Promise<void> {
    console.log(`Inserting ${documents.length} documents into Vectorize`)
    
    const vectors: VectorizeInsertVector[] = documents.map((doc, index) => {
      if (!doc.embedding) throw new Error('Document missing embedding')
      return {
        id: doc.id?.toString() || `doc-${Date.now()}-${index}`,
        values: doc.embedding,
        metadata: {
          filename: doc.filename,
          content: doc.content.substring(0, 1000)
        }
      }
    })
    
    const ndjson = vectors.map(v => JSON.stringify(v)).join('\n')
    
    const response = await fetch(`${this.baseUrl}/${this.config.indexName}/insert`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiToken}`,
        'Content-Type': 'application/x-ndjson'
      },
      body: ndjson
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to insert vectors: ${error}`)
    }
    
    const data = await response.json() as any
    console.log(`Insert operation completed with mutation ID: ${data.result.mutationId}`)
    
    console.log('Waiting for vectors to be indexed...')
    await new Promise(resolve => setTimeout(resolve, 5000))
  }

  async query(embedding: number[], limit: number = 5): Promise<QueryResult[]> {
    console.log(`Querying Vectorize for ${limit} nearest neighbors`)
    
    const body = {
      vector: embedding,
      topK: limit,
      returnValues: false,
      returnMetadata: 'all'
    }
    
    const response = await fetch(`${this.baseUrl}/${this.config.indexName}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to query index: ${error}`)
    }
    
    const data = await response.json() as any
    const matches: VectorizeMatch[] = data.result.matches || []
    
    console.log(`Found ${matches.length} matches`)
    
    return matches.map(match => ({
      id: parseInt(match.id) || 0,
      filename: match.metadata?.['filename'] || 'unknown',
      content: match.metadata?.['content'] || '',
      score: match.score
    }))
  }

  async close(): Promise<void> {
    console.log('Vectorize connection closed')
  }
}