import * as path from "path"
import { statSync } from "fs"

await Bun.build({
  entrypoints: ["./src/index.tsx"],
  outdir: "./build",
})

function serveFromDir(config: {
  directory: string
  path: string
}): Response | null {
  const suffixes = ["", ".html", "index.html"]
  for (const suffix of suffixes) {
    try {
      const pathWithSuffix = path.join(config.directory, config.path, suffix)
      const stat = statSync(pathWithSuffix)
      if (stat && stat.isFile()) {
        return new Response(Bun.file(pathWithSuffix))
      }
    } catch (err) {}
  }
  return null
}

const server = Bun.serve({
  fetch(request) {
    let reqPath = new URL(request.url).pathname
    console.log(request.method, reqPath)
    if (reqPath === "/") reqPath = "/index.html"

    const publicResponse = serveFromDir({ // check public
      directory: path.resolve(import.meta.dir, "public"),
      path: reqPath,
    })
    if (publicResponse) return publicResponse

    const buildResponse = serveFromDir({ // check /.build
      directory: path.resolve(import.meta.dir, "build"),
      path: reqPath
    })
    if (buildResponse) return buildResponse

    return new Response("File not found", { status: 404 })
  },
})

console.log(`Listening on http://localhost:${server.port}`)