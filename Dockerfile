FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/content-contract/package.json packages/content-contract/package.json
RUN pnpm install --frozen-lockfile --filter @personal-ai-knowledge-site/web...

FROM deps AS build
COPY apps/web apps/web
COPY packages/content-contract packages/content-contract
RUN pnpm -C apps/web build

FROM node:24-alpine AS runtime
WORKDIR /app/apps/web
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/apps/web/node_modules /app/apps/web/node_modules
COPY --from=deps /app/packages/content-contract/package.json /app/packages/content-contract/package.json
COPY --from=build /app/packages/content-contract /app/packages/content-contract
COPY --from=build /app/apps/web/package.json ./package.json
COPY --from=build /app/apps/web/dist ./dist
EXPOSE 4321
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD wget -qO- http://127.0.0.1:4321/healthz || exit 1
CMD ["node", "dist/server/entry.mjs"]
