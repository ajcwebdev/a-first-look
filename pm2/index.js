const http = require('http')

const hostname = '143.198.110.139'
const port = 3000

const server = http.createServer(
  (req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html')
    res.end('<h1>ajcwebdev</h1><p>PM2 is a daemon process manager</p>')
  }
)

server.listen(port, hostname, () => {
  console.log(`Running on http://${hostname}:${port}/`)
})
