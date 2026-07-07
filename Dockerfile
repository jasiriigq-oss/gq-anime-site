FROM oven/bun:latest AS base
WORKDIR /app/game-server

# Install git so npm can resolve git-based dependencies
RUN apt update && apt install git -y

COPY game-server/package.json ./
COPY game-server/bun.lock ./

RUN bun i

COPY game-server/ ./

# ENV NODE_ENV=production

EXPOSE 2567
ENV PORT=2567

CMD ["bun", "src/index.ts"]
