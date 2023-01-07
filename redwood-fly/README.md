# Deploying Redwood with Docker on Fly

Huge thanks to [Joshua Sierles](https://twitter.com/jsierles) for doing the majority of the heavy lifting here.

### NOTE: This will not be the end state of deploying Redwood apps to Fly. We are still optimizing the build and there will be a `yarn rw deploy fly` command to set this up automatically. However, if you want to start spiking something out now, you can follow these steps manually.

> **WARNING:** RedwoodJS software has not reached a stable version 1.0 and should not be considered suitable for production use. In the "make it work; make it right; make it fast" paradigm, Redwood is in the later stages of the "make it work" phase.

## Getting Started

- [Tutorial](https://redwoodjs.com/tutorial/welcome-to-redwood): getting started and complete overview guide.
- [Docs](https://redwoodjs.com/docs/introduction): using the Redwood Router, handling assets and files, list of command-line tools, and more.
- [Redwood Community](https://community.redwoodjs.com): get help, share tips and tricks, and collaborate on everything about RedwoodJS.

### Setup

We use Yarn as our package manager. To get the dependencies installed, do this in the root directory:

```terminal
yarn
```

## Fly Setup

Normally `.env` is contained in the root of your project, but as of now it will need to be contained inside your `api/db` folder due to Docker weirdness.

```bash
touch api/db/.env
rm -rf .env .env.defaults
```

### Include `DATABASE_URL` in `api/db/.env`

See [this post](https://community.redwoodjs.com/t/setup-database-with-railway-cli/2025) for instructions on quickly setting up a remote database on Railway.

```
DATABASE_URL=postgresql://postgres:password@containers-us-west-10.railway.app:5513/railway
```

### Run migrations and start development server

```bash
yarn rw prisma migrate dev
yarn rw dev
```

Open `http://localhost:8910/posts` to create a test post and return to `http://localhost:8910/` to see the result.

![01-localhost-test](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/evpn14ja5ffoov2blsem.png)

### Dockerfile

```Dockerfile
FROM node:14-alpine as base

WORKDIR /app

COPY package.json package.json
COPY web/package.json web/package.json
COPY api/package.json api/package.json
COPY yarn.lock yarn.lock
RUN yarn install --frozen-lockfile

COPY redwood.toml .
COPY graphql.config.js .
COPY babel.config.js .

FROM base as web_build

COPY web web
RUN yarn rw build web

FROM base as api_build

COPY api api
RUN yarn rw build api

FROM node:14-alpine

WORKDIR /app

COPY api/package.json .

RUN yarn install && yarn add react react-dom @redwoodjs/cli

COPY graphql.config.js .
COPY redwood.toml .
COPY api api

COPY --from=web_build /app/web/dist /app/web/dist
COPY --from=api_build /app/api/dist /app/api/dist
COPY --from=api_build /app/node_modules/.prisma /app/node_modules/.prisma

EXPOSE 8911

CMD [ "yarn", "rw", "serve", "api", "--port", "8911", "--rootPath", "/api" ]
```

### `.dockerignore`

```
node_modules
```

### `fly.toml`

```toml
app = "redwood-fly"

kill_signal = "SIGINT"
kill_timeout = 5
processes = []

[deploy]
  release_command = "yarn rw prisma migrate deploy"

[[statics]]
  guest_path = "/app/web/dist"
  url_prefix = "/"

[experimental]
  allowed_public_ports = []
  auto_rollback = true

[[services]]
  http_checks = []
  internal_port = 8911
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

[services.concurrency]
  hard_limit = 25
  soft_limit = 20
  type = "connections"

[[services.ports]]
  handlers = ["http"]
  port = 80

[[services.ports]]
  handlers = ["tls", "http"]
  port = 443

[[services.tcp_checks]]
  grace_period = "1s"
  interval = "15s"
  restart_limit = 6
  timeout = "2s"
```

### `redwood.toml`

Inside `redwood.toml` set the `apiProxyPath` to the following with the name of your project instead of `redwood-fly` and make sure `esbuild` is set to `true`.

```toml
[web]
  title = "Redwood App"
  port = 8910
  apiProxyPath = "https://redwood-fly.fly.dev/api/graphql"
  includeEnvironmentVariables = []
[api]
  port = 8911
[browser]
  open = true
[experimental]
  esbuild = true
  useEnvelop = false
```

### Deploy to Fly

`fly launch` will open an interactive terminal session.

```bash
fly launch --name redwood-fly
```

Answer **Yes** to copy your configuration to the new app, select a region close to you, and select **No** to the question about deploying now.

```
An existing fly.toml file was found for app redwood-fly
? Would you like to copy its configuration to the new app? Yes
Creating app in /Users/ajcwebdev/redwood-fly
Scanning source code
Detected Dockerfile app
Automatically selected personal organization: Anthony Campolo
? Select region: sjc (Sunnyvale, California (US))
Created app redwood-fly in organization personal
Wrote config file fly.toml
Your app is ready. Deploy with `flyctl deploy`
? Would you like to deploy now? No
```

Run `fly scale` to scale your memory to ensure you have a large enough VM.

```bash
fly scale vm shared-cpu-1x --memory 2048
```

If you are on an M1 you will likely run into issues. You can add the `--remote-only` flag to build the Docker image with Fly's remote builder to avoid this issue and also speed up your build time.

```bash
fly deploy --remote-only
```

If all went according to plan you will see the following message:

```
Monitoring Deployment

1 desired, 1 placed, 1 healthy, 0 unhealthy [health checks: 1 total, 1 passing]
--> v1 deployed successfully
```

![02-redwood-fly-deployed](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/w2snknghxnslppwxvq5l.png)

Live example - https://redwood-fly.fly.dev/

## Test your endpoint

### Warning: As of Redwood v0.36.x, Redwood's API is [open by default](https://redwoodjs.com/docs/services#secure-services) unless you specify an [environment variable for secure services](https://redwoodjs.com/docs/services#enabling-secure-services). This will be changing very soon in one of the upcoming minor releases before the v1 release candidate. If you follow this tutorial as is, your endpoint will be [trollable](https://en.wiktionary.org/wiki/trollable).

Hit [https://redwood-fly.fly.dev/api/graphql](https://redwood-fly.fly.dev/api/graphql) with your favorite API tool or curl.

### Check Redwood Version

```graphql
query REDWOOD_VERSION {
  redwood {
    version
  }
}
```

Output:

```json
{
  "data": {
    "redwood": {
      "version": "0.36.4"
    }
  }
}
```

### Query for all posts

```graphql
query POSTS {
  posts {
    id
    title
    body
    createdAt
  }
}
```

Output:

```json
{
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "This is a post",
        "body": "Yeah it is",
        "createdAt": "2021-09-09T20:10:58.985Z"
      }
    ]
  }
}
```

### Create a post

```graphql
mutation CREATE_POST_MUTATION {
  createPost(
    input: {
      title:"this is a title",
      body:"this is a body"
    }
  ) {
    id
    title
    body
    createdAt
  }
}
```

Output:

```json
{
  "data": {
    "createPost": {
      "id": 2,
      "title": "this is a title",
      "body": "this is a body",
      "createdAt": "2021-09-20T02:00:24.899Z"
    }
  }
}
```

### Delete a post

```graphql
mutation DELETE_POST_MUTATION {
  deletePost(
    id: 2
  ) {
    id
    title
    body
    createdAt
  }
}
```

Output:

```json
{
  "data": {
    "deletePost": {
      "id": 2,
      "title": "this is a title",
      "body": "this is a body",
      "createdAt": "2021-09-20T02:00:24.899Z"
    }
  }
}
```
