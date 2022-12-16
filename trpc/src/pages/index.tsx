import { httpBatchLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import type { AppRouter } from '../server/index'
import { Hello } from "../components/Hello"

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return ''
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({ url: getBaseUrl() + '/api' })
      ]
    }
  },
  ssr: true
})

export default function Index() {
  const result = trpc.hello.useQuery({ name: 'Next.js Edge' })

  if (!result.data) {
    return (
      <><h1>Loading...</h1></>
    )
  }

  return (
    <>
      <h1>{result.data.text}</h1>
      <Hello />
    </>
  )
}