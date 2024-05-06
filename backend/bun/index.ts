const port = parseInt(process.env.PORT) || 3000

Bun.serve({
  fetch(req) {
    return new Response(`
      <html>
        <head>
          <title>ajcwebdev-bun</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css">
          <link rel="stylesheet" href="https://cdn.simplecss.org/simple.min.css">
        </head>

        <body>
          <h1>Hello from ajcwebdev on Bun</h1>
          <p>Now with proper HTML structure, CSS, and error handling.</p>

          <h2>Heading 2</h2>
          <ul>
            <li>An</li>
            <li>unordered</li>
            <li>list</li>
          </ul>
          <h3>Heading 3</h3>
          <ol>
            <li>An</li>
            <li>ordered</li>
            <li>list</li>
          </ol>
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
  port: port
})
  
console.log(`Hello via Bun on ${port}!`)