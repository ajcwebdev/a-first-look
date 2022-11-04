import { initTRPC } from '@trpc/server'

type Context = {}
export const t = initTRPC.context<Context>().create()