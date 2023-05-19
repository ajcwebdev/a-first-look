# Example Project from [Deploy a GraphQL Server with Docker and Fly](https://ajcwebdev.com/deploy-a-graphql-server-with-docker-and-fly)

[Express GraphQL](https://github.com/graphql/express-graphql/) is a library for building production ready GraphQL HTTP middleware. Despite the emphasis on Express in the repo name, you can create a GraphQL HTTP server with any HTTP web framework that supports connect styled middleware. This includes [Connect](https://github.com/senchalabs/connect) itself, [Express](https://expressjs.com) and [Restify](http://restify.com/).

[Docker](https://www.docker.com/) is a set of tools that use OS-level virtualization to deliver software in isolated packages called containers. Containers bundle their own software, libraries and configuration files. [Fly](https://fly.io/) is a platform for full stack applications and databases that need to run globally. You can run arbitrary Docker containers and host popular databases like Postgres.

## Outline

- GraphQL Express Server
  - Run Local Server and Execute Test Query
- Dockerfile
- Docker Compose
  - Create and Start Containers with Docker Compose
- Deploy to Fly
  - Install and Authenticate Fly CLI
  - Launch App on Fly
  - Deploy Fly Application

## GraphQL Express Server

`graphqlHTTP` accepts a wide range of options, some of the most common include:

- **`schema`** - A `GraphQLSchema` instance from `GraphQL.js`
- **`rootValue`** - A value to pass as the `rootValue` to the `execute()` function
- **`graphiql`** - If passed `true` or an options object it will present GraphiQL when the GraphQL endpoint is loaded in a browser
- **`headerEditorEnabled`** - Optional boolean which enables the header editor when `true`

```js
// index.js

const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')

const schema = buildSchema(`
  type Query { hello: String }
`)

const rootValue = {
  hello: () => 'Hello from Express GraphQL!'
}

const app = express()

app.use('/graphql',
  graphqlHTTP({
    schema,
    rootValue,
    graphiql: { headerEditorEnabled: true },
  }),
)

const port = process.env.PORT || 8080

app.listen(port, () => {
  console.log(`Express GraphQL server running on http://localhost:${port}/graphql`)
})
```

### Run Local Server and Execute Test Query

```bash
node index
```

`express-graphql` will accept requests with the parameters:

- **`query`** - A string GraphQL document to be executed
- **`variables`** - The runtime values to use for any GraphQL query variables as a JSON object
- **`operationName`** - Specifies which operation should be executed if the provided `query` contains multiple named operations

```graphql
query HELLO_QUERY { hello }
```

![01-express-graphql-hello-localhost-8080](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/6tb9ltduj8k6lfiwwwb9.png)

```bash
curl 'http://localhost:8080/graphql' \
  --header 'content-type: application/json' \
  --data '{"query":"{ hello }"}'
```

## Dockerfile

A [`Dockerfile`](https://docs.docker.com/engine/reference/builder/) is a text document that contains all the commands a user could call on the command line to assemble an image.

```dockerfile
FROM node:14-alpine
LABEL org.opencontainers.image.source https://github.com/ajcwebdev/ajcwebdev-express-graphql-docker
WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn
COPY . ./
EXPOSE 8080
CMD [ "node", "index" ]
```

`docker build` creates an automated build that executes several command-line instructions in succession.

## Docker Compose

[Compose](https://docs.docker.com/compose/) is a tool for defining and running multi-container Docker applications. Your application’s services are configured with a YAML file called `docker-compose.yml`.

```yaml
version: "3.9"
services:
  web:
    build: .
    ports:
      - "49160:8080"
```

### Create and Start Containers with Docker Compose

`docker compose up` aggregates the output of each container. It builds, (re)creates, starts, and attaches to containers for a service.

```bash
docker compose up
```

Docker mapped the `8080` port inside of the container to the port `49160` on your machine. Open [localhost:49160/graphql](http://localhost:49160/graphql) and send a hello query.

```graphql
query HELLO_QUERY { hello }
```

![02-localhost-49160-graphql](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/bpim4bg6oi7z09r4w3hw.png)

```bash
curl 'http://localhost:49160/graphql' \
  --header 'content-type: application/json' \
  --data '{"query":"{ hello }"}'
```

## Deploy to Fly

### Install and Authenticate Fly CLI

You can download the CLI on [Mac, Linux, or Windows](https://fly.io/docs/getting-started/installing-flyctl/).

```bash
brew install superfly/tap/flyctl
```

If you already have an account you can login with `flyctl auth login`.

```bash
flyctl auth login
```

If you are a new user you can create an account with `flyctl auth signup`.

```bash
flyctl auth signup
```

You will be prompted for credit card payment information, required for charges outside the free plan on Fly. See [Pricing](https://fly.io/docs/about/pricing) for more details.

### Launch App on Fly

Run `flyctl launch` in the directory with your source code to configure your app for deployment. This will create and configure a fly app by inspecting your source code and prompting you to deploy.

```bash
fly launch --name ajcwebdev-express-graphql
```

This creates a `fly.toml` file.

```toml
app = "ajcwebdev-express-graphql"

kill_signal = "SIGINT"
kill_timeout = 5
processes = []

[env]

[experimental]
  allowed_public_ports = []
  auto_rollback = true

[[services]]
  http_checks = []
  internal_port = 8080
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

  [services.concurrency]
    hard_limit = 25
    soft_limit = 20
    type = "connections"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.tcp_checks]]
    grace_period = "1s"
    interval = "15s"
    restart_limit = 0
    timeout = "2s"
```

Add the following `PORT` number under `env`.

```toml
[env]
  PORT = 8080
```

### Deploy Fly Application

```bash
flyctl deploy
```

Status includes application details, tasks, most recent deployment details and in which regions it is currently allocated.

```bash
flyctl status
```

Visit [ajcwebdev-express-graphql.fly.dev/graphql](https://ajcwebdev-express-graphql.fly.dev/graphql) to see the site and run a test query.

```graphql
query HELLO_QUERY { hello }
```

![03-ajcwebdev-express-graphql-fly-dev-hello](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/e7ab8m96y7j8frtxnwg8.png)

```bash
curl 'https://ajcwebdev-express-graphql.fly.dev/graphql' \
  --header 'content-type: application/json' \
  --data '{"query":"{ hello }"}'
```