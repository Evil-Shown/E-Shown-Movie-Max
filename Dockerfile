# Pin alpine3.20: Prisma 5 cannot detect OpenSSL on Alpine 3.21+ (/usr/lib vs /lib)
FROM node:22-alpine3.20 AS builder

RUN apk add --no-cache openssl

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

FROM node:22-alpine3.20 AS production

RUN apk add --no-cache tini curl openssl

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY packages/core/package.json ./packages/core/package.json

# HUSKY=0 skips the prepare script; husky is a devDependency and missing with --omit=dev
RUN HUSKY=0 npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/server/node_modules/.prisma ./server/node_modules/.prisma

WORKDIR /app/server

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -sf http://localhost:${PORT:-5000}/api/v1/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/src/index.js"]
