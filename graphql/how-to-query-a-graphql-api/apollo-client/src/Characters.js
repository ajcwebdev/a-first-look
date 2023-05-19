import { GET_CHARACTERS_QUERY } from "../src/getCharacters.js"
import { useQuery } from "@apollo/react-hooks"

export default function Characters() {
  const {
    data,
    loading,
    error
  } = useQuery(GET_CHARACTERS_QUERY)

  const characters = data?.characters

  if (loading) return <p>Almost there...</p>
  if (error) return <p>{error.message}</p>

  return (
    <>
      <pre>
        {JSON.stringify(characters, null, "  ")}
      </pre>
    </>
  )
}