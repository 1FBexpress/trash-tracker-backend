# -------- Base stage: install deps, generate Prisma client, build TS --------
FROM node:20-alpine AS base
WORKDIR /app

COPY package.json tsconfig.json ./
RUN npm install --include=dev

COPY prisma ./prisma
RUN npx prisma generate || true

COPY src ./src
COPY scripts ./scripts
RUN npm run build || true

# -------- Runtime stage: minimal image to run the app --------
FROM node:20-alpine
WORKDIR /app

COPY --from=base /app/package.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist

# Apply DB migrations, then start the server
CMD sh -c "npx prisma migrate deploy || true && node dist/server.js"
