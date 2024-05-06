export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const key = url.pathname.slice(1)

    switch (request.method) {
      case 'PUT':
        await env.MY_BUCKET.put(key, request.body)
        return new Response(`env ${JSON.stringify(env)} Put successfully by ${url}`)

      case 'GET':
        const object = await env.MY_BUCKET.get(key)
        if (object === null) {
          return new Response('Object Not Found', { status: 404 })
        }
        const headers = new Headers()
        object.writeHttpMetadata(headers)
        headers.set('etag', object.httpEtag)
        headers.set("Content-Type", "text/html")
        return new Response(
          `env ${JSON.stringify(env)} JSON object ${JSON.stringify(object)} and MY_BUCKET ${JSON.stringify(env.MY_BUCKET)}`, object.body, { headers }
        )

      case 'DELETE':
        await env.MY_BUCKET.delete(key)
        return new Response(`Request ${JSON.stringify(request)} deleted`)
      default:
        return new Response('Method is not allowed', {
          status: 405,
          headers: { Allow: 'PUT, GET, DELETE' },
        })
    }
  },
}