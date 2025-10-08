# -------- Base stage: install deps, generate Prisma client, build TS --------
FROM node:20-alpine AS base
WORKDIR /app

COPY package.json tsconfig.json ./
RUN npm install --include=dev

# Prisma in build stage (for generate)
COPY prisma ./prisma
RUN npx prisma generate || true

# Build the app
COPY src ./src
COPY scripts ./scripts
RUN npm run build || true

# -------- Runtime stage: minimal image to run the app --------
FROM node:20-alpine
WORKDIR /app

# Bring what we need to run + run migrations
COPY --from=base /app/package.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
# 👇 THIS LINE FIXES THE ERROR: include schema & migrations at runtime
COPY --from=base /app/prisma ./prisma

# Apply DB migrations, then start the server
CMD sh -c "npx prisma migrate deploy || true && node dist/server.js"

