# ---------- build stage ----------
FROM node:20-bookworm-slim AS base
WORKDIR /app

# Install deps (dev included so tsc & prisma run)
COPY package.json tsconfig.json ./
RUN npm install --include=dev

# Prisma schema & client
COPY prisma ./prisma
RUN npx prisma generate || true

# Build the app
COPY src ./src
RUN npm run build

# ---------- runtime stage ----------
FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production

# Copy built artifacts and only runtime deps
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma
COPY package.json ./

# Render will route traffic to whatever port we listen on; 10000 is fine
EXPOSE 10000

# Run Prisma schema sync at container start, then start the server
CMD ["bash","-lc","npx prisma db push && node dist/server.js"]
