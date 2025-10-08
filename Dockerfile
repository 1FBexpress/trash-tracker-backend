FROM node:20-alpine
WORKDIR /app

# install deps (include dev so ts-node/typescript are available at runtime)
COPY package.json ./
RUN npm install --include=dev

# copy the rest
COPY . .

EXPOSE 3000

# run TypeScript directly (no separate build step)
CMD ["node", "--loader", "ts-node/esm", "src/server.ts"]
