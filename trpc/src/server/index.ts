import { router } from './context'
import { helloRouter } from './routes/hello'

export const appRouter = router({
  hello: helloRouter
})

export type AppRouter = typeof appRouter