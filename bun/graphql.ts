import { createYoga, createSchema } from 'graphql-yoga'

const yoga = createYoga({
  schema: createSchema({
    typeDefs: `
      type Query {
        hello: String
      }
    `,
    resolvers: {
      Query: {
        hello: () => 'Hello from Yoga in a Bun app!'
      }
    }
  })
})

const server = Bun.serve(yoga)

console.info(
  `Server is running on ${new URL(
    yoga.graphqlEndpoint, `http://${server.hostname}:${server.port}`
  )}`
)