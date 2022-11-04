import { createHTTPServer } from '@trpc/server/adapters/standalone'
import { appRouter } from './router'

const { listen } = createHTTPServer({
  router: appRouter,
})

listen(2022)