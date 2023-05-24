# Example Project from [A First Look at Fly](https://ajcwebdev.com/2021/08/04/a-first-look-at-fly/)

[Fly](https://fly.io/) is a platform for full stack applications and databases that need to run globally. Fly executes your code close to users and scales compute in cities where your app is busiest. You can run arbitrary Docker containers and host popular databases like Postgres.

## Clone Repo and Navigate to Project

```bash
git clone https://github.com/ajcwebdev/a-first-look.git
cd deployment/docker-fly
```

## Fly Setup

### Install flyctl

You can download the CLI on [Mac, Linux, or Windows](https://fly.io/docs/getting-started/installing-flyctl/).

```bash
brew install superfly/tap/flyctl
```

### Create Fly Account

```bash
flyctl auth signup
```

### Login to Fly Account

```bash
flyctl auth login
```

## 2. Node server with Express in `index.js`

```javascript
const express = require("express")
const app = express()

const port = process.env.PORT || 3000

app.get(
  "/", (req, res) => {
    greeting = "<h1>ajcwebdev-fly</h1>"
    res.send(greeting)
  }
)

app.listen(
  port,
  () => console.log(`Hello from port ${port}!`)
)
```

### Run server

```bash
node index.js
```

```
Hello from port 3000!
```

![01-hello-world-localhost](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/z6dt6up0b24u2gu45fsc.png)

### Dockerfile

```dockerfile
FROM node:14-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i
COPY . ./
EXPOSE 8080
CMD [ "node", "index.js" ]
```

### .dockerignore

```
node_modules
Dockerfile
.dockerignore
.git
.gitignore
npm-debug.log
```

## 3. Launch app on Fly with `flyctl launch`

Run `flyctl launch` in the directory with your source code to configure your app for deployment. This will create and configure a fly app by inspecting your source code and prompting you to deploy.

```bash
flyctl launch --name ajcwebdev-fly --region sjc
```

This creates a `fly.toml` file.

```toml
app = "ajcwebdev-fly"

kill_signal = "SIGINT"
kill_timeout = 5

[env]

[experimental]
  allowed_public_ports = []
  auto_rollback = true

[[services]]
  http_checks = []
  internal_port = 8080
  protocol = "tcp"
  script_checks = []

[services.concurrency]
  hard_limit = 25
  soft_limit = 20
  type = "connections"

[[services.ports]]
  handlers = ["http"]
  port = 80

[[services.ports]]
  handlers = ["tls", "http"]
  port = 443

[[services.tcp_checks]]
  grace_period = "1s"
  interval = "15s"
  restart_limit = 6
  timeout = "2s"
```

Add the following `PORT` number under `env`.

```toml
[env]
  PORT = 8080
```

### Deploy application with `flyctl deploy`

```bash
flyctl deploy
```

### Show the application's current status with `flyctl status`

```bash
flyctl status
```

### Open browser to current deployed application with `flyctl open`

```bash
flyctl open
```

```
Opening http://ajcwebdev-fly.fly.dev/
```

Visit [ajcwebdev-fly.fly.dev](http://ajcwebdev-fly.fly.dev/) to see the site.

![02-ajcwebdev-fly-dev](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/c8z7js20jh2r8ld9degx.png)
