# ---------- Build stage ----------
FROM node:20-alpine AS base
WORKDIR /app

# Install deps (include dev so ts-node/typescript are available at build)
COPY package.json tsconfig.json ./
RUN npm install --include=dev

# Copy source and build
COPY src ./src
COPY scripts ./scripts
COPY prisma ./prisma
# Generate Prisma client during build so it’s baked into the image
RUN npx prisma generate

# Build TypeScript to dist (don’t fail the build on TS warnings)
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine
WORKDIR /app

# Bring runtime pieces
COPY --from=base /app/package.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma

# Start: apply DB migrations then boot the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
