import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { NextRequest } from 'next/server'
import { appRouter } from '../../server/index'

export default async function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: '/api',
    router: appRouter,
    req,
    createContext: () => ({}),
  })
}

export const config = {
  runtime: 'edge'
}