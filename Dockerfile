FROM node:lts-alpine

WORKDIR /app

COPY kreuziworti/package*.json ./
RUN npm ci

COPY kreuziworti/ ./
RUN npm run build

RUN apk add --no-cache caddy
COPY Caddyfile /etc/caddy/Caddyfile
