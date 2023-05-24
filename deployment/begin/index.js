exports.handler = async function http(req) {

  let html = `
<!doctype html>
<html lang=en>
  <head>
    <meta charset=utf-8>
    <title>This is a title</title>
    <link rel="stylesheet" href="https://static.begin.app/starter/default.css">
    <link href="data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" rel="icon" type="image/x-icon">
  </head>
  <body>
    <h1 class="center-text">
      I hath been shipped
    </h1>

    <p class="center-text">
      Nailed it
    </p>
  </body>
</html>`

  return {
    headers: {
      'content-type': 'text/html; charset=utf8',
      'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
    },
    statusCode: 200,
    body: html
  }
}
