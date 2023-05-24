import { client } from './client.js'

const { IDENTITY_ID } = process.env

const topupIdentity = async () => {
  const { platform } = client
  await platform.identities.topUp(IDENTITY_ID, 1000)
  return platform.identities.get(IDENTITY_ID)
}

topupIdentity()
  .then(data => console.log(
    'IDENTITY_CREDIT_BALANCE=' + data.balance)
  )
  .catch(error => console.error('Something went wrong:\n', error))
  .finally(() => client.disconnect())