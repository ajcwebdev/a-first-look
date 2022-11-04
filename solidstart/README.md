# SolidStart

Everything you need to build a Solid project, powered by [`solid-start`](https://github.com/ryansolid/solid-start/tree/master/packages/solid-start).

```js
// vite.config.js

import solid from "solid-start/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [solid()],
})
```

```jsx
// src/root.jsx

// @refresh reload
import { Suspense } from "solid-js"
import {
  Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts, Title,
} from "solid-start"
import "./root.css"

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>SolidStart - Bare</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Body>
        <Suspense>
          <ErrorBoundary>
            <nav>
              <a href="/">Index</a>
              <a href="/about">About</a>
            </nav>
            <Routes>
              <FileRoutes />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  )
}
```

```jsx
// src/entry-server.jsx

import { createHandler, renderAsync, StartServer } from "solid-start/entry-server"

export default createHandler(
  renderAsync(
    (event) => <StartServer event={event} />
  )
)
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
// src/routes/index.jsx

import { Title } from "solid-start"
import Counter from "~/components/Counter"

export default function Home() {
  return (
    <main>
      <Title>Hello World</Title>
      <h1>Hello world!</h1>

      <Counter />

      <p>
        Visit{" "}
          <a href="https://docs.solidjs.com/start" target="_blank">
            docs.solidjs.com
          </a>
        {" "}to learn how to build SolidStart apps.
      </p>
    </main>
  )
}
```

```jsx
// src/routes/[...404].jsx

import { Title } from "solid-start"
import { HttpStatusCode } from "solid-start/server"

export default function NotFound() {
  return (
    <main>
      <Title>Not Found</Title>
      <HttpStatusCode code={404} />

      <h1>Page Not Found</h1>
      <p>To learn how to build SolidStart apps, visit:</p>

      <a href="https://docs.solidjs.com/start" target="_blank">
        docs.solidjs.com/start
      </a>
    </main>
  )
}
```

```jsx
// src/components/Counter.jsx

import { createSignal } from "solid-js"

export default function Counter() {
  const [count, setCount] = createSignal(0)
  
  return (
    <button
      class="increment"
      onClick={() => setCount(count() + 1)}
    >
      Clicks: {count}
    </button>
  )
}
```

```css
/* src/root.css */

body {
  font-family: Gordita, Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

nav {
  display: flex;
  justify-content: center;
}

nav a {
  margin: 2rem;
  font-size: larger;
}

.increment {
  font-family: inherit;
  font-size: inherit;
  padding: 1em 2em;
  color: #335d92;
  background-color: rgba(68, 107, 158, 0.1);
  border-radius: 2em;
  border: 2px solid rgba(68, 107, 158, 0);
  outline: none;
  width: 200px;
  font-variant-numeric: tabular-nums;
}

.increment:focus {
  border: 2px solid #335d92;
}

.increment:active {
  background-color: rgba(68, 107, 158, 0.2);
}

main {
  text-align: center;
  padding: 1em;
  margin: 0 auto;
}

h1 {
  color: #335d92;
  text-transform: uppercase;
  font-size: 4rem;
  font-weight: 100;
  line-height: 1.1;
  margin: 4rem auto;
  max-width: 14rem;
}

p {
  max-width: 14rem;
  margin: 2rem auto;
  line-height: 1.35;
}

@media (min-width: 480px) {
  h1 {
    max-width: none;
  }
  p {
    max-width: none;
  }
}
```