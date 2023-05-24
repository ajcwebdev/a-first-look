import React from "react"
import { render } from "react-dom"
import { ApolloProvider } from "@apollo/react-hooks"
import { client } from "../src/client.js"
import Characters from "../src/Characters.js"

render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <h1>Apollo Client</h1>
      <Characters />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById("root")
)