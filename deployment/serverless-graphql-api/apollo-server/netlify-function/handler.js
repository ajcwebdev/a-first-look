const { ApolloServer, gql } = require('apollo-server-lambda')

const typeDefs = gql`
  type Query { hello: String }
`

const resolvers = {
  Query: {
    hello: () => "Hello from Apollo Server Lambda on Netlify!",
  }
}

const server = new ApolloServer({
  typeDefs, resolvers,
})

const handler = server.createHandler()

module.exports = { handler }