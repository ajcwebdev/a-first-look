import { defineConfig } from "vite"
import marko from "@marko/vite"

const { NODE_ENV } = process.env
const isProd = NODE_ENV === "production"

export default defineConfig({
  plugins: [
    marko(),
    {
      apply: "build",
      name: "worker-condition",
      config(options) {
        if (options.build.ssr && options.ssr?.target === "webworker") {
          options.resolve = {
            conditions: ["worker"],
          }
        }
        return options
      },
    },
  ],
  build: {
    minify: true,
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      output: {
        format: "es",
      },
    },
  },
  ssr: {
    target: "webworker",
    noExternal: isProd,
  }
})