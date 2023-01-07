'use strict'

module.exports.handler = async (event) => {
  const message = `Cause I don't want a server, but I do still want a container`
  return {
    statusCode: 200,
    body: JSON.stringify(
      { message }, null, 2
    ),
  }
}