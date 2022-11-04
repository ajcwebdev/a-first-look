import {
  Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration
} from "@remix-run/react"

export const links = () => {
  return [{
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css"
  }]
}

export const meta = () => ({
  charset: "utf-8",
  title: "A First Look at Remix with GraphQL",
  viewport: "width=device-width,initial-scale=1",
})

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}