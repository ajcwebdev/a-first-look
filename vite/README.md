# Example project for [a first look at vite](https://dev.to/ajcwebdev/a-first-look-at-vite-m8n)

[Vite](https://vitejs.dev/) (French word for "fast", pronounced `/vit/`, rhymes with "street") is a frontend build tool and open source project created by Evan You. [Vite 2.0](https://dev.to/yyx990803/announcing-vite-2-0-2f0a) was officially released on February 16, 2021 and aims to provide a faster and leaner development experience for modern web projects. It consists of two parts:

* A dev server with Hot Module Replacement (HMR) that serves your source files over [native ES modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
* A build command that bundles your code with [Rollup](https://rollupjs.org), pre-configured to output highly optimized static assets for production

## Clone repo, install dependencies, and run development server

To run this project on your local machine enter these commands to clone the repo, install the dependencies with `yarn` and start the development server with `yarn dev`.

```bash
git clone https://github.com/ajcwebdev/ajcwebdev-vite
cd ajcwebdev-vite
yarn
yarn dev
```

## Create Vue App

Alternatively, you can recreate this project from scratch with the following instructions. You can find a [more detailed version of this tutorial on my blog](https://dev.to/ajcwebdev/a-first-look-at-vite-m8n/).

### Initialize project

```bash
yarn create @vitejs/app ajcwebdev-vite --template vue
```

### Start development server

```bash
cd ajcwebdev-vite
yarn
yarn dev
```

![08-create-vite-app](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2cjrtow31cillpopfha1.png)

## Project Structure

```
├── public
│   └── favicon.ico
├── src
│   ├── assets
│   │   └── logo.png
│   ├── components
│   │   └── HelloWorld.vue
│   ├── App.vue
│   └── main.jsx
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── yarn.lock
```

### package.json

Our `package.json` includes scripts for starting the development server, building for production, and serving local previews of production builds.

```json
{
  "name": "ajcwebdev-vite",
  "version": "0.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "serve": "vite preview"
  },
  "dependencies": {
    "vue": "^3.0.5"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^1.2.2",
    "@vue/compiler-sfc": "^3.0.5",
    "vite": "^2.2.3"
  }
}
```

### App component

```html
<!-- src/App.vue -->

<template>
  <img
    alt="Vue logo"
    src="./assets/logo.png"
  />

  <HelloWorld msg="Hello Vue 3 + Vite" />
</template>

<script setup>
  import HelloWorld from './components/HelloWorld.vue'
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
```

### HelloWorld component

```html
<!-- src/components/HelloWorld.vue -->

<template>
  <h1>{{ msg }}</h1>

  <p>
    <a
      href="https://vitejs.dev/guide/features.html"
      target="_blank"
    >
      Vite Documentation
    </a>
    |
    <a
      href="https://v3.vuejs.org/"
      target="_blank"
    >
      Vue 3 Documentation
    </a>
  </p>

  <button @click="state.count++">
    count is: {{ state.count }}
  </button>

  <p>
    Edit
    <code>components/HelloWorld.vue</code> to test hot module replacement.
  </p>
</template>

<script setup>
  import { defineProps, reactive } from 'vue'

  defineProps({
    msg: String
  })

  const state = reactive({ count: 0 })
</script>

<style scoped>
  a {
    color: #42b983;
  }
</style>
```

### Change stuff

```html
<!-- src/components/HelloWorld.vue -->

<template>
  <h1>{{ msg }}</h1>

  <p>
    <a
      href="https://dev.to/ajcwebdev"
      target="_blank"
    >
      Blog
    </a>
    |
    <a
      href="https://github.com/ajcwebdev"
      target="_blank"
    >
      GitHub
    </a>
  </p>
</template>

<script setup>
  import { defineProps } from 'vue'

  defineProps({
    msg: String
  })
</script>

<style scoped>
  a {
    color: #42b983;
  }
</style>
```

```html
<template>
  <img
    alt="Vue logo"
    src="./assets/logo.png"
  />

  <HelloWorld msg="ajcwebdev" />
</template>

<script setup>
  import HelloWorld from './components/HelloWorld.vue'
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
```

![09-create-vite-app-edited](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/jt1l97olmsnyhy290okz.png)

## Deploy to Netlify

Create a `netlify.toml` file to define the build command and publish directory for the static assets.

```bash
touch netlify.toml
```

```toml
[build]
  publish = "dist"
  command = "yarn build"
```

### Connect to Git provider

![10-connect-to-Git-provider](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/jraetzgxnkoyhvgwrn4b.png)

### Pick a repository

![11-pick-a-repository](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/fjyjgeyo5uygvkmsy3yr.png)

### Site settings

![12-site-settings](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/y4ngh8quj4ds9k1tyvav.png)

### Create custom domain name

![13-create-custom-domain-name](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/exj75pgvrnc4arenk4bi.png)

### Visit ajcwebdev-vite.netlify.app

![14-website-deployed-on-netlify](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ivxqxsc3fe62ttgkpmed.png)
