# Example Project from [A First Look at create-t3-app](https://ajcwebdev.com/2022/08/13/a-first-look-at-create-t3-app/)

[`create-t3-app`](https://create.t3.gg/) is a fullstack React framework and CLI that has emerged as an evolution of the T3 stack recommended on Theo Browne's website [`init.tips`](https://init.tips/). It's described by its creators as "kind of a template," which is meant to stress that it is ["NOT a template"](https://twitter.com/t3dotgg/status/1544394504685645824).

## Clone Repo and Navigate to Project

```bash
git clone https://github.com/ajcwebdev/a-first-look.git
cd backend/t3
```

## Install Dependencies and Setup Database

Install dependencies with `pnpm` and create a new `.env` file from the example provided:

```bash
pnpm i
cp .env.example .env
```

I recommend using a Postgres database and connection string for the `DATABASE_URL` variable in `.env`. There are two easy ways to accomplish this with Railway.

### Railway CLI

If you have the Railway CLI installed you can run the following set of commands:

```bash
railway login # or railway login --browserless
railway init
railway add
echo DATABASE_URL=`railway variables get DATABASE_URL` > .env
```

### Railway Dashboard

Alternatively, go to [dev.new](https://dev.new) and click Provision PostgreSQL database and find the connection string under the Connect tab in the dashboard.

### Run Database Migrations

```bash
pnpm prisma migrate dev --name init
pnpm prisma generate
```

## Start Development Server

```bash
pnpm dev
```

## Deploy to Vercel

```bash
pnpm vercel --env DATABASE_URL=YOUR_DATABASE_URL_HERE
```

## Add GraphQL Cause Why Not

If you're starting a new t3 app from scratch, run `pnpm add @graphql-yoga/node graphql` and create a file called `graphql.ts` in `src/pages/api/`.

```ts
// src/pages/api/graphql.ts

import { createServer } from '@graphql-yoga/node'

const typeDefs = /* GraphQL */ `
  type Query {
    users: [User!]!
  }
  type User {
    name: String
  }
`

const resolvers = {
  Query: {
    users() {
      return [{ name: 'nexxel' }]
    },
  },
}

const server = createServer({
  schema: {
    typeDefs,
    resolvers,
  },
  endpoint: '/api/graphql',
  // graphiql: false // uncomment to disable GraphiQL
})

export default server
```

Start the development server and open [localhost:3000/api/graphql](http://localhost:3000/api/graphql). Run the following query:

```graphql
query GET_USERS {
  users {
    name
  }
}
```

<img width="1422" alt="Screenshot of GraphQL Yoga's GraphiQL Explorer with a GET_USERS query executing and returning a JSON object with a user named Nexxel" src="https://user-images.githubusercontent.com/12433465/189302935-e4b0e06c-223c-4a57-b3f5-cb442d0257d0.png">

Alternatively, you can query the API directly with cURL:

```bash
curl 'http://localhost:3000/api/graphql' \
  --header 'content-type: application/json' \
  --data '{"query":"{ users { name } }"}'
```

This should return the following response:

```json
{
  "data":{
    "users":[{
      "name":"nexxel"
    }]
  }
}
```