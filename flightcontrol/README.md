# Example project from A First Look at Flightcontrol (blog post coming soon)

## Flightcontrol Config

Flightcontrol contains its own infrastructure as code specification that is used in a `flightcontrol.json` file.

```json
{
  "environments": [
    {
      "id": "production",
      "name": "Production",
      "region": "us-west-2",
      "source": {
        "branch": "main"
      },
      "services": [
        {
          "id": "my-webapp",
          "name": "my-webapp",
          "type": "fargate",
          "cpu": 0.5,
          "memory": 1024,
          "minInstances": 1,
          "maxInstances": 1,
          "buildCommand": "npm i",
          "startCommand": "node index.js",
          "envVariables": {
            "APP_ENV": "production"
          },
          "port": 8080
        }
      ]
    }
  ]
}
```

## Node project with an Express server

We have a boilerplate Node application with Express that returns an HTML fragment.

```javascript
// index.js

const express = require("express")
const app = express()

const PORT = 8080
const HOST = '0.0.0.0'

app.get('/', (req, res) => {
  res.send('<h2>ajcwebdev-docker</h2>')
})

app.listen(PORT, HOST)
console.log(`Running on http://${HOST}:${PORT}`)
```

### Run server

```bash
node index.js
```

## Container image

You'll need to build a Docker image of your app to run this app inside a Docker container using the official Docker image.

### Dockerfile

Docker can build images automatically by reading the instructions from a [`Dockerfile`](https://docs.docker.com/engine/reference/builder/). A `Dockerfile` is a text document that contains all the commands a user could call on the command line to assemble an image. Using `docker build` users can create an automated build that executes several command-line instructions in succession.

```dockerfile
FROM node:14-alpine
LABEL org.opencontainers.image.source https://github.com/ajcwebdev/ajcwebdev-docker
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i
COPY . ./
EXPOSE 8080
CMD [ "node", "index.js" ]
```

### Build project with docker build

The [`docker build`](https://docs.docker.com/engine/reference/commandline/build/) command builds an image from a Dockerfile and a "context". A build’s context is the set of files located in the specified `PATH` or `URL`. Go to the directory with your `Dockerfile` and build the Docker image.

```bash
docker build . -t ajcwebdev-docker
```

The `-t` flag lets you tag your image so it's easier to find later using the `docker images` command.

### List Docker images with docker images

Your image will now be listed by Docker. The [`docker images`](https://docs.docker.com/engine/reference/commandline/images/) command will list all top level images, their repository and tags, and their size.

```bash
docker images
```

## Run the image

Docker runs processes in isolated containers. A container is a process which runs on a host. The host may be local or remote.

### Run Docker container with docker run

When an operator executes [`docker run`](https://docs.docker.com/engine/reference/run/), the container process that runs is isolated in that it has its own file system, its own networking, and its own isolated process tree separate from the host.

```bash
docker run -p 49160:8080 -d ajcwebdev/ajcwebdev-docker
```

`-d` runs the container in detached mode, leaving the container running in the background. The `-p` flag redirects a public port to a private port inside the container.

### List containers with docker ps

To test your app, get the port of your app that Docker mapped:

```bash
docker ps
```

### Print output of app with docker logs

```bash
docker logs <container id>
```

### Call app using curl

```bash
curl -i localhost:49160
```
