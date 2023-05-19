import { client } from "./client.js"

async function getBlockHash() {
  const res = await client.getDAPIClient().core.getBlockHash(1)
  if (!res) {
    throw new Error('No response received from getBlockHash API call')
  }
  return res
}

getBlockHash()
  .then((data) => console.log(data))
  .catch((e) => console.error('Something went wrong:\n', e))
  .finally(() => client.disconnect())