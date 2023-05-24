# Example Project from [A First Look at Remix](https://ajcwebdev.com/2021/05/06/a-first-look-at-remix)

In this example we will use the Vercel starter to make Fetch requests containing GraphQL queries.

## Outline

* [Introduction](#introduction)
* [Deploy to Vercel](#deploy-to-vercel)
* [Project Setup](#project-setup)
  * [Index Routes](#index-routes)
  * [CSS Styling](#css-styling)
  * [Loader Functions](#loader-functions)

## Introduction

Remix is a React metaframework from Ryan Florence and Michael Jackson that builds on standard web APIs. They were already well known as the maintainers of React Router and educators behind React Training. But in the beginning of 2020, widespread quarantine measures were enacted across the country. Quarantine effectively brought an end to all in-person technical training.

Once the impeding demise of their livelihood became apparent, the two founders helped their remaining employees find new remote roles before they inevitable were forced to lay them off. About a month later in April 2020, they announced Remix. Originally requiring a paid license, it launched as a "supporter preview" in October 2020. A little over a year later, in November 2021, it was fully open-sourced.

This was accompanied by the founders starting a company, raising a [$3 million seed round](https://remix.run/blog/seed-funding-for-remix), and hiring notable React developer and teacher, Kent C. Dodds. Kent had become infatuated with Remix, [rebuilt his entire platform around the framework](https://kentcdodds.com/blog/why-i-love-remix), and attempted to individually recommend the framework to every single person on the internet. He was soon hired as a Developer Advocate and early co-founder of the newly formed company.

## Deploy to Vercel

The starter already includes Vercel specific configuration in `remix.config.js` and the `@remix-run/vercel` package in `server.js`. You can deploy your app by [importing a Git repository](https://vercel.com/new) into Vercel. If you'd like to avoid using a Git repository, you can directly deploy the project with the [Vercel CLI](https://vercel.com/cli):

```bash
yarn vercel
```

Open your [website URL](https://ajcwebdev-remix.vercel.app) to see the deployed project.

## Project Setup

To run your Remix app locally, install your dependencies and start the Remix development server:

```bash
yarn
yarn dev
```

```
Watching Remix app in development mode...
💿 Built in 161ms

Remix App Server started at http://localhost:3000 (http://192.168.1.78:3000)
```

Open [localhost:3000](https://localhost:3000) to see the project.

### Index Routes

[`index` routes](https://remix.run/guides/routing#index-routes) are routes that renders when the layout's path is matched exactly. If you have an `index.jsx` file in the `routes` directory it will be used as the home page. I've made a few edits to the boilerplate code. [`json`](https://remix.run/api/remix#json) provides a shortcut for creating `application/json` responses and [`meta`](https://remix.run/api/conventions#meta) sets meta tags for the HTML document.

```jsx
// app/routes/index.jsx

import { useLoaderData } from "@remix-run/react"
import { json } from "@remix-run/node"

export let loader = () => {
  let data = {
    resources: [
      { name: "My Blog", url: "https://ajcwebdev.com" },
      { name: "A First Look at Remix", url: "https://ajcwebdev.com/a-first-look-at-remix" },
      { name: "Example Repo", url: "https://github.com/ajcwebdev/ajcwebdev-remix" }
    ]
  }
  return json(data)
}

export let meta = () => {
  return {
    title: "ajcwebdev-remix", description: "Welcome to Remix!"
  }
}

export default function Index() {
  let data = useLoaderData()

  return (
    <div className="remix__page">
      <main>
        <h1>ajcwebdev-remix</h1>
        <p>Woot!</p>
      </main>

      <section>        
        <h2>Resources</h2>
        <ul>
          {data.resources.map(resource => (
            <li key={resource.url}>
              <a href={resource.url}>{resource.name}</a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
```

### CSS Styling

Include [Water CSS](https://watercss.kognise.dev/) for some styling presets.

```jsx
// app/root.jsx

import {
  Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration
} from "@remix-run/react"

export const links = () => {
  return [{
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css"
  }]
}

export const meta = () => ({
  charset: "utf-8",
  title: "A First Look at Remix with GraphQL",
  viewport: "width=device-width,initial-scale=1",
})

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
```

![03-home-page-with-water-css](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/demc5fj0o0spog5xz8do.png)

### Loader Functions

[Loaders](https://remix.run/api/conventions#loader) provide data to components and are only ever called on the server. Since the function only runs on the server, it's an ideal candidate for server and database requests that include API secrets that cannot be exposed on the client. Each route can define a "loader" function that will be called on the server before rendering to provide data to the route.

```jsx
// app/routes/graphql.jsx

import { useLoaderData } from "@remix-run/react"

const GET_CHARACTERS = `{
  characters {
    results {
      name
      id
    }
  }
}`

export let loader = async () => {
  const res = await fetch(
    'https://rickandmortyapi.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: GET_CHARACTERS
      })
    }
  )
  const { data }  = await res.json()
  return data.characters
}

export default function Index() {
  let { results } = useLoaderData()

  return (
    <>
      <ul>
        {results.map(({ name, id }) => (
          <li key={id}>
            {name}
          </li>
        ))}
      </ul>
    </>
  )
}
```

![04-graphql-route-with-characters-data](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/swijfauollj5d2tutrk2.png)
