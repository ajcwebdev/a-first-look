import { api } from "../pages/index"

export function Hello() {
  const hello = api.hello.useQuery({ name: "Next.js Edge" })

  if (!hello.data) {
    return (
      <>
        <h1>Loading...</h1>
      </>
    )
  }

  return (
    <div>
      <h1>{hello.data.text}</h1>
    </div>
  )
}