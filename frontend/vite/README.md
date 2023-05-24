# Example Project from [A First Look at Vite](https://ajcwebdev.com/2021/03/05/a-first-look-at-vite/)

[Vite](https://vitejs.dev/) (French word for "fast", pronounced `/vit/`, rhymes with "street") is a frontend build tool and open source project created by Evan You. [Vite 2.0](https://dev.to/yyx990803/announcing-vite-2-0-2f0a) was officially released on February 16, 2021 and aims to provide a faster and leaner development experience for modern web projects. It consists of two parts:

* A dev server with Hot Module Replacement (HMR) that serves your source files over [native ES modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
* A build command that bundles your code with [Rollup](https://rollupjs.org), pre-configured to output highly optimized static assets for production

## Clone Repo and Navigate to Project

```bash
git clone https://github.com/ajcwebdev/a-first-look.git
cd frontend/vite
```

## Install dependencies and start development server

To run this project on your local machine enter these commands to install the dependencies with `yarn` and start the development server with `yarn dev`.

```bash
yarn
yarn dev
```

![08-create-vite-app](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2cjrtow31cillpopfha1.png)

### App Component

```vue
<!-- src/App.vue -->

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

### HelloWorld component

```vue
<!-- src/components/HelloWorld.vue -->

<template>
  <h1>{{ msg }}</h1>

  <p>
    <a href="https://ajcwebdev.com" target="_blank">
      Blog
    </a>
    |
    <a href="https://github.com/ajcwebdev" target="_blank">
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

![09-create-vite-app-edited](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/jt1l97olmsnyhy290okz.png)

## Deploy to Netlify

`netlify.toml` defines the build command and publish directory for the static assets.

```toml
# netlify.toml

[build]
  publish = "dist"
  command = "yarn build"
```

Connect to your Git provider.

![10-connect-to-Git-provider](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/jraetzgxnkoyhvgwrn4b.png)

Pick a repository.

![11-pick-a-repository](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/fjyjgeyo5uygvkmsy3yr.png)

Go to site settings.

![12-site-settings](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/y4ngh8quj4ds9k1tyvav.png)

Create a custom domain name.

![13-create-custom-domain-name](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/exj75pgvrnc4arenk4bi.png)

Visit ajcwebdev-vite.netlify.app.

![14-website-deployed-on-netlify](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ivxqxsc3fe62ttgkpmed.png)