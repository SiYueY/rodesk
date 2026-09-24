FROM node:22-bookworm

WORKDIR /workspace

COPY web/package.json ./web/package.json
COPY web/pnpm-lock.yaml ./web/pnpm-lock.yaml

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /workspace/web
RUN pnpm install --frozen-lockfile

COPY web .

EXPOSE 5173

CMD ["pnpm", "dev", "--host", "0.0.0.0"]
