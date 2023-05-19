import { client } from './client.js'

const retrieveIdentity = async () => {
  return client.platform.identities.get(process.env.IDENTITY_ID)
}

retrieveIdentity()
  .then(data => console.log(data.toJSON()))
  .catch((e) => console.error('Something went wrong:\n', e))
  .finally(() => client.disconnect())