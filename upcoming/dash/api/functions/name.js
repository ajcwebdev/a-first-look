import Dash from "dash"

const client = new Dash.Client({ network: 'testnet' })

exports.handler = async (event, context) => {
  try {
    const name = event.path.split('/').pop()
    const result = await client.platform.names.resolve(`${name}.dash`)
    client.disconnect()
    return {
      statusCode: 200,
      body: JSON.stringify(result.toJSON().label),
      headers: {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS 
      }
    }
  } catch (e) {
    client.disconnect()
    return {
      statusCode: 500,
      body: 'Something went wrong:\n' + e.toString()
    }
  }
}