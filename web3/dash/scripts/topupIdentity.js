import { client } from './client.js'

const topupIdentity = async () => {
  const identityId = process.env.IDENTITY_ID
  const topUpAmount = 1000

  await client.platform.identities.topUp(identityId, topUpAmount)
  return client.platform.identities.get(identityId)
}

topupIdentity()
  .then(data => console.log('Identity credit balance: ', data.balance))
  .catch((e) => console.error('Something went wrong:\n', e))
  .finally(() => client.disconnect())