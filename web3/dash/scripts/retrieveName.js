import { client } from './client.js'

const retrieveName = async () => {
  // Retrieve by full name (e.g., myname.dash)
  return client.platform.names.resolve('ajcwebdevtest.dash')
}

retrieveName()
  .then(data => console.log('Name retrieved:\n', data.toJSON()))
  .catch((e) => console.error('Something went wrong:\n', e))
  .finally(() => client.disconnect())