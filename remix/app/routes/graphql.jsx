import { useLoaderData } from "@remix-run/react"

const GET_CHARACTERS = `{
  characters {
    results {
      name
      id
    }
  }
}`

export let loader = async () => {
  const res = await fetch(
    'https://rickandmortyapi.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: GET_CHARACTERS
      })
    }
  )
  const { data }  = await res.json()
  return data.characters
}

export default function Index() {
  let { results } = useLoaderData()

  return (
    <>
      <ul>
        {results.map(({ name, id }) => (
          <li key={id}>
            {name}
          </li>
        ))}
      </ul>
    </>
  )
}