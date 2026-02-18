# Advanced Vector Search: Document Chunking, Hybrid Search, and Live RAG Chat

In our previous tutorial, we built a CLI tool supporting three vector databases. Now, let's enhance it with production-ready features: intelligent document chunking, hybrid search capabilities, and a live RAG chat interface.

## Overview of New Features

1. **Smart Document Chunking**: Break large documents into semantic chunks with rich metadata
2. **Hybrid Search**: Combine vector similarity with keyword search for better results
3. **Live RAG Chat**: Interactive chat interface with conversation memory

## Part 1: Smart Document Chunking & Rich Metadata

### Update Dependencies

First, update `package.json` with new dependencies:

```json
{
  "dependencies": {
    "better-sqlite3": "11.6.0",
    "commander": "14.0.0",
    "glob": "11.0.0",
    "node-fetch": "3.3.2",
    "openai": "4.77.0",
    "pg": "8.13.1",
    "sqlite-vec": "0.1.6",
    "unified": "11.0.5",
    "remark-parse": "11.0.0",
    "remark-stringify": "11.0.0",
    "unist-util-visit": "5.0.0",
    "natural": "8.0.1",
    "fuse.js": "7.0.0"
  }
}
```

### Create Document Chunking Module

Create `src/utils/chunking.ts`:

```typescript
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { visit } from 'unist-util-visit'
import { readFile } from 'fs/promises'
import path from 'path'

export interface ChunkOptions {
  chunkSize: number
  overlap: number
  method: 'sliding' | 'paragraph' | 'section'
}

export interface DocumentChunk {
  id: string
  content: string
  metadata: {
    filename: string
    chunkIndex: number
    totalChunks: number
    section?: string
    startChar: number
    endChar: number
    timestamp: string
    fileType: string
  }
}

export class DocumentChunker {
  constructor(private options: ChunkOptions) {}

  async chunkFile(filepath: string): Promise<DocumentChunk[]> {
    console.log(`Chunking file: ${filepath}`)
    const content = await readFile(filepath, 'utf-8')
    const fileType = path.extname(filepath).toLowerCase()
    const timestamp = new Date().toISOString()
    
    let chunks: DocumentChunk[] = []
    
    if (fileType === '.md' && this.options.method === 'section') {
      chunks = await this.chunkMarkdownBySections(content, filepath, timestamp)
    } else if (this.options.method === 'paragraph') {
      chunks = this.chunkByParagraphs(content, filepath, timestamp, fileType)
    } else {
      chunks = this.chunkBySliding(content, filepath, timestamp, fileType)
    }
    
    console.log(`Created ${chunks.length} chunks from ${filepath}`)
    return chunks
  }

  private async chunkMarkdownBySections(
    content: string, 
    filepath: string, 
    timestamp: string
  ): Promise<DocumentChunk[]> {
    const chunks: DocumentChunk[] = []
    const processor = unified().use(remarkParse).use(remarkStringify)
    const tree = processor.parse(content)
    
    let currentSection = 'Introduction'
    let currentContent: string[] = []
    let startChar = 0
    let chunkIndex = 0
    
    visit(tree, (node: any, index, parent) => {
      if (node.type === 'heading') {
        if (currentContent.length > 0) {
          const chunkContent = currentContent.join('\n').trim()
          chunks.push({
            id: `${path.basename(filepath)}-chunk-${chunkIndex}`,
            content: chunkContent,
            metadata: {
              filename: filepath,
              chunkIndex,
              totalChunks: 0,
              section: currentSection,
              startChar,
              endChar: startChar + chunkContent.length,
              timestamp,
              fileType: '.md'
            }
          })
          chunkIndex++
          startChar += chunkContent.length
          currentContent = []
        }
        
        const headingText = node.children
          .map((child: any) => child.value || '')
          .join('')
        currentSection = headingText
        currentContent.push('#'.repeat(node.depth) + ' ' + headingText)
      } else if (node.type === 'paragraph' || node.type === 'code') {
        const text = processor.stringify(node).trim()
        currentContent.push(text)
      }
    })
    
    if (currentContent.length > 0) {
      const chunkContent = currentContent.join('\n').trim()
      chunks.push({
        id: `${path.basename(filepath)}-chunk-${chunkIndex}`,
        content: chunkContent,
        metadata: {
          filename: filepath,
          chunkIndex,
          totalChunks: chunks.length + 1,
          section: currentSection,
          startChar,
          endChar: startChar + chunkContent.length,
          timestamp,
          fileType: '.md'
        }
      })
    }
    
    chunks.forEach(chunk => {
      chunk.metadata.totalChunks = chunks.length
    })
    
    return chunks
  }

  private chunkByParagraphs(
    content: string, 
    filepath: string, 
    timestamp: string,
    fileType: string
  ): DocumentChunk[]> {
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    const chunks: DocumentChunk[] = []
    let currentChunk: string[] = []
    let currentSize = 0
    let startChar = 0
    let chunkIndex = 0
    
    for (const paragraph of paragraphs) {
      if (currentSize + paragraph.length > this.options.chunkSize && currentChunk.length > 0) {
        const chunkContent = currentChunk.join('\n\n')
        chunks.push({
          id: `${path.basename(filepath)}-chunk-${chunkIndex}`,
          content: chunkContent,
          metadata: {
            filename: filepath,
            chunkIndex,
            totalChunks: 0,
            startChar,
            endChar: startChar + chunkContent.length,
            timestamp,
            fileType
          }
        })
        
        chunkIndex++
        startChar += chunkContent.length
        
        if (this.options.overlap > 0) {
          const overlapParagraphs = currentChunk.slice(-Math.ceil(currentChunk.length * 0.2))
          currentChunk = overlapParagraphs
          currentSize = overlapParagraphs.join('\n\n').length
        } else {
          currentChunk = []
          currentSize = 0
        }
      }
      
      currentChunk.push(paragraph)
      currentSize += paragraph.length
    }
    
    if (currentChunk.length > 0) {
      const chunkContent = currentChunk.join('\n\n')
      chunks.push({
        id: `${path.basename(filepath)}-chunk-${chunkIndex}`,
        content: chunkContent,
        metadata: {
          filename: filepath,
          chunkIndex,
          totalChunks: chunks.length + 1,
          startChar,
          endChar: startChar + chunkContent.length,
          timestamp,
          fileType
        }
      })
    }
    
    chunks.forEach(chunk => {
      chunk.metadata.totalChunks = chunks.length
    })
    
    return chunks
  }

  private chunkBySliding(
    content: string, 
    filepath: string, 
    timestamp: string,
    fileType: string
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = []
    const words = content.split(/\s+/)
    const wordsPerChunk = Math.floor(this.options.chunkSize / 5)
    const overlapWords = Math.floor(wordsPerChunk * (this.options.overlap / 100))
    
    for (let i = 0; i < words.length; i += wordsPerChunk - overlapWords) {
      const chunkWords = words.slice(i, i + wordsPerChunk)
      const chunkContent = chunkWords.join(' ')
      
      chunks.push({
        id: `${path.basename(filepath)}-chunk-${chunks.length}`,
        content: chunkContent,
        metadata: {
          filename: filepath,
          chunkIndex: chunks.length,
          totalChunks: 0,
          startChar: i * 5,
          endChar: (i + chunkWords.length) * 5,
          timestamp,
          fileType
        }
      })
      
      if (i + wordsPerChunk >= words.length) break
    }
    
    chunks.forEach(chunk => {
      chunk.metadata.totalChunks = chunks.length
    })
    
    return chunks
  }
}
```

### Update Database Types

Update `src/db/types.ts`:

```typescript
export interface VectorDocument {
  id?: number | string
  filename: string
  content: string
  embedding?: number[]
  metadata?: Record<string, any>
  chunkIndex?: number
  section?: string
}

export interface QueryResult {
  id: number | string
  filename: string
  content: string
  score: number
  metadata?: Record<string, any>
}

export interface VectorDB {
  initialize(): Promise<void>
  insertDocuments(documents: VectorDocument[]): Promise<void>
  query(embedding: number[], limit?: number, filter?: Record<string, any>): Promise<QueryResult[]>
  close(): Promise<void>
  
  // New methods for metadata support
  createMetadataIndex?(field: string, type: string): Promise<void>
  fullTextSearch?(query: string, limit?: number): Promise<QueryResult[]>
}
```

### Update Embed Command

Update `src/commands/embed.ts`:

```typescript
import { Command } from 'commander'
import { createEmbeddings } from '../operations/create.js'
import { queryEmbeddings, hybridQuery } from '../operations/query.js'

export const embedCommand = new Command('embed')
  .description('Manage vector embeddings')

embedCommand
  .command('create')
  .description('Create embeddings from files')
  .requiredOption('--db <type>', 'database type (sqlite, pgvector, vectorize)')
  .requiredOption('--files <path>', 'path to content directory')
  .option('--chunk-size <size>', 'chunk size in characters', '1000')
  .option('--overlap <percent>', 'overlap percentage for sliding window', '20')
  .option('--method <method>', 'chunking method (sliding, paragraph, section)', 'paragraph')
  .action(async (options) => {
    console.log(`Creating embeddings with ${options.db} from ${options.files}`)
    console.log(`Chunking method: ${options.method}, size: ${options.chunkSize}, overlap: ${options.overlap}%`)
    
    try {
      await createEmbeddings(options.db, options.files, {
        chunkSize: parseInt(options.chunkSize),
        overlap: parseInt(options.overlap),
        method: options.method
      })
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
  .option('--hybrid', 'use hybrid search (vector + keyword)', false)
  .option('--filter <json>', 'metadata filter as JSON', '{}')
  .option('--limit <number>', 'number of results', '5')
  .action(async (options) => {
    console.log(`Querying ${options.db} with prompt: ${options.prompt}`)
    
    try {
      const filter = JSON.parse(options.filter)
      let results
      
      if (options.hybrid) {
        console.log('Using hybrid search mode')
        results = await hybridQuery(options.db, options.prompt, {
          limit: parseInt(options.limit),
          filter
        })
      } else {
        results = await queryEmbeddings(options.db, options.prompt, {
          limit: parseInt(options.limit),
          filter
        })
      }
      
      console.log('Query results:')
      results.forEach((result, index) => {
        console.log(`\n${index + 1}. Score: ${result.score.toFixed(4)}`)
        console.log(`   File: ${result.filename}`)
        if (result.metadata?.section) {
          console.log(`   Section: ${result.metadata.section}`)
        }
        if (result.metadata?.chunkIndex !== undefined) {
          console.log(`   Chunk: ${result.metadata.chunkIndex + 1}/${result.metadata.totalChunks}`)
        }
        console.log(`   Content: ${result.content.substring(0, 200)}...`)
      })
    } catch (error) {
      console.error('Failed to query embeddings:', error)
      process.exit(1)
    }
  })
```

## Part 2: Hybrid Search Implementation

### Create Hybrid Search Module

Create `src/utils/hybrid.ts`:

```typescript
import natural from 'natural'
import Fuse from 'fuse.js'
import type { QueryResult } from '../db/types.js'

const TfIdf = natural.TfIdf

export interface HybridSearchOptions {
  vectorWeight: number
  keywordWeight: number
  rerank: boolean
}

export class HybridSearcher {
  private tfidf: any
  private documents: Map<string, { content: string; metadata: any }>
  
  constructor() {
    this.tfidf = new TfIdf()
    this.documents = new Map()
  }
  
  addDocuments(documents: Array<{ id: string; content: string; metadata?: any }>) {
    documents.forEach(doc => {
      this.tfidf.addDocument(doc.content)
      this.documents.set(doc.id, { content: doc.content, metadata: doc.metadata })
    })
  }
  
  keywordSearch(query: string, limit: number = 10): Array<{ id: string; score: number }> {
    const scores: Array<{ id: string; score: number }> = []
    
    this.tfidf.tfidfs(query, (i: number, measure: number) => {
      const docId = Array.from(this.documents.keys())[i]
      if (docId && measure > 0) {
        scores.push({ id: docId, score: measure })
      }
    })
    
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => ({ ...s, score: s.score / (scores[0]?.score || 1) }))
  }
  
  fuseSearch(query: string, limit: number = 10): Array<{ id: string; score: number }> {
    const documents = Array.from(this.documents.entries()).map(([id, doc]) => ({
      id,
      content: doc.content
    }))
    
    const fuse = new Fuse(documents, {
      keys: ['content'],
      threshold: 0.6,
      includeScore: true
    })
    
    const results = fuse.search(query, { limit })
    
    return results.map(result => ({
      id: result.item.id,
      score: 1 - (result.score || 0)
    }))
  }
  
  mergeResults(
    vectorResults: QueryResult[],
    keywordResults: Array<{ id: string; score: number }>,
    options: HybridSearchOptions
  ): QueryResult[] {
    const merged = new Map<string, { result: QueryResult; score: number }>()
    
    // Add vector results
    vectorResults.forEach(result => {
      merged.set(result.id.toString(), {
        result,
        score: result.score * options.vectorWeight
      })
    })
    
    // Merge keyword results
    keywordResults.forEach(kwResult => {
      const existing = merged.get(kwResult.id)
      if (existing) {
        existing.score += kwResult.score * options.keywordWeight
      } else {
        const doc = this.documents.get(kwResult.id)
        if (doc) {
          merged.set(kwResult.id, {
            result: {
              id: kwResult.id,
              filename: doc.metadata?.filename || 'unknown',
              content: doc.content,
              score: kwResult.score * options.keywordWeight,
              metadata: doc.metadata
            },
            score: kwResult.score * options.keywordWeight
          })
        }
      }
    })
    
    // Sort by combined score
    const results = Array.from(merged.values())
      .sort((a, b) => b.score - a.score)
      .map(item => ({
        ...item.result,
        score: item.score / (options.vectorWeight + options.keywordWeight)
      }))
    
    return results
  }
  
  async rerankWithLLM(
    results: QueryResult[],
    query: string,
    openaiClient: any
  ): Promise<QueryResult[]> {
    console.log('Re-ranking results with LLM...')
    
    const prompt = `Given the query "${query}", rank these text passages from most to least relevant. 
Return only the indices in order of relevance as a comma-separated list.

${results.map((r, i) => `[${i}] ${r.content.substring(0, 200)}...`).join('\n\n')}

Ranking (most to least relevant):`;
    
    try {
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 100
      })
      
      const ranking = response.choices[0].message.content
        .split(',')
        .map((s: string) => parseInt(s.trim()))
        .filter((n: number) => !isNaN(n))
      
      const reranked = ranking
        .map((index: number) => results[index])
        .filter(Boolean)
      
      // Add any missing results at the end
      const included = new Set(ranking)
      results.forEach((result, index) => {
        if (!included.has(index)) {
          reranked.push(result)
        }
      })
      
      return reranked
    } catch (error) {
      console.error('LLM reranking failed, returning original order:', error)
      return results
    }
  }
}
```

### Update SQLite Implementation for Metadata

Update `src/db/sqlite.ts`:

```typescript
import Database from 'better-sqlite3'
import * as sqliteVec from 'sqlite-vec'
import type { VectorDB, VectorDocument, QueryResult } from './types.js'

export class SqliteVectorDB implements VectorDB {
  private db: Database.Database
  private hybridSearcher?: any

  constructor(dbPath: string = './embeddings.db') {
    console.log(`Initializing SQLite database at ${dbPath}`)
    this.db = new Database(dbPath)
    sqliteVec.load(this.db)
    console.log(`sqlite-vec version: ${this.db.prepare("SELECT vec_version() as version").get().version}`)
  }

  async initialize(): Promise<void> {
    console.log('Creating embeddings table if not exists')
    
    // Enhanced schema with metadata
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        doc_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding BLOB NOT NULL,
        chunk_index INTEGER DEFAULT 0,
        total_chunks INTEGER DEFAULT 1,
        section TEXT,
        start_char INTEGER,
        end_char INTEGER,
        timestamp TEXT,
        file_type TEXT,
        metadata TEXT
      )
    `)
    
    // Create indexes for metadata filtering
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_embeddings_filename ON embeddings(filename);
      CREATE INDEX IF NOT EXISTS idx_embeddings_section ON embeddings(section);
      CREATE INDEX IF NOT EXISTS idx_embeddings_timestamp ON embeddings(timestamp);
    `)
    
    // Create FTS5 virtual table for full-text search
    this.db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS embeddings_fts USING fts5(
        doc_id, content, filename, section,
        content=embeddings, content_rowid=id
      );
      
      CREATE TRIGGER IF NOT EXISTS embeddings_ai AFTER INSERT ON embeddings BEGIN
        INSERT INTO embeddings_fts(doc_id, content, filename, section)
        VALUES (new.doc_id, new.content, new.filename, new.section);
      END;
    `)
    
    console.log('SQLite database initialized with enhanced metadata support')
  }

  async insertDocuments(documents: VectorDocument[]): Promise<void> {
    console.log(`Inserting ${documents.length} documents`)
    
    const stmt = this.db.prepare(`
      INSERT INTO embeddings (
        doc_id, filename, content, embedding, chunk_index, total_chunks,
        section, start_char, end_char, timestamp, file_type, metadata
      ) VALUES (?, ?, ?, vec_f32(?), ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const insertMany = this.db.transaction((docs: VectorDocument[]) => {
      docs.forEach(doc => {
        if (!doc.embedding) throw new Error('Document missing embedding')
        const embeddingBuffer = new Float32Array(doc.embedding).buffer
        
        stmt.run(
          doc.id || `doc-${Date.now()}`,
          doc.filename,
          doc.content,
          new Uint8Array(embeddingBuffer),
          doc.metadata?.chunkIndex || 0,
          doc.metadata?.totalChunks || 1,
          doc.metadata?.section || null,
          doc.metadata?.startChar || 0,
          doc.metadata?.endChar || doc.content.length,
          doc.metadata?.timestamp || new Date().toISOString(),
          doc.metadata?.fileType || '.txt',
          JSON.stringify(doc.metadata || {})
        )
      })
    })
    
    insertMany(documents)
    console.log(`Successfully inserted ${documents.length} documents`)
  }

  async query(
    embedding: number[], 
    limit: number = 5, 
    filter?: Record<string, any>
  ): Promise<QueryResult[]> {
    console.log(`Querying for ${limit} nearest neighbors`)
    
    let whereClause = ''
    const params: any[] = [new Uint8Array(new Float32Array(embedding).buffer)]
    
    if (filter && Object.keys(filter).length > 0) {
      const conditions: string[] = []
      
      if (filter.filename) {
        conditions.push('filename = ?')
        params.push(filter.filename)
      }
      if (filter.section) {
        conditions.push('section = ?')
        params.push(filter.section)
      }
      if (filter.afterDate) {
        conditions.push('timestamp > ?')
        params.push(filter.afterDate)
      }
      
      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ')
      }
    }
    
    params.push(limit)
    
    const query = `
      SELECT 
        doc_id as id,
        filename,
        content,
        vec_distance_cosine(embedding, vec_f32(?)) as distance,
        chunk_index,
        total_chunks,
        section,
        metadata
      FROM embeddings
      ${whereClause}
      ORDER BY distance ASC
      LIMIT ?
    `
    
    const results = this.db.prepare(query).all(...params) as any[]
    
    console.log(`Found ${results.length} results`)
    return results.map(row => ({
      id: row.id,
      filename: row.filename,
      content: row.content,
      score: 1 - row.distance,
      metadata: {
        ...JSON.parse(row.metadata || '{}'),
        chunkIndex: row.chunk_index,
        totalChunks: row.total_chunks,
        section: row.section
      }
    }))
  }

  async fullTextSearch(query: string, limit: number = 10): Promise<QueryResult[]> {
    console.log(`Full-text search for: ${query}`)
    
    const results = this.db.prepare(`
      SELECT 
        e.doc_id as id,
        e.filename,
        e.content,
        e.chunk_index,
        e.total_chunks,
        e.section,
        e.metadata,
        rank
      FROM embeddings_fts fts
      JOIN embeddings e ON e.doc_id = fts.doc_id
      WHERE embeddings_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `).all(query, limit) as any[]
    
    return results.map(row => ({
      id: row.id,
      filename: row.filename,
      content: row.content,
      score: -row.rank, // FTS5 rank is negative
      metadata: {
        ...JSON.parse(row.metadata || '{}'),
        chunkIndex: row.chunk_index,
        totalChunks: row.total_chunks,
        section: row.section
      }
    }))
  }

  async close(): Promise<void> {
    console.log('Closing SQLite database')
    this.db.close()
  }
}
```

## Part 3: Live RAG Chat Implementation

### Create Chat Command

Create `src/commands/chat.ts`:

```typescript
import { Command } from 'commander'
import { createInterface } from 'readline'
import { OpenAI } from 'openai'
import { queryEmbeddings } from '../operations/query.js'
import { createVectorDB } from '../db/factory.js'
import type { QueryResult } from '../db/types.js'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  context?: QueryResult[]
}

export const chatCommand = new Command('chat')
  .description('Interactive RAG chat')
  .requiredOption('--db <type>', 'database type (sqlite, pgvector, vectorize)')
  .option('--model <model>', 'OpenAI model to use', 'gpt-4o-mini')
  .option('--system <prompt>', 'system prompt', 'You are a helpful assistant. Use the provided context to answer questions.')
  .action(async (options) => {
    console.log('Starting RAG chat interface...')
    console.log('Type "exit" to quit, "clear" to reset conversation\n')
    
    const openai = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] })
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'You: '
    })
    
    const db = createVectorDB(options.db)
    await db.initialize()
    
    const conversationHistory: ChatMessage[] = [{
      role: 'system',
      content: options.system
    }]
    
    async function handleUserInput(input: string) {
      if (input.toLowerCase() === 'exit') {
        await db.close()
        rl.close()
        return
      }
      
      if (input.toLowerCase() === 'clear') {
        conversationHistory.length = 1 // Keep system prompt
        console.log('\nConversation cleared.\n')
        rl.prompt()
        return
      }
      
      try {
        // Retrieve relevant context
        console.log('\nSearching for relevant context...')
        const searchResults = await queryEmbeddings(options.db, input, { limit: 3 })
        
        // Build context string
        const context = searchResults
          .map((r, i) => `[Source ${i + 1}: ${r.filename}${r.metadata?.section ? ` - ${r.metadata.section}` : ''}]\n${r.content}`)
          .join('\n\n')
        
        // Create augmented prompt
        const augmentedPrompt = `Context:\n${context}\n\nQuestion: ${input}`
        
        conversationHistory.push({
          role: 'user',
          content: augmentedPrompt,
          context: searchResults
        })
        
        // Stream response
        console.log('\nAssistant: ', { end: '' })
        
        const stream = await openai.chat.completions.create({
          model: options.model,
          messages: conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          stream: true,
          temperature: 0.7
        })
        
        let assistantResponse = ''
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || ''
          process.stdout.write(content)
          assistantResponse += content
        }
        
        conversationHistory.push({
          role: 'assistant',
          content: assistantResponse
        })
        
        // Show sources
        console.log('\n\nSources:')
        searchResults.forEach((r, i) => {
          console.log(`  ${i + 1}. ${r.filename}${r.metadata?.section ? ` - ${r.metadata.section}` : ''} (score: ${r.score.toFixed(3)})`)
        })
        
        console.log('')
      } catch (error) {
        console.error('\nError:', error)
      }
      
      rl.prompt()
    }
    
    rl.on('line', handleUserInput)
    rl.prompt()
  })
```

### Create Web Server for Chat

Create `src/server/index.ts`:

```typescript
import { serve } from 'bun'
import { OpenAI } from 'openai'
import { createVectorDB } from '../db/factory.js'
import { queryEmbeddings } from '../operations/query.js'

const PORT = process.env['PORT'] || 3000
const DB_TYPE = process.env['VECTOR_DB'] || 'sqlite'

const openai = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] })
let db: any

// Initialize database
async function initDB() {
  db = createVectorDB(DB_TYPE)
  await db.initialize()
  console.log(`Connected to ${DB_TYPE} database`)
}

// HTML interface
const html = `
<!DOCTYPE html>
<html>
<head>
  <title>RAG Chat</title>
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 0 auto; padding: 20px; }
    #chat { height: 500px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; }
    .message { margin: 10px 0; }
    .user { color: blue; }
    .assistant { color: green; }
    .sources { color: gray; font-size: 0.9em; }
    #input { width: 100%; padding: 10px; }
    button { padding: 10px 20px; }
  </style>
</head>
<body>
  <h1>RAG Chat Interface</h1>
  <div id="chat"></div>
  <input type="text" id="input" placeholder="Ask a question..." />
  <button onclick="sendMessage()">Send</button>
  
  <script>
    const chat = document.getElementById('chat');
    const input = document.getElementById('input');
    
    async function sendMessage() {
      const message = input.value.trim();
      if (!message) return;
      
      // Add user message
      chat.innerHTML += '<div class="message user">You: ' + message + '</div>';
      input.value = '';
      
      // Send to server
      try {
        const response = await fetch('/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantDiv = document.createElement('div');
        assistantDiv.className = 'message assistant';
        assistantDiv.innerHTML = 'Assistant: ';
        chat.appendChild(assistantDiv);
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                continue;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantDiv.innerHTML += parsed.content;
                } else if (parsed.sources) {
                  const sourcesDiv = document.createElement('div');
                  sourcesDiv.className = 'sources';
                  sourcesDiv.innerHTML = '<br>Sources:<br>' + 
                    parsed.sources.map(s => '• ' + s).join('<br>');
                  assistantDiv.appendChild(sourcesDiv);
                }
              } catch (e) {}
            }
          }
        }
        
        chat.scrollTop = chat.scrollHeight;
      } catch (error) {
        chat.innerHTML += '<div class="message error">Error: ' + error.message + '</div>';
      }
    }
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  </script>
</body>
</html>
`

// Serve the chat interface
serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)
    
    if (url.pathname === '/') {
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      })
    }
    
    if (url.pathname === '/chat' && req.method === 'POST') {
      const { message } = await req.json()
      
      // Create a streaming response
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Get context
            const searchResults = await queryEmbeddings(DB_TYPE, message, { limit: 3 })
            
            const context = searchResults
              .map((r, i) => `[${r.filename}]: ${r.content.substring(0, 300)}...`)
              .join('\n\n')
            
            // Stream OpenAI response
            const completion = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: 'You are a helpful assistant. Use the provided context to answer questions.' },
                { role: 'user', content: `Context:\n${context}\n\nQuestion: ${message}` }
              ],
              stream: true
            })
            
            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content || ''
              if (content) {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`))
              }
            }
            
            // Send sources
            const sources = searchResults.map(r => 
              `${r.filename}${r.metadata?.section ? ' - ' + r.metadata.section : ''} (${r.score.toFixed(3)})`
            )
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ sources })}\n\n`))
            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
            
          } catch (error) {
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: error.message })}\n\n`))
          }
          controller.close()
        }
      })
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      })
    }
    
    return new Response('Not found', { status: 404 })
  }
})

// Initialize database on startup
await initDB()
console.log(`RAG Chat server running at http://localhost:${PORT}`)
```

### Create Cloudflare Worker

Create `src/worker/index.ts`:

```typescript
import { OpenAI } from 'openai'

export interface Env {
  VECTORIZE: Vectorize
  OPENAI_API_KEY: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    
    // Serve chat interface
    if (url.pathname === '/') {
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      })
    }
    
    // Handle chat API
    if (url.pathname === '/chat' && request.method === 'POST') {
      const { message } = await request.json() as { message: string }
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })
      
      // Generate embedding for the query
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: message
      })
      
      const queryEmbedding = embeddingResponse.data[0].embedding
      
      // Query Vectorize
      const matches = await env.VECTORIZE.query(queryEmbedding, {
        topK: 3,
        returnMetadata: 'all'
      })
      
      // Build context
      const context = matches.matches
        .map((m: any) => `[${m.metadata.filename}]: ${m.metadata.content}`)
        .join('\n\n')
      
      // Create streaming response
      const { readable, writable } = new TransformStream()
      const writer = writable.getWriter()
      const encoder = new TextEncoder()
      
      // Start streaming in background
      (async () => {
        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              { role: 'user', content: `Context:\n${context}\n\nQuestion: ${message}` }
            ],
            stream: true
          })
          
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              await writer.write(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
            }
          }
          
          // Send sources
          const sources = matches.matches.map((m: any) => 
            `${m.metadata.filename} (${m.score.toFixed(3)})`
          )
          await writer.write(encoder.encode(`data: ${JSON.stringify({ sources })}\n\n`))
          await writer.write(encoder.encode('data: [DONE]\n\n'))
          
        } catch (error: any) {
          await writer.write(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`))
        } finally {
          await writer.close()
        }
      })()
      
      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache'
        }
      })
    }
    
    return new Response('Not found', { status: 404 })
  }
}

// Reuse the HTML from the Bun server
const html = `...` // Same HTML as above
```

### Docker Configuration

Create `Dockerfile`:

```dockerfile
FROM oven/bun:1-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Compile TypeScript
RUN bun run check

EXPOSE 3000

CMD ["bun", "run", "src/server/index.ts"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  rag-chat:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - VECTOR_DB=sqlite
      - PORT=3000
    volumes:
      - ./embeddings.db:/app/embeddings.db
      - ./content:/app/content
```

## Usage Examples

### 1. Create Chunked Embeddings

```bash
# Section-based chunking for markdown files
npm run as -- embed create --db sqlite --files ./content \
  --method section --chunk-size 1500 --overlap 20

# Paragraph-based chunking with smaller chunks
npm run as -- embed create --db pgvector --files ./content \
  --method paragraph --chunk-size 500 --overlap 30

# Sliding window for all files
npm run as -- embed create --db vectorize --files ./content \
  --method sliding --chunk-size 1000 --overlap 25
```

### 2. Query with Metadata Filters

```bash
# Filter by filename
npm run as -- embed query --db sqlite \
  --prompt "What is vector search?" \
  --filter '{"filename": "./content/vectordb.md"}'

# Filter by section (for markdown files)
npm run as -- embed query --db pgvector \
  --prompt "Tell me about embeddings" \
  --filter '{"section": "Vector Embeddings"}'

# Filter by date (documents added after specific time)
npm run as -- embed query --db vectorize \
  --prompt "Recent updates" \
  --filter '{"afterDate": "2024-01-01"}'
```

### 3. Hybrid Search

```bash
# Combine vector and keyword search
npm run as -- embed query --db sqlite \
  --prompt "Cloudflare Workers serverless" \
  --hybrid --limit 10

# Hybrid search with filtering
npm run as -- embed query --db pgvector \
  --prompt "FSJam conference speakers" \
  --hybrid --filter '{"filename": "./content/fsjam.txt"}'
```

### 4. Interactive RAG Chat

```bash
# Terminal-based chat
npm run as -- chat --db sqlite

# Web-based chat with Bun
VECTOR_DB=sqlite bun run src/server/index.ts

# Deploy to Cloudflare Workers
npx wrangler deploy src/worker/index.ts

# Run with Docker
docker-compose up
```

## Key Improvements

1. **Smart Chunking**: Documents are now intelligently split with configurable overlap, preserving context across chunk boundaries.

2. **Rich Metadata**: Each chunk carries metadata about its source, position, and semantic context, enabling precise filtering.

3. **Hybrid Search**: Combines the semantic understanding of vector search with the precision of keyword matching.

4. **Interactive RAG**: Full chat interface with conversation memory and source attribution.

5. **Production Ready**: Deployable via Cloudflare Workers for global edge deployment or containerized with Docker.

## Performance Considerations

- **Chunk Size**: Smaller chunks (500-1000 chars) provide more precise results but increase storage. Larger chunks (1500-3000 chars) provide more context but may reduce precision.

- **Overlap**: 20-30% overlap helps maintain context across boundaries but increases storage requirements.

- **Hybrid Weights**: Default 0.7 vector / 0.3 keyword works well for most cases. Adjust based on your content type.

- **Conversation History**: In production, implement conversation pruning to manage token limits and costs.

This enhanced system provides a production-ready foundation for building sophisticated RAG applications with nuanced search capabilities and interactive interfaces.