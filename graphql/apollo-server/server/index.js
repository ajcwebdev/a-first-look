const { ApolloServer, gql } = require('apollo-server')

const typeDefs = gql`
  type Query { hello: String }
`

const resolvers = {
  Query: {
    hello: () => "Hello from Apollo Server Core!",
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server.listen().then(
  ({ url }) => {
    console.log(`Server ready at ${url}`)
  }
)