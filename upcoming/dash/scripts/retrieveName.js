import { client } from './client.js'

const retrieveName = async () => {
  const { platform } = client
  const name = platform.names.resolve('ajcwebdevtest.dash')
  return name
}

retrieveName()
  .then(data => console.log(JSON.stringify(data)))
  .catch(error => console.error('Something went wrong:\n', error))
  .finally(() => client.disconnect())