# syntax=docker/dockerfile:1

########################
# Build stage
########################
FROM node:20-alpine AS base
WORKDIR /app

# Install dev deps (TypeScript, Prisma, etc.)
COPY package.json tsconfig.json ./
RUN npm install --include=dev

# Prisma: client + push schema (uses DATABASE_URL on Render)
COPY prisma ./prisma
RUN npx prisma generate || true
RUN npx prisma db push --accept-data-loss

# App source and build
COPY src ./src
COPY scripts ./scripts
RUN npm run build || true

########################
# Runtime stage
########################
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Only what we need to run
COPY --from=base /app/package.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma

EXPOSE 10000
CMD ["node", "dist/server.js"]
