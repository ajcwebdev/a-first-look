import { t } from './context'

export const appRouter = t.router({
  hello: t.procedure.query(
    () => `hello world`
  )
})

export type AppRouter = typeof appRouter