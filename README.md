# rodesk

rodesk 当前提供参考 DeepSeek Harness 风格的 Agent 前端。仓库可运行的是 Vue 3 Web 应用；Agent 页面使用本地 Mock 展示会话、流式回复和停止响应，不连接真实模型、工具或机器人服务。

## 环境要求

- 操作系统：推荐 Ubuntu 22.04 或更新版本。
- Node.js：22（`web/.nvmrc`）。
- pnpm：10 或更新版本。
- 可选：Docker 和 Docker Compose，用于容器方式启动。

如果使用 nvm，在进入 `web` 目录后执行 `nvm install` 和 `nvm use`。如果已自行安装 Node.js 22，可以跳过这两步。尚未安装 pnpm 时，可通过 Corepack 启用：

```bash
corepack enable
corepack prepare pnpm@10 --activate
```

## 本地运行

在仓库根目录执行：

```bash
cd web
pnpm install --frozen-lockfile
pnpm dev
```

按终端显示的地址打开页面，默认是 http://localhost:5173/。`/` 是 Agent 首页，`/agent` 会重定向到首页。停止开发服务器可按 `Ctrl+C`。

Agent 页面可创建和切换会话、发送消息，并停止正在生成的回复。演示回复为中性本地 Mock 文本，不代表真实模型输出；会话仅保存在页面内存中，刷新后会清空。运行 rodesk 不需要启动 DeepSeek Harness。

## 使用 Docker 运行

已安装 Docker 和 Docker Compose 时，在仓库根目录执行：

```bash
docker compose up --build
```

打开 http://localhost:5173/；停止并移除容器可执行：

```bash
docker compose down
```

Compose 会将 `web/` 挂载到容器中，供 Vite 开发服务器使用。

## 常用命令

以下命令均在 `web/` 目录执行：

```bash
pnpm run lint     # ESLint 检查
pnpm run build    # TypeScript 检查与生产构建
pnpm run preview  # 预览构建产物（先运行 build）
```

## 项目目录

```text
rodesk/
├── web/                 Vue 3 前端应用
├── docs/                设计与开发文档
├── docker/              Web 开发容器配置
└── docker-compose.yml   容器启动配置
```

Agent 模块的实现说明见 [Agent 模块说明](web/src/modules/agent/README.md)，设计依据见 [DeepSeek Harness 前端分析](docs/agent/deepseek-harness-frontend-analysis.md)。
