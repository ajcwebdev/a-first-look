FROM oven/bun:alpine AS base
WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .
RUN bun run build

EXPOSE 3000

RUN mkdir -p /app/storage

CMD ["bun", "run", "start"]