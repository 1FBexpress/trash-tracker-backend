# ---------- build stage ----------
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl1.1-compat

# Install deps
COPY package.json tsconfig.json ./
RUN npm install --include=dev

# Prisma client at build
COPY prisma ./prisma
RUN npx prisma generate || true

# Build the app
COPY src ./src
RUN npm run build

# ---------- runtime stage ----------
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl1.1-compat
ENV NODE_ENV=production

# Copy build artifacts and node_modules
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma
COPY package.json ./

EXPOSE 10000

# If Render uses the Dockerfile CMD, this does the same as the override
CMD ["/bin/sh","-lc","npx prisma db push --accept-data-loss && node dist/server.js"]
