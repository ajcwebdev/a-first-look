# autoshow-rag

A CLI tool for creating and querying vector embeddings using sql-vec, pgvector, and Cloudflare's Vectorize.

## Prerequisites

- Node.js 16.17.0 or later
- OpenAI API key for generating embeddings
- For pgvector: PostgreSQL with pgvector extension
- For Vectorize: Cloudflare account with API token

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file with your credentials:

```
OPENAI_API_KEY=your-openai-api-key
DATABASE_URL=postgresql://user:password@localhost/embeddings
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
```

## Usage

### Create embeddings from files

```bash
# SQLite with sql-vec
npm run as -- embed create --db sqlite --files ./content

# PostgreSQL with pgvector
npm run as -- embed create --db pgvector --files ./content

# Cloudflare Vectorize
npm run as -- embed create --db vectorize --files ./content
```

### Query embeddings

```bash
# SQLite
npm run as -- embed query --db sqlite --prompt "What is FSJam?"

# PostgreSQL
npm run as -- embed query --db pgvector --prompt "What is FSJam?"

# Cloudflare Vectorize
npm run as -- embed query --db vectorize --prompt "What is FSJam?"
```

## Database Details

### SQLite (sql-vec)
- Local file-based storage
- Uses `sqlite-vec` extension for vector operations
- Good for development and small datasets

### PostgreSQL (pgvector)
- Requires PostgreSQL with pgvector extension installed
- Scalable for larger datasets
- Connection string via DATABASE_URL environment variable

### Cloudflare Vectorize
- Fully managed vector database
- Global distribution
- Requires Cloudflare account and API credentials
- Supports up to 5 million vectors per index

## File Support

The tool processes:
- `.txt` files
- `.md` (Markdown) files

All files in the specified directory and subdirectories will be processed.
```

Now you have a complete CLI that supports all three vector databases:

1. **SQLite with sql-vec** - Local development and testing
2. **PostgreSQL with pgvector** - Self-hosted production workloads  
3. **Cloudflare Vectorize** - Fully managed, globally distributed vector database

Each implementation handles:
- Creating/checking indexes with proper dimensions (1536 for OpenAI embeddings)
- Inserting documents with embeddings and metadata
- Querying for similar vectors using cosine similarity
- Proper cleanup and error handling

The Vectorize implementation uses Cloudflare's HTTP API and includes:
- Automatic index creation if it doesn't exist
- NDJSON format for bulk inserts
- Metadata storage for filenames and content snippets
- Proper authentication with API tokens
- Waiting for asynchronous operations to complete

To use it, make sure you have the required environment variables set and run the commands as shown in the README.