FROM node:14-alpine as builder
LABEL org.opencontainers.image.source https://github.com/ajcwebdev/redwood-docker-compose

WORKDIR /app

COPY web web
COPY .nvmrc .
COPY graphql.config.js .
COPY package.json .
COPY redwood.toml .
COPY yarn.lock .

RUN yarn install --frozen-lockfile
RUN yarn rw build web
RUN rm -rf ./web/src

FROM nginx as runner

COPY --from=builder /app/web/dist /usr/share/nginx/html
COPY web/nginx.conf /etc/nginx/conf.d/default.conf

RUN ls -lA /usr/share/nginx/html

EXPOSE 8910
