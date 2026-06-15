FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10 --activate

# --- Dependencies ---
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# --- Build API ---
FROM deps AS build
WORKDIR /app
COPY packages/types/ ./packages/types/
RUN pnpm --filter @turno-ya/types build
COPY apps/api/ ./apps/api/
RUN pnpm --filter @turno-ya/api build
RUN pnpm --filter @turno-ya/api deploy --legacy --prod /app/deployed
RUN cp -r /app/apps/api/dist /app/deployed/dist

# --- Production ---
FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=build /app/deployed ./

EXPOSE 3001
CMD ["node", "dist/main"]
