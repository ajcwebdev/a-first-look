import { client } from './client.js'

const retrieveIdentityIds = async () => {
  const account = await client.getWalletAccount()
  return account.identities.getIdentityIds()
}

retrieveIdentityIds()
  .then(data => console.log(data))
  .catch((e) => console.error('Something went wrong:\n', e))
  .finally(() => client.disconnect())