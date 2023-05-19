import { client } from "./client.js"

async function getBestBlockHash() {
  const res = await client.getDAPIClient().core.getBestBlockHash()
  if (!res) {
    throw new Error('No response received from getBestBlockHash API call')
  }
  return res
}

getBestBlockHash()
  .then((data) => console.log(data))
  .catch((err) => console.error('Something went wrong:\n', err))
  .finally(() => client.disconnect())