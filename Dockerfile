FROM node:22-alpine AS base
WORKDIR /app/game-server

COPY game-server/package*.json ./
RUN npm ci

COPY game-server/ ./
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine AS runner
WORKDIR /app/game-server
ENV NODE_ENV=production

COPY --from=base /app/game-server/package*.json ./
COPY --from=base /app/game-server/node_modules ./node_modules
COPY --from=base /app/game-server/build ./build

EXPOSE 2567
ENV PORT=2567

CMD ["node", "build/index.js"]
