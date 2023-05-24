import express from 'express'
import cors from 'cors'
import { client } from '../scripts/client.js'

const app = express()
app.use(cors())

app.get('/name/:identityName', async (req, res) => {
  try {
    const name = req.params.identityName
    const result = await client.platform.names.resolve(`${name}.dash`)
    res.json(result.toJSON())
  } catch (error) {
    res.status(500).send('Something went wrong:\n' + error)
  } finally {
    client.disconnect()
  }
})

const port = process.env.PORT || 3001

app.listen(port, () => {
  console.log("Running on localhost:", port)
})