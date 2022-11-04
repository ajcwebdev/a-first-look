# a first look at solid

## Outline

* Create Project Structure
  * Vite Configuration
  * HTML Entry Point
  * Render Function
  * Start Development Server
  * Components
  * Styling
  * Create Signal
  * Create Effect
  * Create Resource
* Deploy
  * Netlify
  * Vercel
  * Cloudflare Pages
  * Edgio
* Solid Start
  * Client and Server Entry
  * Root
  * Solid Start Todos Route
  * Solid Start Todo Data
  * Todo CSS
* Solid Start Deploy
  * Netlify
  * Vercel

## Create Project Structure

```bash
mkdir ajcwebdev-solid
cd ajcwebdev-solid
pnpm init
pnpm add -D solid-js \
  @solidjs/meta @solidjs/router \
  solid-start solid-start-node \
  vite vite-plugin-solid undici \
  vercel netlify-cli wrangler @layer0/cli \
  @babel/core typescript webpack
echo 'node_modules\ndist\n.DS_Store\n.netlify\nnetlify\n.vercel\n.layer0\n.solid\n.env\npackage-lock.json' > .gitignore
```

Add `vite` scripts to `package.json`.

```json
{
  "name": "ajcwebdev-solid",
  "version": "1.0.0",
  "description": "An example SolidJS application deployed on Netlify, Vercel, Cloudflare Pages, and Edgio",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "serve": "vite preview"
  },
  "keywords": [ "SolidJS", "Netlify", "Vercel", "Cloudflare", "Edgio" ],
  "author": "FIRST_NAME LAST_NAME",
  "license": "MIT",
  "devDependencies": {
    "@solidjs/meta": "^0.28.0",
    "@solidjs/router": "^0.4.3",
    "netlify-cli": "^11.8.2",
    "solid-js": "^1.5.5",
    "solid-start": "0.1.0-alpha.104",
    "solid-start-node": "0.1.0-alpha.104",
    "undici": "^5.10.0",
    "vercel": "^28.4.1",
    "vite": "^3.1.3",
    "vite-plugin-solid": "^2.3.6",
    "wrangler": "^2.1.6"
  }
}
```

### Vite Configuration

Create a `vite.config.js` file. This will allow us to define our Vite Configuration with the Solid Plugin.

```bash
echo > vite.config.js
```

Import `solidPlugin` from `vite-plugin-solid` and add it to the `plugins` array inside Vite's `defineConfig` helper.

```js
// vite.config.js

import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"

export default defineConfig({
  plugins: [solidPlugin()]
})
```

### HTML Entry Point

Create an `index.html` file for our HTML entry point.

```bash
echo > index.html
```

The root Solid component will be imported as an ESM module from `/src/root.jsx` and set to the `src` attribute on `script`.

```html
<!-- index.html -->

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <title>A First Look at Solid</title>
  </head>
  
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script src="/src/root.jsx" type="module"></script>
  </body>
</html>
```

### Render Function

```bash
mkdir src
echo > src/root.jsx
```

```jsx
// src/root.jsx

/* @refresh reload */
import { render } from "solid-js/web"

function App() {
  return (
    <div>
      <header>
        <h1>A First Look at Solid</h1>
        <a
          href="https://github.com/solidjs/solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Solid
        </a>
      </header>
    </div>
  )
}

render(
  () => <App />,
  document.getElementById('root')
)
```

### Start Development Server

```bash
pnpm dev # or npm run dev | yarn dev
```

Open [localhost:5173](http://localhost:5173) to view the running application in your browser. The page will reload if you make edits.

![01-solid-home-page-on-localhost-5173](./screenshots/01-solid-home-page-on-localhost-5173.png)

### Components

```bash
mkdir src/routes
echo > src/routes/index.jsx
```

```jsx
// src/routes/index.jsx

export default function App() {
  return (
    <div class="App">
      <header class="header">
        <h1>A First Look at Solid</h1>
        <a
          class="link"
          href="https://github.com/solidjs/solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Solid
        </a>
      </header>
    </div>
  )
}
```

### Styling

```bash
echo > src/root.css
```

```css
/* src/root.css */

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.App {
  text-align: center;
}

.header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}

.link {
  color: #b318f0;
}
```

Import `App` component into `root.jsx` file.

```jsx
// src/root.jsx

/* @refresh reload */
import { render } from "solid-js/web"
import App from "./routes/index"
import "./root.css"

render(
  () => <App />,
  document.getElementById('root')
)
```

![02-solid-home-page-with-styling](./screenshots/02-solid-home-page-with-styling.png)

### Create Signal

```bash
mkdir src/components
echo > src/components/Counter.jsx
```

```jsx
// src/components/Counter.jsx

import { createSignal } from "solid-js"

export default function Counter() {
  const [count, setCount] = createSignal(0)

  setInterval(() => setCount(count() + 1), 1000)

  return (
    <>
      Count: {count()}
    </>
  )
}
```

```jsx
// src/routes/index.jsx

import Counter from "../components/Counter"

export default function App() {
  return (
    <div class="App">
      <header class="header">
        <h1>A First Look at Solid</h1>
        <a
          class="link"
          href="https://github.com/solidjs/solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Solid
        </a>

        <Counter />
      </header>
    </div>
  )
}
```

![03-home-page-with-counter](./screenshots/03-home-page-with-counter.png)

### Create Effect

```jsx
// src/components/Counter.jsx

import { createSignal, createEffect } from "solid-js"

export default function Counter() {
  const [count, setCount] = createSignal(0)

  createEffect(
    () => count()
  )

  return (
    <>
      <button onClick={() => setCount(count() + 1)}>
        Click Me
      </button>

      <div>
        The count is now: {count()}
      </div>
    </>
  )
}
```

![04-create-effect-button](./screenshots/04-create-effect-button.png)

### Create Resource

Rewrite `onMount` to `createResource`.

```bash
echo > src/components/Users.jsx
```

```jsx
// src/components/Users.jsx

import { createSignal, onMount, For } from "solid-js"

export default function Users() {
  const [users, setUsers] = createSignal([])

  onMount(async () => {
    const res = await fetch(`https://jsonplaceholder.typicode.com/users?_limit=5`)
    setUsers(await res.json())
  })

  return (
    <>
      <For
        each={users()}
        fallback={<p>Loading...</p>}
      >
        {user => <div>{user.name}</div>}
      </For>
    </>
  )
}
```

```jsx
// src/routes/index.jsx

import Counter from "../components/Counter"
import Users from "../components/Users"

export default function App() {
  return (
    <div class="App">
      <header class="header">
        <h1>A First Look at Solid</h1>
        <a
          class="link"
          href="https://github.com/solidjs/solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Solid
        </a>

        <Counter />
        <Users />
      </header>
    </div>
  )
}
```

![05-onmount-displaying-users](./screenshots/05-onmount-displaying-users.png)

## Deploy

You can deploy the `dist` folder to any static host provider.

```bash
pnpm build
```

```bash
git init
git add .
git commit -m "solid"
gh repo create ajcwebdev-solid \
  --description="An example SolidJS application deployed on Netlify, Vercel, Cloudflare Pages, and Edgio" \
  --public \
  --push \
  --source=. \
  --remote=upstream
```

### Netlify

```bash
echo > netlify.toml
```

```toml
# netlify.toml

[build]
  command = "npm run build"
  publish = "dist"
```

```bash
pnpm ntl login
pnpm ntl init
```

```
? What would you like to do? +  Create & configure a new site
? Team: Anthony Campolo's team
? Site name (you can change it later): ajcwebdev-solid

Site Created

Admin URL: https://app.netlify.com/sites/ajcwebdev-solid
URL:       https://ajcwebdev-solid.netlify.app
Site ID:   xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

Linked to ajcwebdev-solid

? Your build command (hugo build/yarn run build/etc): npm run build
? Directory to deploy (blank for current dir): dist

Adding deploy key to repository...
Deploy key added!

Creating Netlify GitHub Notification Hooks...
Netlify Notification Hooks configured!

Success! Netlify CI/CD Configured!

This site is now configured to automatically deploy from github branches & pull requests

Next steps:

  git push       Push to your git repository to trigger new site builds
  netlify open   Open the Netlify admin URL of your site
```

Open [ajcwebdev-solid.netlify.app](https://ajcwebdev-solid.netlify.app/).

### Vercel

```bash
echo > vercel.json
```

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install"
}
```

```bash
pnpm vercel login
pnpm vercel git connect --yes
pnpm vercel --yes
pnpm vercel --yes --prod
```

Open [ajcwebdev-solid.vercel.app](https://ajcwebdev-solid.vercel.app/).

### Cloudflare Pages

```bash
pnpm wrangler login
pnpm wrangler pages project create ajcwebdev-solid \
  --production-branch production
```

```
✨ Successfully created the 'ajcwebdev-solid' project. It will be available
at https://ajcwebdev-solid.pages.dev/ once you create your first deployment.

To deploy a folder of assets, run 'wrangler pages publish [directory]'.

Retrieving cached values for userId from node_modules/.cache/wrangler
```

```bash
pnpm wrangler pages publish dist \
  --project-name ajcwebdev-solid \
  --branch production
```

```
Retrieving cached values for account_id and project_name from node_modules/.cache/wrangler

✨ Success! Uploaded 3 files (1.42 sec)

✨ Deployment complete! Take a peek over at https://6e2dfc90.ajcwebdev-solid.pages.dev
```

Open [ajcwebdev-solid.pages.dev](https://ajcwebdev-solid.pages.dev/).

### Edgio

```bash
pnpm 0 login
pnpm 0 init --name ajcwebdev-solid \
  --environment production
```

```js
// routes.js

import { Router } from "@layer0/core/router"

export default new Router()
  .noIndexPermalink()
  .static('dist', ({ cache }) => {
    cache({
      edge: {
        maxAgeSeconds: 60 * 60 * 60 * 365,
        forcePrivateCaching: true,
      },
      browser: {
        maxAgeSeconds: 0,
        serviceWorkerSeconds: 60 * 60 * 24,
      },
    })
  })
  .fallback(({ appShell }) => {
    appShell('dist/index.html')
  })
```

```bash
mv layer0.config.js layer0.config.cjs
mv routes.js routes.cjs
pnpm 0 deploy --site ajcwebdev-solid
```

```
***** Deployment Complete ************************************************
*                                                                        *
*  🖥  Layer0 Developer Console:                                          *
*  https://app.layer0.co/ajcwebdev/ajcwebdev-solid/env/default/builds/1  *
*                                                                        *
*  🔗 Permalink:                                                         *
*  https://ajcwebdev-ajcwebdev-solid-main-1.free.layer0-perma.link       *
*                                                                        *
*  🌎 Edge:                                                              *
*  https://ajcwebdev-ajcwebdev-solid-default.layer0-limelight.link       *
*                                                                        *
**************************************************************************
```

Open [ajcwebdev-ajcwebdev-solid-default.layer0-limelight.link](https://ajcwebdev-ajcwebdev-solid-default.layer0-limelight.link/).

## Solid Start

```json
{
  "type": "module",
  "scripts": {
    "dev": "solid-start dev",
    "build": "solid-start build",
    "start": "solid-start start"
  },
}
```

```js
// vite.config.js

import { defineConfig } from "vite"
import solid from "solid-start/vite"
// import solidPlugin from "vite-plugin-solid"

export default defineConfig({
  plugins: [solid()]
  // plugins: [solidPlugin()]
})
```

### Client and Server Entry

```bash
echo > src/entry-client.jsx
echo > src/entry-server.jsx
```

```jsx
// src/entry-client.jsx

import { mount, StartClient } from "solid-start/entry-client"

mount(
  () => <StartClient />,
  document
)
```

```jsx
// src/entry-server.jsx

import {
  StartServer, createHandler, renderAsync,
} from "solid-start/entry-server"

export default createHandler(
  renderAsync(
    (event) => <StartServer event={event} />
  )
)
```

### Root

```jsx
// src/root.jsx

// @refresh reload
import { Suspense } from "solid-js"
import {
  Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts
} from "solid-start"
import "./root.css"

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <ErrorBoundary>
          <Suspense>
            <Routes>
              <FileRoutes />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <Scripts />
      </Body>
    </Html>
  )
}
```

Check that everything still displays as expected.

```bash
pnpm dev
```

Open [localhost:3000](http://localhost:3000).

### Solid Start Todos Route

```bash
echo > src/routes/todos.jsx
```

```jsx
// src/routes/todos.jsx

import { For, Show } from "solid-js"
import { useLocation, useRouteData } from "solid-start"
import { createServerAction$, createServerData$, createServerMultiAction$, redirect } from "solid-start/server"
import db from "~/db"

export const routeData = () => createServerData$(db.getTodos, { initialValue: [] })

export default function Home() {
  const todos = useRouteData()
  const location = useLocation()

  const [addingTodo, addTodo] = createServerMultiAction$(addTodoFn)
  const [removingTodo, removeTodo] = createServerMultiAction$(removeTodoFn)

  const filterList = (todos) => {
    if (location.query.show === "active") return todos.filter(todo => !todo.completed)
    else if (location.query.show === "completed") return todos.filter(todo => todo.completed)
    else return todos
  }

  let inputRef
  return (
    <section class="todoapp">
      <header>
        <h1>todos</h1>
        <addTodo.Form onSubmit={e => {
          if (!inputRef.value.trim()) e.preventDefault()
          setTimeout(() => (inputRef.value = ""))
        }}>
          <input
            name="title"
            class="new-todo"
            placeholder="What needs to be done?"
            ref={inputRef}
            autofocus
          />
        </addTodo.Form>
      </header>

      <main>
        <ul>
          <For each={filterList(todos())}>
            {todo => {
              const [togglingTodo, toggleTodo] = createServerAction$(toggleTodoFn)
              const title = () => todo.title
              const pending = () => togglingTodo.pending
              const completed = () => togglingTodo.pending
                ? !togglingTodo.input.get("completed")
                : todo.completed
              const removing = () => removingTodo.some(data => +data.input.get("id") === todo.id)

              return (
                <Show when={!removing()}>
                  <li
                    classList={{
                      completed: completed(),
                      pending: pending()
                    }}
                  >
                    <div>
                      <toggleTodo.Form>
                        <input type="hidden" name="id" value={todo.id} />
                        <button type="submit" class="toggle" disabled={pending()}>
                          {completed() ? "✅" : "⚪️"}
                        </button>
                      </toggleTodo.Form>
                      <label>{title()}</label>
                      <removeTodo.Form>
                        <input type="hidden" name="id" value={todo.id} />
                        <button type="submit" class="destroy" />
                      </removeTodo.Form>
                    </div>
                  </li>
                </Show>
              )
            }}
          </For>
          <For each={addingTodo}>
            {sub => (
              <li class="todo pending">
                <label>{sub.input.get("title")}</label>
                <button disabled class="destroy" />
              </li>
            )}
          </For>
        </ul>
      </main>
    </section>
  )
}

async function addTodoFn(form) {
  await db.addTodo(form.get("title"))
  return redirect("/todos")
}
async function removeTodoFn(form) {
  await db.removeTodo(Number(form.get("id")))
  return redirect("/todos")
}
async function toggleTodoFn(form) {
  await db.toggleTodo(Number(form.get("id")))
  return redirect("/todos")
}
```

### Solid Start Todo Data

```bash
echo > src/db.js
```

```js
// src/db.js

// TODO: This is terribly broken with HMR. Should use real persistent storage.

let COUNTER = 0
let TODOS = []
const DELAY = 120

function delay(fn) {
  return new Promise((res) => setTimeout(() => res(fn()), DELAY))
}

export default {
  getTodos() {
    return delay(() => TODOS)
  },
  addTodo(title) {
    return delay(() => TODOS.push({ id: COUNTER++, title, completed: false }))
  },
  removeTodo(id) {
    return delay(() => (TODOS = TODOS.filter((todo) => todo.id !== id)))
  },
  toggleTodo(id) {
    return delay(() =>
      TODOS.forEach(
        (todo) => todo.id === id && (todo.completed = !todo.completed)
      )
    )
  },
}
```

### Todo CSS

```css
/* src/root.css */

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.App {
  text-align: center;
}

.header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}

html,
body {
  margin: 0;
  padding: 0;
}

button {
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  font-size: 100%;
  vertical-align: baseline;
  font-family: inherit;
  font-weight: inherit;
  color: inherit;
  -webkit-appearance: none;
  appearance: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font: 14px 'Helvetica Neue', Helvetica, Arial, sans-serif;
  line-height: 1.4em;
  background: #f5f5f5;
  color: #4d4d4d;
  min-width: 230px;
  max-width: 550px;
  margin: 0 auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: 300;
}

:focus {
  outline: 0;
}

.hidden {
  display: none;
}

section {
  background: #fff;
  margin: 130px 0 40px 0;
  position: relative;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2),
              0 25px 50px 0 rgba(0, 0, 0, 0.1);
}

section input::-webkit-input-placeholder {
  font-style: italic;
  font-weight: 300;
  color: #e6e6e6;
}

section input::-moz-placeholder {
  font-style: italic;
  font-weight: 300;
  color: #e6e6e6;
}

section input::input-placeholder {
  font-style: italic;
  font-weight: 300;
  color: #e6e6e6;
}

section h1 {
  position: absolute;
  top: -155px;
  width: 100%;
  font-size: 100px;
  font-weight: 100;
  text-align: center;
  color: rgba(175, 47, 47, 0.15);
  -webkit-text-rendering: optimizeLegibility;
  -moz-text-rendering: optimizeLegibility;
  text-rendering: optimizeLegibility;
}

.new-todo {
  position: relative;
  margin: 0;
  width: 100%;
  font-size: 24px;
  font-family: inherit;
  font-weight: inherit;
  line-height: 1.4em;
  color: inherit;
  padding: 16px 16px 16px 60px;
  border: 1px solid #999;
  box-shadow: inset 0 -1px 5px 0 rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.003);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

main {
  position: relative;
  z-index: 2;
  border-top: 1px solid #e6e6e6;
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

ul li {
  position: relative;
  font-size: 24px;
  border-bottom: 1px solid #ededed;
}

ul li:last-child {
  border-bottom: none;
}

ul li button.toggle {
  z-index: 1;
  padding: 10px;
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto 0;
  display: flex;
  align-items: center;
}

ul li label {
  word-break: break-all;
  padding: 15px 15px 15px 60px;
  display: block;
  line-height: 1.2;
  transition: color 0.4s;
}

ul li.completed label {
  color: #d9d9d9;
  text-decoration: line-through;
}

ul li.pending label {
  color: #998ef1;
}

ul li .destroy {
  display: none;
  position: absolute;
  top: 0;
  right: 10px;
  bottom: 0;
  width: 40px;
  height: 40px;
  margin: auto 0;
  font-size: 30px;
  color: #cc9a9a;
  margin-bottom: 11px;
  transition: color 0.2s ease-out;
}

ul li .destroy:hover {
  color: #af5b5e;
}

ul li .destroy:after {
  content: '×';
}

ul li:hover .destroy {
  display: block;
}

/*
  Hack to remove background from Mobile Safari.
  Can't use it globally since it destroys checkboxes in Firefox
*/
@media screen and (-webkit-min-device-pixel-ratio:0) {
  .toggle-all,
  ul li .toggle {
    background: none;
  }

  ul li .toggle {
    height: 40px;
  }
}
```

## Solid Start Deploy

### Netlify

```bash
pnpm add -D solid-start-netlify
```

```toml
# netlify.toml

[build]
  command = "npm run build"
  publish = "netlify"
```

### Vercel

```bash
pnpm add -D solid-start-vercel
pnpm vercel env add ENABLE_VC_BUILD
```
