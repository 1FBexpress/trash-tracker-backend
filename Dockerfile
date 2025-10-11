# ---------- build stage ----------
FROM node:20-bookworm-slim AS build
WORKDIR /app

# install deps (include dev so tsc & prisma cli are available for build)
COPY package.json tsconfig.json ./
COPY prisma ./prisma
RUN npm ci --include=dev
# generate Prisma client at build time
RUN npx prisma generate || true

# build TS
COPY src ./src
RUN npm run build

# ---------- runtime stage ----------
FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production

# install only prod deps
COPY package.json ./
RUN npm ci --omit=dev

# bring in the compiled app
COPY --from=build /app/dist ./dist
# bring prisma schema (needed for db push) 
COPY --from=build /app/prisma ./prisma

# (re)generate client in the runtime layer so it matches this image's node_modules
RUN npx prisma generate || true

EXPOSE 10000
# use /bin/sh (present) instead of bash (was missing before)
CMD ["sh","-c","npx prisma db push --accept-data-loss && node dist/server.js"]
