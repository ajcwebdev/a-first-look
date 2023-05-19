import { client } from './client.js'

const registerName = async () => {
  const { platform } = client
  const identityID = process.env.IDENTITY_ID
  const identity = await platform.identities.get(identityID)
  const nameRegistration = await platform.names.register(
    'ajcwebdevtest.dash',
    { dashUniqueIdentityId: identity.getId() },
    identity,
  )
  return nameRegistration
}

registerName()
  .then(data => console.log('Name registered:\n', data.toJSON()))
  .catch((e) => console.error('Something went wrong:\n', e))
  .finally(() => client.disconnect())