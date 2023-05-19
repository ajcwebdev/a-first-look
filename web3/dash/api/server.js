import express from 'express'
import cors from 'cors'
import Dash from "dash"

const client = new Dash.Client({ network: 'testnet' })

const app = express()
app.use(cors())

app.get('/name/:identityName', async (req, res) => {
  try {
    const name = req.params.identityName
    const result = await client.platform.names.resolve(`${name}.dash`)

    res.json(result.toJSON())
  } catch (e) {
    res.status(500).send('Something went wrong:\n' + e)
  }
})

const port = process.env.PORT || 3001

app.listen(port, () => {
  console.log("Running on localhost:", port)
})