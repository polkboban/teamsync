FROM node:20-alpine
WORKDIR /app

# Install build dependencies
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm ci
RUN npx prisma generate

COPY . .

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && npx tsx prisma/seed.ts && npx tsx src/index.ts"]
