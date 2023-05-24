import { api } from "../pages/index"

export function Hello() {
  const hello = api.hello.useQuery({ name: "Next.js Edge" })
  const { data, status, isSuccess, isError, error } = hello

  if (!data) {
    return <h3>Loading...</h3>
  }

  return (
    <div>
      <h3>Data Object</h3>
      <ul>
        <li><code>hello.data</code>: <b>{JSON.stringify(data)}</b></li>
        <li><code>hello.data?.text</code>: <b>{JSON.stringify(data?.text)}</b></li>
      </ul>

      <h3>Status Values</h3>
      <ul>
        <li><code>hello.status</code>: <b>{JSON.stringify(status)}</b></li>
        <li><code>hello.isSuccess</code>: <b>{JSON.stringify(isSuccess)}</b></li>
        <li><code>hello.isError</code>: <b>{JSON.stringify(isError)}</b></li>
        <li><code>hello.error</code>: <b>{JSON.stringify(error)}</b></li>
      </ul>
    </div>
  )
}