# rodesk Mock Protocol Design

## 1. 目的

mock 环境用于 rodesk 前端独立开发和测试。

它不是生产 Backend，也不实现机器人控制逻辑。

主要用途：

- UI 开发
- 状态展示测试
- Agent 交互测试
- Teleoperation 流程测试

## 2. 架构

```
rodesk web
    |
Communication Layer
    |
Mock Server
    |
Simulated Data
```

## 3. Mock 能力

### Robot State

模拟机器人状态：

```
robot.state
```

包含：

- connection state
- battery
- robot mode
- joint state
- sensor state

示例：

```json
{
  "type": "robot.state",
  "data": {
    "battery": 80,
    "mode": "idle"
  }
}
```

## 4. Agent Event

模拟 Agent 生命周期：

```
agent.event
```

状态包括：

- thinking
- planning
- executing
- completed

用于测试：

- Chat UI
- Tool Call
- Task Timeline

## 5. Teleoperation

模拟控制链路：

```
Virtual Joystick
        |
teleop.command
        |
Mock Server
        |
teleop.feedback
```

## 6. Video

分阶段实现：

### V1

使用本地视频资源模拟 Camera Stream。

目标：

- Camera UI
- Overlay
- HUD

### V2

增加 WebRTC Mock，用于验证真实媒体流程。

## 7. 使用原则

- Mock API 与真实协议保持一致
- 前端代码不区分 Mock 和 Production
- 通过配置切换数据源
- 不在 Mock 中实现机器人业务逻辑
