FROM --platform=linux/x86_64 node:16-slim
LABEL org.opencontainers.image.source https://github.com/ajcwebdev/ajcwebdev-marko
WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn
COPY . ./
RUN yarn build
EXPOSE 3000
CMD [ "yarn", "dev" ]