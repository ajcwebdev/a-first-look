// const port = 3000

Bun.serve({
  fetch(req) {
    return new Response(`
      <html>
        <head>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css">
        </head>
        <body>
          <h1>Hello from ajcwebdev on Bun</h1>
        </body>
      </html>`,
      { headers: { 'content-type': 'text/html' } }
    )
  },
  error(error: Error) {
    return new Response(
      "Error: \n" + error.toString(),
      { status: 500 }
    )
  },
})

console.log(`Hello via Bun!`)