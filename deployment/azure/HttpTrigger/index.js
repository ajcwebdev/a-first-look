module.exports = async function (context, req) {
  context.log('You did it!')

  const name = (req.query.name || (req.body && req.body.name))
  const responseMessage = name
    ? "Hello, " + name + ". It worked!"
    : "It worked! Pass a name for a personalized response."

  context.res = {
    status: 200,
    body: responseMessage
  }
}