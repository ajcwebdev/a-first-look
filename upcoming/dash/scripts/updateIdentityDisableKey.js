import { client } from './client.js'

const { IDENTITY_ID } = process.env

const updateIdentityDisableKey = async () => {
  const { platform } = client
  const existingIdentity = await platform.identities.get(IDENTITY_ID)
  const publicKeyToDisable = existingIdentity.getPublicKeyById(0)

  const updateDisable = {
    disable: [publicKeyToDisable],
  }

  await platform.identities.update(existingIdentity, updateDisable)
  return platform.identities.get(IDENTITY_ID)
}

updateIdentityDisableKey()
  .then(data => console.log(
    'IDENTITY_ID=' + data.toJSON())
  )
  .catch(error => console.error('Something went wrong:\n', error))
  .finally(() => client.disconnect())