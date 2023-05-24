const express = require("express")
const {
  getGraphQLParameters,
  processRequest,
  renderGraphiQL,
  shouldRenderGraphiQL,
} = require("graphql-helix")
const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} = require("graphql")

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: () => ({
      hello: {
        type: GraphQLString,
        resolve: () => "Hello from GraphQL Helix on Docker!",
      }
    }),
  }),
})

const app = express()

app.use(express.json())

app.use("/graphql", async (req, res) => {
  const request = {
    body: req.body,
    headers: req.headers,
    method: req.method,
    query: req.query,
  }

  if (shouldRenderGraphiQL(request)) {
    res.send(renderGraphiQL())
  }

  else {
    const {
      operationName,
      query,
      variables
    } = getGraphQLParameters(request)

    const result = await processRequest({
      operationName,
      query,
      variables,
      request,
      schema,
    })

    if (result.type === "RESPONSE") {
      result.headers.forEach((
        { name, value }
      ) => res.setHeader(name, value))
      res.status(result.status)
      res.json(result.payload)
    }
  }
})

const port = process.env.PORT || 8080

app.listen(port, () => {
  console.log(`GraphQL server is running on port ${port}.`)
})