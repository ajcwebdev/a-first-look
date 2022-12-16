import { trpc } from "../pages/index"

export function Hello() {
  const hello = trpc.hello.useQuery({ name: "from React Query" })
  
  return (
    <div>
      <p>Data: {JSON.stringify(hello.data)}</p>
      <p>Text: {JSON.stringify(hello.data?.text)}</p>
      <p>tRPC: {JSON.stringify(hello.trpc)}</p>
      <p>tRPC Path: {JSON.stringify(hello.trpc.path)}</p>
      <p>Status: {JSON.stringify(hello.status)}</p>
    </div>
  )
}