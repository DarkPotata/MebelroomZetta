FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma

COPY package.json ./
RUN npm install --registry=https://registry.npmmirror.com --no-audit --no-fund

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json index.ts ./
RUN npm run build

RUN mkdir -p /app/data

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && npm start"]