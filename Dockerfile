# ---------- build stage ----------
FROM node:20-bookworm-slim AS base
WORKDIR /app

# Install OpenSSL so Prisma works on Debian (no Alpine musl here)
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install deps
COPY package.json tsconfig.json ./
RUN npm install --include=dev

# Generate Prisma client at build time
COPY prisma ./prisma
RUN npx prisma generate || true

# Build TS
COPY src ./src
RUN npm run build

# ---------- runtime stage ----------
FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma
COPY package.json ./

EXPOSE 10000
# Run schema push on container start, then start server
CMD ["/bin/sh","-lc","npx prisma db push --accept-data-loss && node dist/server.js"]
