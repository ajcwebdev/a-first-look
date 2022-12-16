import type { AppType } from 'next/app'
import { trpc } from './index'

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />
}

export default trpc.withTRPC(MyApp)