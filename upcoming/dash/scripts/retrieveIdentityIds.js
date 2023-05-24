import { client } from './client.js'

const retrieveIdentityIds = async () => {
  const walletAccount = await client.getWalletAccount()
  const identityIds = walletAccount.identities.getIdentityIds()
  return identityIds
}

retrieveIdentityIds()
  .then(data => console.log(data))
  .catch(error => console.error('Something went wrong:\n', error))
  .finally(() => client.disconnect())