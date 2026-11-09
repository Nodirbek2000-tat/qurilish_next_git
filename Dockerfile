# Arxan — Next.js sayt va panel. 3 bosqich: kutubxonalar → build → kichik ishchi obraz
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Build paytida kerak (sahifalarga yozilib qoladi)
ARG SITE_URL=https://arxan.uz
ARG NEXT_PUBLIC_YANDEX_MAPS_KEY=""
ARG UPLOADS_ORIGIN=http://nginx:8080
ARG API_URL=http://django:8000
ENV SITE_URL=$SITE_URL NEXT_PUBLIC_YANDEX_MAPS_KEY=$NEXT_PUBLIC_YANDEX_MAPS_KEY \
    UPLOADS_ORIGIN=$UPLOADS_ORIGIN API_URL=$API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
RUN mkdir -p .next/cache && chown node:node .next/cache
USER node
EXPOSE 3000
CMD ["node", "server.js"]
