# rodesk 前端架构设计

## 1. 定位

rodesk 是一个面向机器人系统的前端交互应用，不包含 Robot Backend、Agent Runtime 或机器人控制逻辑。

前端通过 Communication Layer 连接外部系统，并将机器人能力转换为用户可理解的交互体验。

整体关系：

```
Human
 |
rodesk
 |
Communication Layer
 |
Robot Backend / Agent Runtime / Simulation
```

## 2. 前端分层

```
Vue Application

|
+----------------+
| Feature Module |
+----------------+

|
+----------------+
| Domain Model   |
+----------------+

|
+----------------+
| Services       |
+----------------+

|
External System
```

## 3. Feature Modules

### Agent Module

负责：

- 对话展示
- Agent 状态
- Tool Call 展示
- Task Timeline

目录：

```
agent/
├── components/
├── stores/
└── services/
```

### Robot Module

负责：

- Robot View
- Camera View
- HUD
- Sensor Overlay
- Map Visualization

目录：

```
robot/
├── components/
├── stores/
└── services/
```

### Teleoperation Module

负责：

- Virtual Joystick
- Control UI
- Safety Overlay

目录：

```
teleoperation/
├── components/
├── stores/
└── services/
```

## 4. Domain Layer

Domain Layer 定义前端统一模型，不直接暴露 ROS2 Message 或 Backend 数据结构。

主要模型：

- RobotState
- RobotCommand
- AgentEvent
- Session
- VideoStream

## 5. Services Layer

Services 负责通信封装：

```
services/
├── api/
├── websocket/
└── webrtc/
```

职责：

- API 请求
- WebSocket 状态订阅
- WebRTC 媒体连接

## 6. 状态管理

使用 Pinia 管理应用状态：

```
stores/
├── app.store.ts
├── connection.store.ts
├── robot.store.ts
├── agent.store.ts
└── teleop.store.ts
```

## 7. 设计原则

- UI 与通信协议解耦
- Feature Module 独立演进
- Domain Model 稳定优先
- 支持 Mock 与真实系统切换
