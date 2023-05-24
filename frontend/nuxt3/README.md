# Example Project from [A First Look at Nuxt 3](https://ajcwebdev.com/a-first-look-at-nuxt-3)

Nuxt is a Vue metaframework that aims to make web development intuitive and performant while keeping great developer experience in mind. The original version, created by [Sébastien Chopin in October 2016](https://github.com/nuxt/nuxt.js/commit/0072ed31da6ce39d21046e05898f956cff190390), was built to emulate the features of Next.js (such as file-system based routing, server-side rendering, and API routes) but with Vue instead of React. Version 3 has been [over a year in the making](https://nuxtjs.org/announcements/nuxt3-beta/).

## Clone Repo and Navigate to Project

```bash
git clone https://github.com/ajcwebdev/a-first-look.git
cd frontend/nuxt3
```

## Live Examples

* [ajcwebdev-nuxt3.netlify.app](https://ajcwebdev-nuxt3.netlify.app/)
* [ajcwebdev-nuxt3.vercel.app](https://ajcwebdev-nuxt3.vercel.app/)

## Overview

Nuxt 3 is composed of the following [core packages](https://github.com/nuxt/framework/tree/main/packages):

|Package |Purpose  |
|---------|----------|
|[nuxt3](https://github.com/nuxt/framework/tree/main/packages/nuxt3)|Core Engine|
|[nuxi](https://github.com/nuxt/framework/tree/main/packages/nuxi)|Command line interface|
|[vite-builder](https://github.com/nuxt/framework/tree/main/packages/vite) or [webpack-builder](https://github.com/nuxt/framework/tree/main/packages/webpack)|Bundlers|
|[nitro](https://github.com/nuxt/framework/tree/main/packages/nitro)|Server engine|
|[kit](https://github.com/nuxt/framework/tree/main/packages/kit)|Development kit|
|[bridge](https://github.com/nuxt/framework/tree/main/packages/bridge)|Nuxt 2 Bridge|

Together these packages provide a selection of libraries for managing many common concerns for developers building on the web today such as:

|Library|Common Concern|
|-------------------|--------|
|[Vue.js](https://v3.vuejs.org)|JavaScript framework for reactivity and components|
|[Vite](https://vitejs.dev/) or [Webpack 5](https://webpack.js.org/)|Bundler for hot module replacement in dev and bundling for production|
|[esbuild](https://esbuild.github.io)|Transpiler for supporting legacy browsers while still using current JavaScript syntax|
|[h3](https://github.com/unjs/h3)|Server that can serve your application in development and support [server-side rendering](https://v3.vuejs.org/guide/ssr/introduction.html#what-is-server-side-rendering-ssr) or API routes|
|[vue-router](https://next.router.vuejs.org)|Routing library to handle client-side navigation|

In addition to curating and integrating these tools, Nuxt also provides directory structure conventions for managing pages and components.

### Scripts

Nuxi is the new CLI for Nuxt 3 and has four main commands:
1. `dev` - Start development server
2. `build` - Make production assets
3. `generate` - Generate static site
4. `preview` - Preview production build

### Start Development Server

Include the `--open` flag to automatically open the browser after starting up.

```bash
npm i
npm run dev
```

```bash
yarn
yarn dev
```

```bash
pnpm i --shamefully-hoist
pnpm dev
```

Open [localhost:3000](http://localhost:3000) to see your application.

![01-ajcwebdev-nuxt3-localhost-3000](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/9oc49oolv9d31ljml352.png)

### Build for Production

The `nuxi build` command builds your Nuxt application for production. It creates a `.output` directory with your application, server, and dependencies ready to be deployed.

```bash
npm run build
```

```bash
yarn build
```

```bash
pnpm build
```

## App Entry Point

```vue
<!-- app.vue -->

<template>
  <div>
    <NuxtPage />
  </div>
</template>
```

## Pages

The `pages/` directory is optional, meaning that if you only use `app.vue`, `vue-router` won't be included, reducing your application bundle size. However, if you do include it, Nuxt will automatically integrate [Vue Router](https://next.router.vuejs.org/) and map `pages/` directory into the routes of your application.

### Home Page

```vue
<!-- pages/index.vue -->

<template>
  <div>
    <h2>ajcwebdev-nuxt3</h2>
  </div>
</template>
```

### About Page

```vue
<!-- pages/about.vue -->

<template>
  <div>
    <h2>This page tells you stuff about things!</h2>
  </div>
</template>
```

Open [localhost:3000/about](http://localhost:3000/about).

![02-about-page-localhost-3000](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/lyngyw7ae27x213gfu4f.png)

### Server Directory for API Routes

The `server/` directory contains API endpoints and server middleware for your project. It is used to create any backend logic for your Nuxt application. Nuxt will automatically read in any files in the `~/server/api` directory to create API endpoints. Each file should export a default function that handles API requests.

```js
// server/api/index.ts

export default () => (`
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="description" content="A minimal HTML website served on a Nuxt API route.">
      <title>Nuxt 3 API Route</title>
    </head>
    
    <body>
      <header>
        <h2>Hello from Nuxt 3</h2>
      </header>
      <footer>ajcwebdev '22</footer>
    </body>
  </html>
`)
```

Open [localhost:3000/api](http://localhost:3000/api).

## Netlify Deployment

Push your project to a GitHub repository and link it to Netlify. The build commands will be automatically imported from `netlify.toml`.

```toml
[build]
  command = "nuxi build"
  publish = "dist"
  functions = ".output/server"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/index"
  status = 200
```

## Vercel Deployment

```bash
yarn vercel
```
