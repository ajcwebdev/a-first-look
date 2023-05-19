import { client } from './client.js'

const updateIdentityDisableKey = async () => {
  const identityId = process.env.IDENTITY_ID
  const keyId = 0

  const existingIdentity = await client.platform.identities.get(identityId)
  const publicKeyToDisable = existingIdentity.getPublicKeyById(keyId)

  const updateDisable = {
    disable: [publicKeyToDisable],
  }

  await client.platform.identities.update(existingIdentity, updateDisable)
  return client.platform.identities.get(identityId)
}

updateIdentityDisableKey()
  .then(data => console.log('Identity updated:\n', data.toJSON()))
  .catch((e) => console.error('Something went wrong:\n', e))
  .finally(() => client.disconnect())