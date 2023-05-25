import { createYoga, createSchema } from 'graphql-yoga'

const yoga = createYoga({
  schema: createSchema({
    typeDefs: `type Query { hello: String }`,
    resolvers: {
      Query: {
        hello: () => 'Hello from Yoga in a Bun app!'
      }
    }
  })
})

const { hostname, port } = Bun.serve(yoga)

console.info(`Server running on ${new URL(yoga.graphqlEndpoint, `http://${hostname}:${port}`)}`)