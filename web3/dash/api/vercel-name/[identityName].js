import Dash from "dash"

const client = new Dash.Client({ network: 'testnet' })

export default async function handler(request, response) {
  const { identityName } = request.query
  
  try {
    const result = await client.platform.names.resolve(`${identityName}.dash`)
    response.status(200).json(result.toJSON().label)
  } catch (e) {
    response.status(500).send('Something went wrong:\n' + e)
  } finally {
    client.disconnect()
  }
}