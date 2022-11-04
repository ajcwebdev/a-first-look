## (Optional) Install Grafbase CLI Globally

The `grafbase` CLI can be installed globally with `cargo` by running `cargo install grafbase` and it can also be globally installed with `npm` or `yarn`.

```bash
cargo install grafbase
# npm i -g grafbase
# yarn global add grafbase
```

## Create Project

However, if you do not wish to install the CLI onto your machine, it can still be invoked with `pnpx` or `npx`.

### Initialize Grafbase Schema

These commands will both fetch from the registry without installing the package as a dependency. Generate a new project called `ajcwebdev-grafbase-js` with the `grafbase init` command.

```bash
pnpx grafbase init ajcwebdev-grafbase-js
# npx grafbase init ajcwebdev-grafbase-js
```

This creates a `grafbase` directory containing a placeholder schema in a file called `schema.graphql`.

```
✨ "ajcwebdev-grafbase-js" was successfully created!

the schema for your new project can be found at
./ajcwebdev-grafbase-js/grafbase/schema.graphql
```

Navigate into the directory and initialize a `package.json`.

```bash
cd ajcwebdev-grafbase-js
pnpm init # npm init -y | yarn init -y
```

In this example, we'll install `grafbase` as a project dependency and use `pnpm` to run the commands.

```bash
pnpm add -D grafbase dotenv isomorphic-fetch vite vercel # npm i -D | yarn add -D
```

### Configure Package

Set `type` to `module` to enable ESM imports and create two scripts.
- A `query` script set to `node index.js`
- A `dev` script set to `vite`

```json
{
  "name": "ajcwebdev-grafbase-js",
  "version": "1.0.0",
  "description": "An example Grafbase project with the JavaScript Fetch API and Vite",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "query": "node index.js",
    "dev": "vite"
  },
  "keywords": [ "GraphQL" ],
  "author": "FIRST_NAME LAST_NAME",
  "license": "MIT",
  "devDependencies": {
    "dotenv": "^16.0.2",
    "grafbase": "^0.7.0",
    "isomorphic-fetch": "^3.0.0",
    "vite": "^3.1.2"
  }
}
```

Create the following three files:
- `index.js` for our JavaScript fetch request
- `index.html` for displaying the results of the fetch request
- `.env` for our environment variables
- `.gitignore` to prevent committing our `node_modules` or secret API keys

```bash
echo > index.js
echo > index.html
echo 'VITE_API_KEY=\nVITE_ENDPOINT=' >> .env
echo 'node_modules\n.env\n.DS_Store' >> .gitignore
```

### Start Development Server

```bash
pnpm grafbase dev
```

```
📡 listening on port 4000

- playground: http://127.0.0.1:4000
- endpoint:   http://127.0.0.1:4000/graphql
```

Open [localhost:4000](http://localhost:4000) to see the GraphiQL playground.

## Query and Mutate Todos with GraphiQL Playground

We do not have any todos yet, so we must create some todos to give ourselves some things to do.

### Create a Todo

Create a `todo` object with the `todoCreate` mutation:

```graphql
mutation CREATE_TODO {
  todoCreate(
    input: {
      title: "Do the thing", complete: false
    }
  ) {
    todo {
      id
    }
  }
}
```

Output:

```json
{
  "data": {
    "todoCreate": {
      "todo": {
        "id": "todo_01GD5AZSBV32AM61YTENA313H7"
      }
    }
  }
}
```

### Query Todo by ID

Fetch the same `todo` by using its `id` as input to the `todo` query. with the `todoCollection` query.

```graphql
query GET_TODO {
  todo(id: "SET_ID") {
    id
    title
    complete
  }
}
```

Output:

```json
{
  "data": {
    "todo": {
      "id": "todo_01GD5AZSBV32AM61YTENA313H7",
      "title": "Do the thing",
      "complete": false
    }
  }
}
```

### Update Todo by ID

To mark the `todo` as `complete`, use the `todoUpdate` mutation. Include the same `id` but a new `input` with `complete` set to `true` instead of `false`.

```graphql
mutation UPDATE_TODO {
  todoUpdate(
    id: "SET_ID",
    input: {
      title: "The thing is done", complete: true
    }
  ) {
    todo {
      id
    }
  }
}
```

```json
{
  "data": {
    "todoUpdate": {
      "todo": {
        "id": "todo_01GD5AZSBV32AM61YTENA313H7"
      }
    }
  }
}
```

### Query Todos

To verify the update succeeded, query the first three `todo` objects with the `todoCollection` query.

```graphql
query GET_TODOS {
  todoCollection(first: 3) {
    edges {
      node {
        id
        title
        complete
      }
    }
  }
}
```

```json
{
  "data": {
    "todoCollection": {
      "edges": [
        {
          "node": {
            "id": "todo_01GD5AZSBV32AM61YTENA313H7",
            "title": "The thing is done",
            "complete": true
          }
        }
      ]
    }
  }
}
```

### Delete a Todo by ID

Delete the `todo` by passing its `id` into the `todoDelete` mutation.

```graphql
mutation DELETE_TODO {
  todoDelete(
    id: "SET_ID"
  ) {
    deletedId
  }
}
```

```json
{
  "data": {
    "todoDelete": {
      "deletedId": "todo_01GD5AZSBV32AM61YTENA313H7"
    }
  }
}
```

### Query with cURL Commands

You can also send a cURL request instead of using the playground. Query again for the `todoCollection` to verify the list is empty.

``` bash
curl "http://127.0.0.1:4000/graphql" \
  -H "content-type: application/json" \
  -d '{
    "query":"{todoCollection(first: 3) {edges {node {title complete}}}}"
  }'
```

```json
{
  "data": {
    "todoCollection": {
      "edges": []
    }
  }
}
```

<img width="1306" alt="01-dashboard-no-projects-yet" src="https://user-images.githubusercontent.com/12433465/190971552-51b4f215-cc0b-46d9-9afe-4214c275fc44.png">

<img width="1306" alt="02-deploy-todo-template" src="https://user-images.githubusercontent.com/12433465/190971555-d374e78b-131c-4174-a9d9-6c7a93694146.png">

<img width="1317" alt="03-ajcwebdev-grafbase-production-deployment" src="https://user-images.githubusercontent.com/12433465/190971557-2606de91-c5f6-488d-8b0a-4371f5bf3b12.png">

<img width="1068" alt="05-create-todo" src="https://user-images.githubusercontent.com/12433465/190971561-2e6a4276-29d3-4452-a94a-600dae43ffe1.png">

## Fetch with Node

Use the JavaScript Fetch API to query your endpoint.

```js
// index.js

import "dotenv/config"
import pkg from "isomorphic-fetch"
const fetch = pkg

const { ENDPOINT, API_KEY } = process.env

fetch(ENDPOINT, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-api-key": API_KEY
  },
  body: JSON.stringify({
    query: `{
      todoCollection(first: 3) {
        edges {
          node {
            title
            complete
          }
        }
      }
    }`
  })
})
.then(async (data) => {
  console.log(
    JSON.stringify(await data.json(), null, 2)
  )
})
```

```bash
pnpm query
```

```json
{
  "data":{
    "todoCollection":{
      "edges":[
        {
          "node":{
            "title":"Do another thing",
            "complete":false
          }
        },
        {
          "node":{
            "title":"Do the thing",
            "complete":false
          }
        }
      ]
    }
  }
}
```

## Add Client Side

```html
<!-- index.html -->

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />
    <title>A First Look at Grafbase</title>
  </head>

  <body>
    <div id="app"></div>
    <script type="module" src="/index.js"></script>
  </body>
</html>
```

```js
// index.js

import pkg from "isomorphic-fetch"
const fetch = pkg

const { VITE_ENDPOINT, VITE_API_KEY } = import.meta.env

fetch(VITE_ENDPOINT, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-api-key": VITE_API_KEY
  },
  body: JSON.stringify({
    query: `{
      todoCollection(first: 3) {
        edges {
          node {
            title
            complete
          }
        }
      }
    }`
  })
})
.then(async (data) => {
  document.querySelector('#app').innerHTML = `
    <div>${JSON.stringify(await data.json())}</div>
  `
})
```

```bash
pnpm dev
```
