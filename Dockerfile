FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY packages/core/package.json ./packages/core/package.json

RUN npm ci

COPY server/ ./server
COPY packages/core/ ./packages/core

WORKDIR /app/server
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS production

RUN apk add --no-cache tini curl

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY packages/core/package.json ./packages/core/package.json

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/server/node_modules/.prisma ./server/node_modules/.prisma

WORKDIR /app/server

RUN chown -R node:node /app

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -sf http://localhost:5000/api/v1/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/src/index.js"]
