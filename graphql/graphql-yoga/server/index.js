const { GraphQLServerLambda } = require('graphql-yoga')

const typeDefs = `
  type Query { hello: String }
`

const resolvers = {
  Query: {
    hello: () => 'Hello from GraphQL Yoga on Netlify!'
  }
}

const lambda = new GraphQLServerLambda({
  typeDefs, resolvers
})

exports.handler = lambda.handler