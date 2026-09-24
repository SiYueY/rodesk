# rodesk 开发环境规范

## 1. 目标

rodesk 是一个前端应用项目，开发环境需要保证：

- Ubuntu 22.04 可直接开发
- Docker 可复现开发环境
- CI 环境保持一致
- 前端依赖版本稳定

原则：

> 原生环境用于日常开发，Docker 用于环境复现、CI 和快速启动。

---

## 2. 基础开发环境

### Operating System

推荐：

```
Ubuntu 22.04 LTS
```

---

### Node.js

推荐：

```
Node.js 22 LTS
```

原因：

- Vue 3 生态成熟
- Vite 支持稳定
- Tauri 2 兼容性良好
- 长期维护周期适合作为项目基线

不固定使用最新 Node 版本，避免第三方依赖兼容风险。

---

### Package Manager

推荐：

```
pnpm 10
```

原因：

- 安装速度快
- 依赖管理稳定
- 适合现代前端项目

---

## 3. Frontend Stack

```
Vue 3
+
TypeScript
+
Vite
+
Pinia
+
Vue Router
```

UI：

```
Tailwind CSS
+
shadcn-vue
```

其中：

- shadcn-vue 用于基础 UI 组件
- 高实时交互组件（Joystick、HUD、Overlay）独立实现

---

## 4. Docker 开发支持

rodesk 支持 Docker，但不要求所有开发流程运行于 Docker。

推荐用途：

- CI 构建
- 新环境快速启动
- 开发环境复现

基础镜像：

```
node:22-bookworm
```

---

## 5. 开发模式

### Native Development

日常开发：

```
Ubuntu 22.04
    |
Node.js 22
    |
pnpm
    |
Vite Dev Server
```

优点：

- 热更新速度快
- IDE 调试方便
- 浏览器调试体验好

---

### Docker Development

用于：

```
Docker
 |
Node Environment
 |
Vite
 |
Mock Environment
```

保持开发环境一致。

---

## 6. Version Baseline

项目基线：

```
Ubuntu      22.04+
Node.js     22 LTS
pnpm        10+
Vue         3.x
TypeScript  5.x
Vite        latest stable
```
