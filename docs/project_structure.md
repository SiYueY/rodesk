# rodesk 项目结构设计

## 1. 项目定位

rodesk 是一个机器人前端交互应用，不包含 Robot Backend、Agent Runtime、ROS2 系统或硬件驱动实现。

项目负责：

- Robot Agent 用户交互
- Robot 状态可视化
- 视频与传感器展示
- Teleoperation UI
- Web/Desktop 前端应用

外部系统通过通信接口为 rodesk 提供机器人能力。

## 2. 总体结构

```text
rodesk/

├── web/              # Vue 前端应用
│
├── desktop/          # Tauri 桌面封装
│
├── mock/             # 前端开发仿真环境
│
├── docs/             # 项目文档
│
├── assets/           # 静态资源
│
└── scripts/          # 开发脚本
```

## 3. Web 前端结构

```text
web/src/

├── app/
│
├── modules/
│   ├── agent/
│   ├── robot/
│   ├── teleoperation/
│   └── workspace/
│
├── domain/
│
├── services/
│   ├── api/
│   ├── websocket/
│   └── webrtc/
│
├── stores/
│
├── components/
│
├── layouts/
│
└── main.ts
```

## 4. 分层原则

Feature Module:

负责业务 UI。

Domain:

负责机器人、Agent 和控制相关的数据模型。

Services:

负责与外部系统通信。

Components:

负责通用 UI 组件。

## 5. Desktop

desktop 使用 Tauri 对 web 应用进行封装。

共享：

- Vue Components
- Business Logic
- State Management

## 6. Mock Environment

mock 用于前端独立开发和 UI 测试，不属于生产机器人后端。
