COPY prisma ./prisma
# Generate Prisma client during build so it’s baked into the image
RUN npx prisma generate || true
# Apply schema to the database
RUN npx prisma db push --accept-data-loss
COPY package.json tsconfig.json ./
RUN npm install --include=dev

COPY prisma ./prisma
# Generate Prisma client during build so it’s baked into the image
RUN npx prisma generate || true
# Apply schema to the database
RUN npx prisma db push --accept-data-loss

COPY src ./src
COPY scripts ./scripts
RUN npm run build || true
