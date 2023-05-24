FROM node:14-alpine
LABEL org.opencontainers.image.source https://github.com/ajcwebdev/ajcwebdev-express-graphql-docker
WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn
COPY . ./
EXPOSE 8080
CMD [ "node", "index" ]