FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/cms/package.json apps/cms/package.json
COPY packages/content-contract/package.json packages/content-contract/package.json
RUN pnpm install --frozen-lockfile --filter @personal-ai-knowledge-site/cms...

FROM deps AS source
COPY packages/content-contract packages/content-contract
COPY apps/cms apps/cms

FROM source AS init
WORKDIR /app/apps/cms
CMD ["sh", "-c", "pnpm db:init"]

FROM source AS build
RUN pnpm --filter @personal-ai-knowledge-site/cms build

FROM node:22-alpine AS runtime
WORKDIR /app
RUN corepack enable
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/cms/node_modules ./apps/cms/node_modules
COPY --from=build /app/apps/cms/.next ./apps/cms/.next
COPY --from=build /app/apps/cms/package.json ./apps/cms/package.json
COPY --from=build /app/apps/cms/next.config.mjs ./apps/cms/next.config.mjs
COPY --from=build /app/packages/content-contract ./packages/content-contract
WORKDIR /app/apps/cms
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 CMD wget -qO- http://127.0.0.1:3000/api/access || exit 1
CMD ["sh", "-c", "node_modules/.bin/next start --port 3000"]
