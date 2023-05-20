import { client } from "./client.js"

async function getBlockHash() {
  const DAPIClient = client.getDAPIClient()
  const res = await DAPIClient.core.getBlockHash(1)
  if (!res) {
    throw new Error('No response received from getBlockHash API call')
  }
  return res
}

getBlockHash()
  .then(data => console.log(data))
  .catch(error => console.error('Something went wrong:\n', error))
  .finally(() => client.disconnect())