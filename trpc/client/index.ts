import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { tap } from '@trpc/server/observable'
import fetch from 'node-fetch'
import type { AppRouter } from '../server/router'

const globalAny = global as any
globalAny.fetch = fetch as any

async function main() {
  const url = `http://localhost:2022`
  const trpc = createTRPCProxyClient<AppRouter>({
    links: [
      () => ({ op, next }) => {
        return next(op).pipe(
          tap({ next(result) {console.log(result.result)} }),
        )
      },
      httpBatchLink({ url }),
    ],
  })
  await Promise.all([
    trpc.hello.query(),
  ])
}

main()