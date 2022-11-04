const express = require("express")
const app = express()

const port = process.env.PORT || 3000

app.get(
  "/", (req, res) => {
    greeting = "<h1>ajcwebdev-fly</h1>"
    res.send(greeting)
  }
)

app.listen(
  port,
  () => console.log(`Hello from port ${port}!`)
)