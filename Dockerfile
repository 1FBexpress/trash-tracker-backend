# ---------- Build stage ----------
FROM node:20-alpine AS base
WORKDIR /app

COPY package.json tsconfig.json ./
RUN npm install --include=dev

COPY src ./src
COPY scripts ./scripts

# Build TypeScript to dist (okay if there are TS warnings)
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine
WORKDIR /app

COPY --from=base /app/package.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist

CMD ["node", "dist/server.js"]
