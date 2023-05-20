import { client } from "./client.js"

async function getBlockByHeight() {
  const DAPIClient = client.getDAPIClient()
  const res = await DAPIClient.core.getBlockByHeight(1)
  if (!res) {
    throw new Error('No response received from getBlockByHeight API call')
  }
  return JSON.stringify(res)
}

getBlockByHeight()
  .then(data => console.log(data))
  .catch(error => console.error('Something went wrong:\n', error))
  .finally(() => client.disconnect())