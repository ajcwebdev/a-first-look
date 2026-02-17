# ajc-iac

A Todo List application with support for both local filesystem and S3-compatible object storage.

## Storage Backends

The application automatically selects the storage backend based on environment variables:

- **Local Filesystem (default)**: Stores todos in `./storage/todos.json`
- **S3-Compatible Storage**: Stores todos in an S3 bucket when credentials are provided

### Using Local Storage

No configuration needed. Just run the application and it will use local filesystem storage.

### Using S3 Storage

Set the following environment variables to use S3-compatible storage:
```bash
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name
S3_ENDPOINT=https://s3.us-east-1.amazonaws.com
S3_REGION=us-east-1
```

The application supports various S3-compatible services:
- AWS S3
- Cloudflare R2
- DigitalOcean Spaces
- MinIO
- Any other S3-compatible storage

#### Example S3 Endpoints

**AWS S3:**
```bash
S3_ENDPOINT=https://s3.us-east-1.amazonaws.com
S3_REGION=us-east-1
```

**Cloudflare R2:**
```bash
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
```

**DigitalOcean Spaces:**
```bash
S3_ENDPOINT=https://<region>.digitaloceanspaces.com
```

**MinIO:**
```bash
S3_ENDPOINT=http://localhost:9000
```

## Setup

### Build Docker Image
```bash
bun run docker:build
```

### Run Container
```bash
bun run docker:run
```

The application runs on `http://localhost:3000`

When using local storage, todos are stored in `./storage/todos.json` mounted as a volume.

### Development
```bash
bun install
bun run dev
```

## API Reference

### List Todos
```
GET /api/todos?action=list
```

### Create Todo
```
POST /api/todos?action=create
Content-Type: application/json

{
  "text": "Todo text"
}
```

### Update Todo
```
PUT /api/todos?action=update&id=TODO_ID
Content-Type: application/json

{
  "text": "Updated text",
  "completed": true
}
```

### Delete Todo
```
DELETE /api/todos?action=delete&id=TODO_ID
```