import { client } from './client.js'

const { IDENTITY_ID } = process.env

const retrieveIdentity = async () => {
  const { platform } = client
  return platform.identities.get(IDENTITY_ID)
}

retrieveIdentity()
  .then(data => console.log(
    "IDENTITY_OBJECT=" + JSON.stringify(data))
  )
  .catch(error => console.error('Something went wrong:\n', error))
  .finally(() => client.disconnect())