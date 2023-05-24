import { defineConfig } from "vite"
import solid from "solid-start/vite"
// import netlify from "solid-start-netlify"
import vercel from "solid-start-vercel"

export default defineConfig({
  plugins: [
    solid(
      // { adapter: netlify({ edge: true }) },
      { adapter: vercel() }
    )
  ]
})