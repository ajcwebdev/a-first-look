![00-redwood-docker-cover](https://user-images.githubusercontent.com/12433465/149579072-0b9c912c-5209-419c-b8db-6e6d833e19c0.jpg)

[Docker Compose](https://docs.docker.com/compose/) is a tool for defining and running multi-container Docker applications. With Compose, you use a YAML file to configure your application’s services. You can create and start all your services with a single command.

This example containerizes Redwood's Web and API sides into individual containers that can be run with Docker Compose.

## Outline

* [Create Project](#create-project)
* [Set up API Side](#set-up-api-side)
  * [Configure CORS](#configure-cors)
  * [Set apiUrl](#set-apiurl)
  * [Prisma Schema](#prisma-schema)
  * [Add Database Environment Variables](#add-database-environment-variables)
  * [Apply Database Migration](#apply-database-migration)
* [Set up Web Side](#set-up-web-side)
  * [BlogPostsCell](#blogpostscell)
  * [HomePage](#homepage)
  * [Scaffold Admin Dashboard](#scaffold-admin-dashboard)
* [Set up Docker](#set-up-docker)
  * [dockerignore](#dockerignore)
  * [API Dockerfile](#api-dockerfile)
  * [Web Dockerfile](#web-dockerfile)
  * [Nginx Configuration](#nginx-configuration)
  * [Docker Compose File](#docker-compose-file)
  * [Build Images](#build-images)
  * [Test GraphQL Endpoint](#test-graphql-endpoint)
* [Publish to GitHub Container Registry](#publish-to-github-container-registry)
  * [Initialize Git](#initialize-git)
  * [Create a New Repository](#create-a-new-repository)
  * [Login to ghcr](#login-to-ghcr)
  * [Tag Images](#tag-images)
  * [Push to Registry](#push-to-registry)
  * [Pull from Registry](#pull-from-registry)

## Create Project

This example will start with a new Redwood project.

```bash
yarn create redwood-app redwood-docker-compose
cd redwood-docker-compose
```

Create the following files:
* Dockerfiles inside the `web` and `api` directories
* Nginx configuration file in `web` directory
* `docker-compose.yml` and `.dockerignore` files in the root of the project

```bash
touch web/Dockerfile api/Dockerfile web/nginx.conf \
  docker-compose.yml .dockerignore
```

## Set up API Side

To set up the API side we need to have CORS configured, an `apiUrl` specified, and a database migration applied to a production database.

### Configure CORS

Our backend and frontend will each be in their own containers, and possibly on entirely separate domains. To ensure the frontend can query the backend, we will set `origin` to `*` and `credentials` to `true` in the [`cors` option](https://redwoodjs.com/docs/graphql#cors-configuration) of our GraphQL handler.

```js
// api/src/functions/graphql.js

import { createGraphQLHandler } from '@redwoodjs/graphql-server'

import directives from 'src/directives/**/*.{js,ts}'
import sdls from 'src/graphql/**/*.sdl.{js,ts}'
import services from 'src/services/**/*.{js,ts}'

import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'

export const handler = createGraphQLHandler({
  loggerConfig: { logger, options: {} },
  directives,
  sdls,
  services,
  cors: {
    origin: '*',
    credentials: true,
  },
  onException: () => {
    db.$disconnect()
  },
})
```

### Set apiUrl

Inside `redwood.toml` set the `apiUrl` to `http://localhost:8911/api`. If you are deploying this to a service like Fly or Qovery, you will need to set this to the endpoint of your deployed GraphQL handler.

```toml
[web]
  title = "Redwood App"
  port = 8910
  apiUrl = "http://localhost:8911/api"
[api]
  port = 8911
[browser]
  open = true
```

### Prisma Schema

Our schema has the same `Post` model used in the [Redwood tutorial](https://learn.redwoodjs.com/docs/tutorial/getting-dynamic#creating-the-database-schema).

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  body      String
  createdAt DateTime @default(now())
}
```

### Add Database Environment Variables

Normally `.env` is contained in the root of your project, but as of now it will need to be contained inside your `api/db` folder due to Docker weirdness.

```bash
touch api/db/.env
rm -rf .env .env.defaults
```

Include `DATABASE_URL` in `api/db/.env`. See [this post](https://community.redwoodjs.com/t/setup-database-with-railway-cli/2025) for instructions on quickly setting up a remote database on Railway.

```
DATABASE_URL=postgresql://postgres:password@containers-us-west-10.railway.app:5513/railway
```

### Apply Database Migration

```bash
yarn rw prisma migrate dev --name posts
```

## Set up Web Side

Create a home page and generate a cell called `BlogPostsCell` to perform our data fetching.

```bash
yarn rw g page home /
yarn rw g cell BlogPosts
```

### BlogPostsCell

The query returns an array of `posts`, each of which has an `id`, `title`, `body`, and `createdAt` date.

```jsx
// web/src/components/BlogPostsCell/BlogPostsCell.js

export const QUERY = gql`
  query POSTS {
    posts {
      id
      title
      body
      createdAt
    }
  }
`

export const Loading = () => <div>Loading...</div>
export const Empty = () => <div>Empty</div>
export const Failure = ({ error }) => (
  <div style={{ color: 'red' }}>Error: {error.message}</div>
)

export const Success = ({ posts }) => {
  return posts.map((post) => (
    <article key={post.id}>
      <header>
        <h2>{post.title}</h2>
      </header>

      <p>{post.body}</p>
      <time>{post.createdAt}</time>
    </article>
  ))
}
```

### HomePage

Import the `BlogPostsCell` into `HomePage` and return a `<BlogPostsCell />` component.

```jsx
// web/src/pages/HomePage/HomePage.js

import BlogPostsCell from 'src/components/BlogPostsCell'
import { MetaTags } from '@redwoodjs/web'

const HomePage = () => {
  return (
    <>
      <MetaTags
        title="Home"
        description="This is the home page"
      />

      <h1>Redwood+Docker 🐳</h1>
      <BlogPostsCell />
    </>
  )
}

export default HomePage
```

### Scaffold Admin Dashboard

```bash
yarn rw g scaffold post
```

## Set up Docker

We will have two Dockerfiles, a `.dockerignore` file, an `nginx.conf` configuration file, and a `docker-compose.yml` file to stitch it all together.

### dockerignore

```
node_modules
```

### API Dockerfile

Our `Dockerfile` is using the [`node:14-alpine`](https://hub.docker.com/layers/simbo/node/14-alpine/images/sha256-a054e37f1ed6b2944060f68b0f52b94750d7f7a10444b13bb57a6c5cc58061aa) image. This may cause issues if you are on an M1 and want to build the image locally. Change `node:14-alpine` to `node:14` if you encounter this issue.

We set our working directory to `app` and copy either the `api` side or `web` side along with `.nvmrc`, `graphql.config.js`, `package.json`, `redwood.toml`, and `yarn.lock`.

```Dockerfile
FROM node:14-alpine

WORKDIR /app

COPY api api
COPY .nvmrc .
COPY graphql.config.js .
COPY package.json .
COPY redwood.toml .
COPY yarn.lock .

RUN yarn install --frozen-lockfile
RUN yarn add react react-dom --ignore-workspace-root-check
RUN yarn rw build api
RUN rm -rf ./api/src

WORKDIR /app/api

EXPOSE 8911

ENTRYPOINT [ "yarn", "rw", "serve", "api", "--port", "8911", "--rootPath", "/api" ]
```

### Web Dockerfile

```Dockerfile
FROM node:14-alpine as builder

WORKDIR /app

COPY web web
COPY .nvmrc .
COPY graphql.config.js .
COPY package.json .
COPY redwood.toml .
COPY yarn.lock .

RUN yarn install --frozen-lockfile
RUN yarn rw build web
RUN rm -rf ./web/src

FROM nginx as runner

COPY --from=builder /app/web/dist /usr/share/nginx/html
COPY web/nginx.conf /etc/nginx/conf.d/default.conf

RUN ls -lA /usr/share/nginx/html

EXPOSE 8910
```

### Nginx Configuration

Nginx is a web server that can also be used as a reverse proxy, load balancer, mail proxy or HTTP cache. Don't ask me to explain this code, but I promise it works.

```conf
server {
  listen 8910 default_server;
  root /usr/share/nginx/html;

  location ~* \.(?:css|js)$ {
    expires 1h;
    add_header Pragma public;
    add_header Cache-Control "public";
    access_log off;
  }

  location ~* \.(?:ico|gif|jpe?g|png)$ {
    expires 7d;
    add_header Pragma public;
    add_header Cache-Control "public";
    access_log off;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### Docker Compose File

We will have two services in our `docker-compose.yml` file: `web` and `api`. Each will have `ports` exposed and a `build` that is set to the root directory for the `context` along with the corresponding location for the Dockerfiles.

```yaml
version: "3.9"
services:
  web:
    build:
      context: .
      dockerfile: ./web/Dockerfile
    ports:
      - "8910:8910"
  api:
    build:
      context: .
      dockerfile: ./api/Dockerfile
    ports:
      - "8911:8911"
```

### Build Images

The `docker compose up` command aggregates the output of each container and builds, (re)creates, starts, and attaches to containers for a service.

```bash
docker compose up
```

Open `http://localhost:8910/posts` to create a test post and return to `http://localhost:8910/` to see the result.

![01-localhost-test](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/w78v3kz7aajet0wh5g50.png)

Check the image information with `docker images`.

```bash
docker images
```

Keep in mind that I am on an M1 so this image is much larger than it would be with the Alpine version of Node. To see different approaches to optimizing your container, see [Dockerize RedwoodJS](https://community.redwoodjs.com/t/dockerize-redwoodjs/2291) and [`redwoodjs-docker`](https://github.com/jeliasson/redwoodjs-docker).

```
REPOSITORY           TAG       IMAGE ID       CREATED          SIZE
redwood-docker_api   latest    243369952fa0   57 seconds ago   2.96GB
redwood-docker_web   latest    c1610495648c   42 minutes ago   137MB
```

See the specific running containers with `docker ps`.

```bash
docker ps
```

```
CONTAINER ID   IMAGE                COMMAND                  CREATED          STATUS          PORTS                            NAMES
a4d2a221278f   redwood-docker_web   "/docker-entrypoint.…"   35 seconds ago   Up 34 seconds   80/tcp, 0.0.0.0:8910->8910/tcp   redwood-docker-web-1
f5ab7bf289a9   redwood-docker_api   "yarn rw serve api -…"   35 seconds ago   Up 34 seconds   0.0.0.0:8911->8911/tcp           redwood-docker-api-1
```

### Test GraphQL Endpoint

Hit [localhost:8911/api/graphql](https://localhost:8911/api/graphql) with your favorite API tool or curl. Send a query to the [root schema](https://redwoodjs.com/docs/graphql#the-root-schema) asking for the current version.

```bash
curl \
  --request POST \
  --header 'content-type: application/json' \
  --url 'http://localhost:8911/api/graphql' \
  --data '{"query":"{ redwood { version } }"}'
```

```json
{
  "data":{
    "redwood":{
      "version":"0.41.0"
    }
  }
}
```

Send another query for the `title` and `body` of the `posts` in the database.

```bash
curl \
  --request POST \
  --header 'content-type: application/json' \
  --url 'http://localhost:8911/api/graphql' \
  --data '{"query":"{ posts { title body } }"}'
```

```json
{
  "data":{
    "posts":[
      {
        "title":"Docker Compose",
        "body":"How to compose a Redwood app"
      }
    ]
  }
}
```

## Publish to GitHub Container Registry

[GitHub Packages](https://docs.github.com/en/packages/learn-github-packages/introduction-to-github-packages) is a platform for hosting and managing packages that combines your source code and packages in one place including containers and other dependencies. You can integrate GitHub Packages with GitHub APIs, GitHub Actions, and webhooks to create an end-to-end DevOps workflow that includes your code, CI, and deployment solutions.

GitHub Packages offers different package registries for commonly used package managers, such as npm, RubyGems, Maven, Gradle, and Docker. GitHub's [Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry) is optimized for containers and supports Docker and OCI images. To publish our images to the GitHub Container Registry, we need to first push our project to a GitHub repository.

### Initialize Git

```bash
git init
git add .
git commit -m "I can barely contain my excitement"
```

### Create a New Repository

You can create a blank repository by visiting [repo.new](https://repo.new) or using the [`gh repo create`](https://cli.github.com/manual/gh_repo_create) command with the [GitHub CLI](https://cli.github.com/). Enter the following command to create a new repository, set the remote name from the current directory, and push the project to the newly created repository.

```bash
gh repo create redwood-docker-compose \
  --public \
  --source=. \
  --remote=upstream \
  --push
```

If you created a repository from the GitHub website instead of the CLI then you will need to set the remote and push the project with the following commands.

```bash
git remote add origin https://github.com/YOUR_USERNAME/redwood-docker-compose.git
git push -u origin main
```

### Login to ghcr

To login, create a [PAT (personal access token)](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#authenticating-to-the-container-registry) and include it instead of `xxxx`.

```bash
export CR_PAT=xxxx
```

Login with your own username in place of `YOUR_USERNAME`.

```bash
echo $CR_PAT | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

### Tag Images

Docker tags are mutable named references for pulling and running images, similar to branch refs in Git.

```bash
docker tag redwood-docker-compose_web ghcr.io/YOUR_USERNAME/redwood-docker-compose_web
docker tag redwood-docker-compose_api ghcr.io/YOUR_USERNAME/redwood-docker-compose_api
```

### Push to Registry

Once you have tagged your image, you can push and pull the images much like you would push or pull a Git repository.

```bash
docker push ghcr.io/YOUR_USERNAME/redwood-docker-compose_web:latest
docker push ghcr.io/YOUR_USERNAME/redwood-docker-compose_api:latest
```

### Pull from Registry

To test that our project has a docker image published to a public registry, pull it from your local development environment.

```bash
docker pull ghcr.io/YOUR_USERNAME/redwood-docker-compose_web:latest
docker pull ghcr.io/YOUR_USERNAME/redwood-docker-compose_api:latest
```
