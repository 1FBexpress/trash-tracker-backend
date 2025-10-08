# Build-and-run Dockerfile (no ts-node loader)
FROM node:20-alpine AS base
WORKDIR /app

# Install deps (dev deps included so we can build)
COPY package.json tsconfig.json ./
RUN npm install --include=dev

# Copy source (only what we need)
COPY src ./src
COPY scripts ./scripts

# Build TypeScript to dist/
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine
WORKDIR /app

# Copy only what's needed to run
COPY --from=base /app/package.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 3000

# Start compiled server
CMD ["node", "dist/server.js"]
