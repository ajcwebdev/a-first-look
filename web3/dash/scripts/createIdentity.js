import { client } from './client.js'

const createIdentity = async () => {
  return client.platform.identities.register()
}

createIdentity()
  .then(data => console.log(data.toJSON()))
  .catch((e) => console.error('Something went wrong:\n', e))
  .finally(() => client.disconnect())