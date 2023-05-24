import superjson from "superjson"
import { createRouter } from "./context"
import { exampleRouter } from "./example"
import { postRouter } from "./post"
import { protectedExampleRouter } from "./protected-example-router"

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("example.", exampleRouter)
  .merge("post.", postRouter)
  .merge("question.", protectedExampleRouter)

export type AppRouter = typeof appRouter