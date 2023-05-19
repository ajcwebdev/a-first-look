import { client } from "./client.js"

async function getBlockByHeight() {
  const res = await client.getDAPIClient().core.getBlockByHeight(1)
  if (!res) {
    throw new Error('No response received from getBlockByHeight API call')
  }
  return JSON.stringify(res)
}

getBlockByHeight()
  .then((data) => console.log(data))
  .catch((err) => console.error('Something went wrong:\n', err))
  .finally(() => client.disconnect())