import { client } from './client.js'

const createIdentity = async () => {
  const { platform } = client
  const identity = await platform.identities.register()
  return identity
}

createIdentity()
  .then(data => console.log(
    "IDENTITY_ID=" + `"${data.toJSON().id}"`)
  )
  .catch(error => console.error('Something went wrong:\n', error))
  .finally(() => client.disconnect())