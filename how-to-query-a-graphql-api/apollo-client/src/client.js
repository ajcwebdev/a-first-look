import ApolloClient from "apollo-boost"

const endpoint = 'https://rickandmortyapi.com/graphql'

export const client = new ApolloClient({
  uri: endpoint
})