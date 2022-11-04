[Architect](https://arc.codes/) is an Infrastructure as Code framework for provisioning build artifacts. Architect defines a high level manifest file in multiple open text formats which can be checked into version control. It compiles the manifest code into AWS CloudFormation and then deploys that stack. Supported formats include:
* a native text file format `app.arc`
* `package.json`
* `arc.json`
* `arc.yaml`
* `arc.toml`

### Install dependencies

```bash
npm i -g @architect/architect aws-sdk
```

### Check version

```bash
arc version
```

### Start local development server

Architect projects work locally and offline. `arc sandbox` emulates most app resources defined in `app.arc`:

```bash
arc sandbox
```

### app.arc

`@app` declares the application namespace. `@http` defines HTTP routes in API Gateway with Lambda handler functions.

```arc
@app
ajcwebdev-architect

@http
get /
```

### config.arc

`@aws` defines AWS specific configuration.

```arc
@aws
runtime nodejs12.x
```

### index.js

```javascript
exports.handler = async function http (req) {
  return {
    statusCode: 200,
    headers: {
      'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
      'content-type': 'text/html; charset=utf8'
    },
    body: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">

          <title>ajcwebdev</title>

          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            }
            .max-width-320 {
              max-width: 20rem;
            }
            .margin-left-8 {
              margin-left: 0.5rem;
            }
            .margin-bottom-16 {
              margin-bottom: 1rem;
            }
            .margin-bottom-8 {
              margin-bottom: 0.5rem;
            }
            .padding-32 {
              padding: 2rem;
            }
            .color-grey {
              color: #333;
            }
            .color-black-link:hover {
              color: black;
            }
          </style>
        </head>

        <body class="padding-32">
          <div class="max-width-320">
            <div class="margin-left-8">
              <div class="margin-bottom-16">
                <h1 class="margin-bottom-16">
                  ajcwebdev
                </h1>
                <p class="margin-bottom-8">
                  shipshape
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  }
}
```

![02-arc-hello-world-edit](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/m53jtk1iekdmdannaaui.png)

## Deploy to staging environment

```bash
arc deploy
```

## Deploy to production environment

```bash
arc deploy production
```