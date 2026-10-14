FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate && pnpm install --prod --frozen-lockfile

COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["pnpm", "start"]
