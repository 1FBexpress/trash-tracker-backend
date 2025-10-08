# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Copy manifests first to leverage Docker layer cache
COPY package.json ./
# If you later add a lockfile, copy it here:
# COPY package-lock.json ./

# Install deps (use npm install since we have no lockfile yet)
RUN npm install

# Copy the rest of the source
COPY . .

# Build TypeScript -> dist
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy built artifacts and node_modules from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/server.js"]
