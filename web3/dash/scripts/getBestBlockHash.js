import { client } from "./client.js"

async function getBestBlockHash() {
  const DAPIClient = client.getDAPIClient()
  const res = await DAPIClient.core.getBestBlockHash()
  if (!res) {
    throw new Error('No response received from getBestBlockHash API call')
  }
  return res
}

getBestBlockHash()
  .then(data => console.log(data))
  .catch(error => console.error('Something went wrong:\n', error))
  .finally(() => client.disconnect())