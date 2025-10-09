# ---------- build stage ----------
FROM node:20-bookworm-slim AS base
WORKDIR /app

# Install OS deps needed by Prisma engines
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install deps
COPY package.json tsconfig.json ./
RUN npm install --include=dev

# Prisma client (generated at build so it's baked into the image)
COPY prisma ./prisma
RUN npx prisma generate || true

# Build the app
COPY src ./src
RUN npm run build

# ---------- runtime stage ----------
FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production

# Install OS deps (runtime)
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy built artifacts and node_modules
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma
COPY package.json ./

# Render will route to whatever port we listen on; 10000 is fine
EXPOSE 10000

# Run Prisma schema sync at container start, then start the server
CMD ["/bin/sh","-lc","npx prisma db push --accept-data-loss && node dist/server.js"]
