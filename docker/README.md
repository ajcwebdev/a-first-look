# Example project from [A First Look at Docker](https://dev.to/ajcwebdev/a-first-look-at-docker-3hfg)

[Docker](https://www.docker.com/) is a set of tools that use OS-level virtualization to deliver software in isolated packages called containers. Containers bundle their own software, libraries and configuration files. They communicate with each other through well-defined channels and use fewer resources than virtual machines.

## Outline

* Node project with an Express server
  * Run server
* Container image
  * Dockerfile
  * dockerignore
  * Build project with docker build
  * List Docker images with docker images
* Run the image
  * Run Docker container with docker run
  * List containers with docker ps
  * Print output of app with docker logs
  * Call app using curl
* Docker Compose file
  * Create and start containers with docker compose up
* Push your project to a GitHub repository
  * Initialize Git
  * Create a new blank repository
* Publish to GitHub Container Registry
  * Login to ghcr with docker login
  * Tag image with docker tag
  * Push to registry with docker push
  * Pull your image with docker pull

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

You'll need to build a Docker image of your app to run this app inside a Docker container using the official Docker image. We will need two files: `Dockerfile` and `.dockerignore`.

### Dockerfile

Docker can build images automatically by reading the instructions from a [`Dockerfile`](https://docs.docker.com/engine/reference/builder/). A `Dockerfile` is a text document that contains all the commands a user could call on the command line to assemble an image. Using `docker build` users can create an automated build that executes several command-line instructions in succession.

The `FROM` instruction initializes a new build stage and sets the Base Image for subsequent instructions. A valid `Dockerfile` must start with `FROM`. The first thing we need to do is define from what image we want to build from. We will use version `14-alpine` of `node` available from [Docker Hub](https://hub.docker.com/_/node) because the universe is chaos and you have to pick something so you might as well pick something with a smaller memory footprint.

```dockerfile
FROM node:14-alpine
```

The `LABEL` instruction is a key-value pair that adds metadata to an image.

```dockerfile
LABEL org.opencontainers.image.source https://github.com/ajcwebdev/ajcwebdev-docker
```

The `WORKDIR` instruction sets the working directory for our application to hold the application code inside the image. 

```dockerfile
WORKDIR /usr/src/app
```

This image comes with Node.js and NPM already installed so the next thing we need to do is to install our app dependencies using the `npm` binary. The `COPY` instruction copies new files or directories from `<src>`. The `COPY` instruction bundles our app's source code inside the Docker image and adds them to the filesystem of the container at the path `<dest>`.

```dockerfile
COPY package*.json ./
```

The `RUN` instruction will execute any commands in a new layer on top of the current image and commit the results. The resulting committed image will be used for the next step in the `Dockerfile`. Rather than copying the entire working directory, we are only copying the `package.json` file. This allows us to take advantage of cached Docker layers.

```dockerfile
RUN npm i
COPY . ./
```

The `EXPOSE` instruction informs Docker that the container listens on the specified network ports at runtime. Our app binds to port `8080` so you'll use the `EXPOSE` instruction to have it mapped by the `docker` daemon.

```dockerfile
EXPOSE 8080
```

Define the command to run the app using `CMD` which defines our runtime. The main purpose of a `CMD` is to provide defaults for an executing container. Here we will use `node index.js` to start our server.

```dockerfile
CMD ["node", "index.js"]
```

Our complete `Dockerfile`.

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

### dockerignore

Before the Docker CLI sends the context to the docker daemon, it looks for a file named `.dockerignore` in the root directory of the context. If this file exists, the CLI modifies the context to exclude files and directories that match patterns in it. This helps avoid sending large or sensitive files and directories to the daemon.

```
node_modules
Dockerfile
.dockerignore
.git
.gitignore
npm-debug.log
```

### Build project with docker build

The [`docker build`](https://docs.docker.com/engine/reference/commandline/build/) command builds an image from a Dockerfile and a "context". A build’s context is the set of files located in the specified `PATH` or `URL`. The `URL` parameter can refer to three kinds of resources:
* Git repositories
* Pre-packaged tarball contexts
* Plain text files

Go to the directory with your `Dockerfile` and build the Docker image.

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

## Docker Compose file

[Compose](https://docs.docker.com/compose/) is a tool for defining and running multi-container Docker applications. After configuring your application’s services with a YAML file, you can create and start all your services with a single command. Define the services that make up your app in `docker-compose.yml` so they can be run together in an isolated environment.

```yaml
version: "3.9"
services:
  web:
    build: .
    ports:
      - "49160:8080"
```

### Create and start containers with docker compose up

The `docker compose up` command aggregates the output of each container. It builds, (re)creates, starts, and attaches to containers for a service.

```bash
docker compose up
```

## Push your project to a GitHub repository

We can publish this image to the GitHub Container Registry with GitHub Packages. This will require pushing our project to a GitHub repository. Before initializing Git, create a `.gitignore` file for `node_modules` and our environment variables.

```bash
echo 'node_modules\n.DS_Store\n.env' > .gitignore
```

It is a good practice to ignore files containing environment variables to prevent sensitive API keys being committed to a public repo. This is why I have included `.env` even though we don't have a `.env` file in this project right now.

### Initialize Git

```bash
git init
git add .
git commit -m "I can barely contain my excitement"
```

### Create a new blank repository

You can create a blank repository by visiting [repo.new](https://repo.new) or using the [`gh repo create`](https://cli.github.com/manual/gh_repo_create) command with the [GitHub CLI](https://cli.github.com/). Enter the following command to create a new repository, set the remote name from the current directory, and push the project to the newly created repository.

```bash
gh repo create ajcwebdev-docker \
  --public \
  --source=. \
  --remote=upstream \
  --push
```

If you created a repository from the GitHub website instead of the CLI then you will need to set the remote and push the project with the following commands.

```bash
git remote add origin https://github.com/ajcwebdev/ajcwebdev-docker.git
git push -u origin main
```

## Publish to GitHub Container Registry

[GitHub Packages](https://docs.github.com/en/packages/learn-github-packages/introduction-to-github-packages) is a platform for hosting and managing packages that combines your source code and packages in one place including containers and other dependencies. You can integrate GitHub Packages with GitHub APIs, GitHub Actions, and webhooks to create an end-to-end DevOps workflow that includes your code, CI, and deployment solutions.

GitHub Packages offers different package registries for commonly used package managers, such as npm, RubyGems, Maven, Gradle, and Docker. GitHub's [Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry) is optimized for containers and supports Docker and OCI images.

### Login to ghcr with docker login

To login, create a [PAT (personal access token)](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) with the ability to read, write, and delete packages and include it instead of `xxxx`.

```bash
export CR_PAT=xxxx
```

Login with your own username in place of `ajcwebdev`.

```bash
echo $CR_PAT | docker login ghcr.io -u ajcwebdev --password-stdin
```

### Tag image with docker tag

```bash
docker tag ajcwebdev-docker ghcr.io/ajcwebdev/ajcwebdev-docker
```

### Push to registry with docker push

```bash
docker push ghcr.io/ajcwebdev/ajcwebdev-docker:latest
```

### Pull your image with docker pull

To test that our project has a docker image published to a public registry, pull it from your local development environment.

```bash
docker pull ghcr.io/ajcwebdev/ajcwebdev-docker
```

You can view this published container [on my GitHub](https://github.com/users/ajcwebdev/packages/container/package/ajcwebdev-docker).
