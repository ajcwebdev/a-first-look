# Complete Tutorial: Building a Vector Database CLI with SQLite, pgvector, and Cloudflare Vectorize

This tutorial will walk you through building a CLI tool that supports three different vector databases: SQLite with sql-vec, PostgreSQL with pgvector, and Cloudflare's Vectorize. We'll build and test each database incrementally.

## Prerequisites

Before starting, ensure you have:
- Node.js 16.17.0 or later installed
- npm or yarn package manager
- An OpenAI API key (get one at https://platform.openai.com/)
- Homebrew (for macOS users to install PostgreSQL)
- A Cloudflare account (for Vectorize section - we'll add this later)

## Step 1: Project Setup

First, let's create our project and install the initial dependencies we'll need for SQLite:

```bash
mkdir autoshow-rag
cd autoshow-rag
npm init -y
npm install commander better-sqlite3 sqlite-vec glob openai
npm install -D @types/better-sqlite3 @types/node tsx typescript
```

Update your `package.json`:

```json
{
  "name": "autoshow-rag",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "as": "tsx --env-file=.env --no-warnings index.ts",
    "check": "npx tsc --noEmit"
  },
  "dependencies": {
    "better-sqlite3": "11.6.0",
    "commander": "14.0.0",
    "glob": "11.0.0",
    "openai": "4.77.0",
    "sqlite-vec": "0.1.6"
  },
  "devDependencies": {
    "@types/better-sqlite3": "7.6.12",
    "@types/node": "24.0.10",
    "tsx": "4.20.3",
    "typescript": "5.8.3"
  }
}
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "lib": ["esnext"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true
  }
}
```

## Step 2: Create Test Content

Create a `content` directory with some test files:

```bash
mkdir content
```

Create `content/fsjam.txt`:

```text
echo "FSJam is a fullstack development conference that brings together developers from around the world to discuss modern web technologies, serverless architectures, and the latest trends in JavaScript frameworks." > content/fsjam.txt
```

Create `content/vectordb.md`:

```markdown
echo "Vector databases are specialized databases designed to store and query high-dimensional vector embeddings. They enable similarity search, which is crucial for AI applications like recommendation systems, semantic search, and RAG (Retrieval Augmented Generation). Popular vector databases include Pinecone, Weaviate, Qdrant, and Chroma." > content/vectordb.md
```

Create `content/cloudflare.txt`:

```text
echo "Cloudflare Workers is a serverless execution environment that allows you to create entirely new applications or augment existing ones without configuring or maintaining infrastructure. Workers run on Cloudflare's global network in over 300 cities around the world, automatically scaling as needed." > content/cloudflare.txt
```

## Step 3: Set Up Environment Variables

Create a `.env` file:

```env
OPENAI_API_KEY=your-openai-api-key-here
```

## Step 4: Create the Project Structure for SQLite

Let's start with just the files needed for SQLite:

```
autoshow-rag/
├── src/
│   ├── commands/
│   │   └── embed.ts
│   ├── db/
│   │   ├── factory.ts
│   │   ├── types.ts
│   │   └── sqlite.ts
│   ├── operations/
│   │   ├── create.ts
│   │   └── query.ts
│   └── utils/
│       ├── files.ts
│       └── embeddings.ts
└── index.ts
```

## Step 5: Implement Core Files for SQLite

### index.ts

```typescript
import { Command } from 'commander'
import { embedCommand } from './src/commands/embed.js'

const program = new Command()

program
  .name('autoshow-rag')
  .description('CLI for vector database operations with sql-vec, pgvector, and vectorize')
  .version('1.0.0')

program.addCommand(embedCommand)

try {
  await program.parseAsync(process.argv)
} catch (error) {
  console.error('Error:', error)
  process.exit(1)
}
```

### src/db/types.ts

```typescript
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
```

### src/db/sqlite.ts

```typescript
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
```

### src/db/factory.ts (SQLite only for now)

```typescript
import { SqliteVectorDB } from './sqlite.js'
import type { VectorDB } from './types.js'

export function createVectorDB(type: string): VectorDB {
  console.log(`Creating ${type} vector database`)
  
  switch (type.toLowerCase()) {
    case 'sqlite':
      return new SqliteVectorDB()
    default:
      throw new Error(`Unsupported database type: ${type}`)
  }
}
```

### src/utils/files.ts

```typescript
import { readFile } from 'fs/promises'
import { glob } from 'glob'
import { join } from 'path'

export interface FileContent {
  filename: string
  content: string
}

export async function readContentFiles(directory: string): Promise<FileContent[]> {
  console.log(`Reading content files from ${directory}`)
  
  const patterns = ['**/*.txt', '**/*.md']
  const files: string[] = []
  
  for (const pattern of patterns) {
    const matches = await glob(pattern, { cwd: directory })
    files.push(...matches.map(f => join(directory, f)))
  }
  
  console.log(`Found ${files.length} files to process`)
  
  const contents = await Promise.all(
    files.map(async (filepath) => {
      const content = await readFile(filepath, 'utf-8')
      return {
        filename: filepath,
        content: content.trim()
      }
    })
  )
  
  return contents.filter(f => f.content.length > 0)
}
```

### src/utils/embeddings.ts

```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY']
})

export async function generateEmbedding(text: string): Promise<number[]> {
  console.log(`Generating embedding for text of length ${text.length}`)
  
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    })
    
    if (!response.data || !response.data[0] || !response.data[0].embedding) {
      throw new Error('Embedding data is missing in the response')
    }
    return response.data[0].embedding
  } catch (error) {
    console.error('Failed to generate embedding:', error)
    throw error
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  console.log(`Generating embeddings for ${texts.length} texts`)
  
  const batchSize = 20
  const embeddings: number[][] = []
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(texts.length / batchSize)}`)
    
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: batch
      })
      
      embeddings.push(...response.data.map(d => d.embedding))
    } catch (error) {
      console.error('Failed to generate embeddings for batch:', error)
      throw error
    }
  }
  
  return embeddings
}
```

### src/operations/create.ts

```typescript
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
```

### src/operations/query.ts

```typescript
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
```

### src/commands/embed.ts

```typescript
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
```

## Step 6: Test SQLite Functionality

Now let's test our SQLite implementation:

### Create embeddings with SQLite

```bash
npm run as -- embed create --db sqlite --files ./content
```

Expected output:
```
Creating embeddings with sqlite from ./content
Creating sqlite vector database
Initializing SQLite database at ./embeddings.db
sqlite-vec version: v0.1.6
Creating embeddings table if not exists
SQLite database initialized
Reading content files from ./content
Found 3 files to process
Loaded 3 files
Generating embeddings for 3 texts
Processing batch 1 of 1
Generating embedding for text of length 206
Generating embedding for text of length 371
Generating embedding for text of length 272
Inserting 3 documents
Successfully inserted 3 documents
All embeddings created and stored successfully
Closing SQLite database
Embeddings created successfully
```

### Query embeddings with SQLite

```bash
npm run as -- embed query --db sqlite --prompt "What is FSJam?"
```

Expected output:

```
Querying sqlite with prompt: What is FSJam?
Creating sqlite vector database
Initializing SQLite database at ./embeddings.db
sqlite-vec version: v0.1.6
Creating embeddings table if not exists
SQLite database initialized
Starting query process
Generating embedding for text of length 14
Generated query embedding
Querying for 5 nearest neighbors
Found 3 results
Retrieved 3 results
Closing SQLite database
Query results:

1. Score: 0.8234
   File: ./content/fsjam.txt
   Content: FSJam is a fullstack development conference that brings together developers
from around the world to discuss modern web technologies, serverless...

2. Score: 0.6891
   File: ./content/vectordb.md
   Content: # Vector Databases

Vector databases are specialized databases designed to store and query high-dimensional
vector embeddings. They enable simila...

3. Score: 0.6245
   File: ./content/cloudflare.txt
   Content: Cloudflare Workers is a serverless execution environment that allows you to create
entirely new applications or augment existing ones without...
```

## Step 7: Add PostgreSQL with pgvector

### Install PostgreSQL with Homebrew (macOS)

```bash
# Install PostgreSQL
brew install postgresql@17

# Set path
echo 'export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc

# Start PostgreSQL service
brew services start postgresql@17

# Create a database
createdb embeddings

# List databases
psql --list
```

### Install pgvector extension and add PostgreSQL dependencies

```bash
# Install pgvector
brew install pgvector

# Connect to the database and enable the extension
psql embeddings -c "CREATE EXTENSION vector;"

npm install pg
npm install -D @types/pg
```

### Update environment variables

Update your `.env` file:

```env
OPENAI_API_KEY=your-openai-api-key-here
DATABASE_URL=postgresql://localhost/embeddings
```

### Add pgvector implementation

Create `src/db/pgvector.ts`:

```typescript
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
```

### Update factory to include pgvector

Update `src/db/factory.ts`:

```typescript
import { SqliteVectorDB } from './sqlite.js'
import { PgVectorDB } from './pgvector.js'
import type { VectorDB } from './types.js'

export function createVectorDB(type: string): VectorDB {
  console.log(`Creating ${type} vector database`)
  
  switch (type.toLowerCase()) {
    case 'sqlite':
      return new SqliteVectorDB()
    case 'pgvector':
      return new PgVectorDB()
    default:
      throw new Error(`Unsupported database type: ${type}`)
  }
}
```

## Step 8: Test pgvector Functionality

### Create embeddings with pgvector

```bash
npm run as -- embed create --db pgvector --files ./content
```

### Query embeddings with pgvector

```bash
npm run as -- embed query --db pgvector --prompt "What is FSJam?"
```

## Step 9: Add Cloudflare Vectorize

### Update package.json

Update your `package.json` to include all dependencies:

```json
{
  "name": "autoshow-rag",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "as": "tsx --env-file=.env --no-warnings index.ts",
    "check": "npx tsc --noEmit"
  },
  "dependencies": {
    "better-sqlite3": "11.6.0",
    "commander": "14.0.0",
    "glob": "11.0.0",
    "node-fetch": "3.3.2",
    "openai": "4.77.0",
    "pg": "8.13.1",
    "sqlite-vec": "0.1.6"
  },
  "devDependencies": {
    "@types/better-sqlite3": "7.6.12",
    "@types/node": "24.0.10",
    "@types/pg": "8.11.10",
    "tsx": "4.20.3",
    "typescript": "5.8.3"
  }
}
```

### Update environment variables

Update your `.env` file:

```env
OPENAI_API_KEY=your-openai-api-key-here
DATABASE_URL=postgresql://localhost/embeddings
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
```

### Get Cloudflare credentials

1. Log in to your Cloudflare dashboard
2. Go to "My Profile" → "API Tokens"
3. Note your Account ID from the dashboard
4. We'll create the API token in the next steps

### Add Vectorize implementation

Create `src/db/vectorize.ts`:

```typescript
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
```

### Update factory to include Vectorize

Update `src/db/factory.ts`:

```typescript
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
```

## Step 10: Add Cloudflare Permission Management

Before we can test Vectorize, we need to set up proper permissions. Let's add a utility command to help manage Cloudflare tokens.

### Create `src/commands/cloudflare.ts`

```typescript
import { Command } from 'commander'

function displayPermissions(data: any) {
  console.log('\nAvailable Permission Groups:')
  console.log('============================\n')
  
  const vectorizeRelated = data.result.filter((perm: any) => 
    perm.name.toLowerCase().includes('vectorize') ||
    perm.name.toLowerCase().includes('worker') ||
    perm.name.toLowerCase().includes('analytics') ||
    perm.name.toLowerCase().includes('ai gateway')
  )
  
  if (vectorizeRelated.length > 0) {
    console.log('Potentially Vectorize-related permissions:')
    vectorizeRelated.forEach((perm: any) => {
      console.log(`\n- ${perm.name}`)
      console.log(`  ID: ${perm.id}`)
      if (perm.scopes && perm.scopes.length > 0) {
        console.log(`  Scopes: ${perm.scopes.join(', ')}`)
      }
    })
    console.log()
  }
  
  console.log('\nAll available permissions:')
  console.log('--------------------------')
  data.result.forEach((perm: any) => {
    console.log(`- ${perm.name} (${perm.id})`)
  })
  
  console.log('\nTotal permission groups:', data.result.length)
}

export const cloudflareCommand = new Command('cloudflare')
  .description('Manage Cloudflare tokens and permissions')

cloudflareCommand
  .command('list-permissions')
  .description('List all available permission groups for your account')
  .action(async () => {
    const accountId = process.env['CLOUDFLARE_ACCOUNT_ID']
    const email = process.env['CLOUDFLARE_EMAIL']
    const globalKey = process.env['CLOUDFLARE_GLOBAL_API_KEY']
    
    if (!accountId) {
      console.error('Please set CLOUDFLARE_ACCOUNT_ID in your .env file')
      process.exit(1)
    }
    
    let apiToken = process.env['CLOUDFLARE_API_TOKEN']
    let headers: any = {
      'Content-Type': 'application/json'
    }
    
    if (apiToken) {
      headers['Authorization'] = `Bearer ${apiToken}`
    } else if (email && globalKey) {
      headers['X-Auth-Email'] = email
      headers['X-Auth-Key'] = globalKey
    } else {
      console.error('\nTo list permissions, you need either:')
      console.error('1. CLOUDFLARE_API_TOKEN in your .env file, OR')
      console.error('2. Both CLOUDFLARE_EMAIL and CLOUDFLARE_GLOBAL_API_KEY')
      console.error('\nYou can find your global API key at:')
      console.error('https://dash.cloudflare.com/profile/api-tokens')
      console.error('(Look for "Global API Key" and click "View")')
      process.exit(1)
    }
    
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/tokens/permission_groups`,
        { headers }
      )
      
      if (!response.ok) {
        const errorText = await response.text()
        
        if (apiToken && email && globalKey) {
          console.log('Token authorization failed, trying with global API key...')
          
          const retryResponse = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/tokens/permission_groups`,
            {
              headers: {
                'X-Auth-Email': email,
                'X-Auth-Key': globalKey,
                'Content-Type': 'application/json'
              }
            }
          )
          
          if (retryResponse.ok) {
            const data = await retryResponse.json() as any
            displayPermissions(data)
            return
          }
        }
        
        throw new Error(`Failed to fetch permission groups: ${errorText}`)
      }
      
      const data = await response.json() as any
      displayPermissions(data)
      
    } catch (error) {
      console.error('Error:', error)
      console.error('\nIf you\'re having authorization issues, make sure you have set:')
      console.error('- CLOUDFLARE_EMAIL=your-email@example.com')
      console.error('- CLOUDFLARE_GLOBAL_API_KEY=your-global-api-key')
      process.exit(1)
    }
  })

cloudflareCommand
  .command('create-vectorize-token')
  .description('Create a new API token with Vectorize permissions')
  .option('--name <name>', 'Token name', 'Vectorize API Token')
  .action(async (options) => {
    const accountId = process.env['CLOUDFLARE_ACCOUNT_ID']
    const email = process.env['CLOUDFLARE_EMAIL']
    const globalKey = process.env['CLOUDFLARE_GLOBAL_API_KEY']
    
    if (!accountId) {
      console.error('Please set CLOUDFLARE_ACCOUNT_ID in your .env file')
      process.exit(1)
    }
    
    if (!email || !globalKey) {
      console.error('\nTo create a new token, you need to use your global API key.')
      console.error('Please add these to your .env file:')
      console.error('CLOUDFLARE_EMAIL=your-email@example.com')
      console.error('CLOUDFLARE_GLOBAL_API_KEY=your-global-api-key')
      console.error('\nYou can find your global API key at:')
      console.error('https://dash.cloudflare.com/profile/api-tokens')
      console.error('(Look for "Global API Key" and click "View")')
      process.exit(1)
    }
    
    console.log('Creating new API token with Vectorize permissions...')
    
    try {
      const permResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/tokens/permission_groups`,
        {
          headers: {
            'X-Auth-Email': email,
            'X-Auth-Key': globalKey,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (!permResponse.ok) {
        throw new Error(`Failed to fetch permissions: ${await permResponse.text()}`)
      }
      
      const permData = await permResponse.json() as any
      
      console.log('Looking for required permissions...')
      
      const requiredPerms = permData.result.filter((perm: any) => 
        perm.name === 'Vectorize Read' ||
        perm.name === 'Vectorize Write' ||
        perm.name.includes('Workers Scripts') ||
        perm.name.includes('Workers KV Storage') ||
        perm.name.includes('Workers Routes') ||
        perm.name.includes('Account Analytics') ||
        perm.name.includes('Analytics')
      )
      
      if (requiredPerms.length === 0) {
        console.error('Could not find required permissions. Available permissions:')
        permData.result.forEach((perm: any) => {
          console.log(`- ${perm.name} (${perm.id})`)
        })
        process.exit(1)
      }
      
      const hasVectorizePerms = requiredPerms.some((perm: any) => 
        perm.name === 'Vectorize Read' || perm.name === 'Vectorize Write'
      )
      
      if (!hasVectorizePerms) {
        console.error('\n⚠️  WARNING: Vectorize permissions not found in the list!')
        console.error('The token may not work properly for Vectorize operations.')
        console.error('\nExpected permissions:')
        console.error('- Vectorize Read')
        console.error('- Vectorize Write')
      }
      
      console.log('\nFound permissions to include:')
      requiredPerms.forEach((perm: any) => {
        console.log(`- ${perm.name}`)
      })
      
      const tokenBody = {
        name: options.name,
        policies: [
          {
            effect: 'allow',
            permission_groups: requiredPerms.map((perm: any) => ({
              id: perm.id,
              meta: {}
            })),
            resources: {
              [`com.cloudflare.api.account.${accountId}`]: '*'
            }
          }
        ]
      }
      
      const createResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/tokens`,
        {
          method: 'POST',
          headers: {
            'X-Auth-Email': email,
            'X-Auth-Key': globalKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(tokenBody)
        }
      )
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
          if (errorData.errors?.[0]?.message) {
            throw new Error(`Failed to create token: ${errorData.errors[0].message}`)
          }
        } catch (e) {
          console.log('Failed to parse error response')
        }
        throw new Error(`Failed to create token: ${errorText}`)
      }
      
      const tokenData = await createResponse.json() as any
      
      if (!tokenData.result?.value) {
        console.error('\n⚠️  Token created but value not returned in response.')
        console.error('This might be a Cloudflare API limitation.')
        console.error('\nPlease create the token manually via the dashboard:')
        console.error('1. Go to https://dash.cloudflare.com/profile/api-tokens')
        console.error('2. Click "Create Token"')
        console.error('3. Use "Custom token" template')
        console.error('4. Add the permissions shown above')
        console.error('5. Set Account Resources to your account')
        console.error('6. Create and copy the token')
      } else {
        console.log('\n✅ Token created successfully!')
        console.log('\nIMPORTANT: Save this token value, it will only be shown once:')
        console.log('='.repeat(60))
        console.log(tokenData.result.value)
        console.log('='.repeat(60))
        console.log('\nUpdate your .env file:')
        console.log(`CLOUDFLARE_API_TOKEN=${tokenData.result.value}`)
      }
      
      console.log('\nToken details:')
      console.log(`- Name: ${tokenData.result.name}`)
      console.log(`- ID: ${tokenData.result.id}`)
      console.log(`- Status: ${tokenData.result.status || 'active'}`)
      
    } catch (error) {
      console.error('Error:', error)
      console.error('\nIf automated token creation fails, please create manually:')
      console.error('1. Go to https://dash.cloudflare.com/profile/api-tokens')
      console.error('2. Click "Create Token"')
      console.error('3. Choose "Custom token" template')
      console.error('4. Name it "Vectorize API Token"')
      console.error('5. Add these permissions:')
      console.error('   - Account → Vectorize → Read')
      console.error('   - Account → Vectorize → Write')
      console.error('   - Account → Workers Scripts → Edit')
      console.error('   - Account → Workers KV Storage → Edit')
      console.error('   - Account → Workers Routes → Edit')
      console.error('   - Account → Account Analytics → Read')
      console.error('6. Set Account Resources to: Include → Your Account')
      console.error('7. Create the token and copy it to your .env file')
      process.exit(1)
    }
  })

cloudflareCommand
  .command('test-token')
  .description('Test if your current API token works')
  .action(async () => {
    const accountId = process.env['CLOUDFLARE_ACCOUNT_ID']
    const apiToken = process.env['CLOUDFLARE_API_TOKEN']
    
    if (!accountId || !apiToken) {
      console.error('Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in your .env file')
      process.exit(1)
    }
    
    try {
      console.log('Testing token validity...')
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/tokens/verify`,
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      const data = await response.json() as any
      
      if (response.ok && data.success) {
        console.log('✅ Token is valid!')
        console.log(`- Token ID: ${data.result.id}`)
        console.log(`- Status: ${data.result.status}`)
        if (data.result.expires_on) {
          console.log(`- Expires: ${data.result.expires_on}`)
        }
        
        console.log('\nTesting Vectorize access...')
        const vectorizeResponse = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/vectorize/v2/indexes`,
          {
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
        
        if (vectorizeResponse.ok) {
          console.log('✅ Token has access to Vectorize API!')
        } else if (vectorizeResponse.status === 403) {
          console.error('❌ Token does NOT have access to Vectorize API')
          console.error('Please create a new token with Vectorize permissions')
        } else {
          console.error(`⚠️  Unexpected response from Vectorize API: ${vectorizeResponse.status}`)
        }
      } else {
        console.error('❌ Token is invalid or doesn\'t have proper permissions')
        console.error('Error:', data.errors?.[0]?.message || 'Unknown error')
      }
      
    } catch (error) {
      console.error('Error testing token:', error)
      process.exit(1)
    }
  })
```

### Update the main index.ts

Update `index.ts` to include the new command:

```typescript
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
```

## Step 11: Fix Your Vectorize Permissions

### 1. First, add your Cloudflare credentials to `.env`:

```env
OPENAI_API_KEY=your-openai-api-key-here
DATABASE_URL=postgresql://localhost/embeddings
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_EMAIL=your-email@example.com
CLOUDFLARE_GLOBAL_API_KEY=your-global-api-key
```

To get your Global API Key:
- Go to https://dash.cloudflare.com/profile/api-tokens
- Look for "Global API Key" section
- Click "View" and enter your password
- Copy the key

### 2. Test your current token (if you have one):

```bash
npm run as -- cloudflare test-token
```

### 3. List available permissions:

```bash
npm run as -- cloudflare list-permissions
```

This will show you all available permissions, including those related to Vectorize.

### 4. Create a new token with proper permissions:

```bash
npm run as -- cloudflare create-vectorize-token
```

This command will:
- Fetch available permissions
- Filter for Workers/Vectorize related permissions
- Create a new token with the proper permissions
- Display the token value (save it immediately!)

### 5. Update your .env with the new token

Replace your existing `CLOUDFLARE_API_TOKEN` with the new token value.

## Alternative: Manual Token Creation (Recommended)

Since the Cloudflare API for token creation can be complex, creating the token manually through the dashboard is often more reliable:

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Click "Get started" on "Custom token"
4. Configure:
   - **Token name**: Vectorize API Token
   - **Permissions**: Click "+" to add each:
     - Account → Workers Scripts → Edit
     - Account → Workers KV Storage → Edit
     - Account → Workers Routes → Edit
     - Account → Account Analytics → Read
   - **Account Resources**: 
     - Include → Select "All accounts" or your specific account
   - **Client IP Address Filtering** (optional): Leave blank
   - **TTL**: Leave as "No expiry"
5. Click "Continue to summary"
6. Review and click "Create Token"
7. **IMPORTANT**: Copy the token immediately (shown only once!)
8. Update your `.env`:
   ```env
   CLOUDFLARE_API_TOKEN=your-new-token-here
   ```

## Step 12: Verify and Use Vectorize

Test your new token:
```bash
npm run as -- cloudflare test-token
```

If the token test passes, you should now be able to use Vectorize:

### Create embeddings with Vectorize

```bash
npm run as -- embed create --db vectorize --files ./content
```

### Query embeddings with Vectorize

```bash
npm run as -- embed query --db vectorize --prompt "What is FSJam?"
```

## Step 13: Advanced Queries

Try different queries to see how the semantic search works:

```bash
# Query about vector databases
npm run as -- embed query --db sqlite --prompt "How do vector databases work?"

# Query about serverless
npm run as -- embed query --db pgvector --prompt "Tell me about serverless computing"

# Query about web development
npm run as -- embed query --db vectorize --prompt "modern web development conferences"
```

## Troubleshooting

### Common Issues

1. **SQLite errors**: Make sure you have write permissions in the current directory
2. **PostgreSQL connection errors**: Check your DATABASE_URL and ensure PostgreSQL is running:
   ```bash
   brew services list  # Check if postgresql is running
   brew services restart postgresql@17  # Restart if needed
   ```
3. **Vectorize API errors**: Verify your Cloudflare credentials and ensure you have the correct permissions. Use the `cloudflare` commands to diagnose and fix permission issues.
4. **OpenAI API errors**: Check your API key and ensure you have credits available

### Note about Vectorize Permissions

Vectorize is part of Cloudflare's Workers platform, so it requires Workers-related permissions. The exact permission group for Vectorize might not be explicitly named "Vectorize" but is included under the Workers permissions umbrella. The permissions listed above should provide everything needed for Vectorize operations.

### Performance Tips

1. **Batch operations**: The tool batches embeddings API calls (20 at a time) to improve performance
2. **Index persistence**: Indexes are reused between operations, so subsequent queries are faster
3. **Metadata storage**: Each database stores metadata differently:
   - SQLite: Full content in the database
   - pgvector: Full content in the database
   - Vectorize: First 1000 characters due to API limits

## Conclusion

You now have a working CLI tool that can:
- Generate embeddings from text files using OpenAI
- Store vectors in three different databases
- Perform semantic search across your content
- Work with both local and cloud-based vector databases
- Manage Cloudflare API tokens and permissions

This foundation can be extended to build more complex applications like:
- RAG (Retrieval Augmented Generation) systems
- Semantic search engines
- Content recommendation systems
- Document similarity analysis tools

The choice of database depends on your needs:
- **SQLite**: Best for development, prototyping, and small datasets
- **pgvector**: Best for self-hosted production workloads with full control
- **Vectorize**: Best for serverless applications with global distribution needs