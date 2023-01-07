import gql from "graphql-tag"

export const GET_CHARACTERS_QUERY = gql`
  query getCharacters {
    characters {
      results {
        name
    }
  }
}
`