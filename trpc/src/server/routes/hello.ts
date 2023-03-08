import { publicProcedure } from '../context'
import { z } from 'zod'

export const helloRouter = publicProcedure
  .input(
    z.object({
      name: z.string().nullish()
    })
  )
  .query(({ input }) => {
    return {
      text: `hello from ${input?.name ?? 'input fallback'}`
    }
  })