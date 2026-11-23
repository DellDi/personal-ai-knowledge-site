ARG NODE_IMAGE=node:22-alpine
ARG PNPM_VERSION=11.7.0

FROM ${NODE_IMAGE} AS deps
ARG PNPM_VERSION
WORKDIR /app
RUN npm install -g pnpm@${PNPM_VERSION}
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/mcp/package.json apps/mcp/package.json
RUN pnpm install --frozen-lockfile --filter @personal-ai-knowledge-site/mcp...

FROM deps AS build
COPY apps/mcp apps/mcp
RUN pnpm --filter @personal-ai-knowledge-site/mcp build

FROM ${NODE_IMAGE} AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/mcp/node_modules ./apps/mcp/node_modules
COPY --from=build /app/apps/mcp/dist ./apps/mcp/dist
COPY --from=build /app/apps/mcp/package.json ./apps/mcp/package.json
WORKDIR /app/apps/mcp
EXPOSE 3300
CMD ["node", "dist/index.js"]
