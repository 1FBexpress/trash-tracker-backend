# Simple one-stage image that runs TS directly via ts-node (no compile step)
FROM node:20-alpine
WORKDIR /app

# Install deps (include dev so ts-node/typescript are available at runtime)
COPY package.json ./
RUN npm install --include=dev

# Copy the rest
COPY . .

# App listens on 3000
EXPOSE 3000

# Run the server with ts-node/ESM
CMD ["node", "--loader", "ts-node/esm", "src/server.ts"]
