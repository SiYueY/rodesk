# rodesk Communication Contract

## 1. 定位

rodesk 是前端应用，不包含 Robot Backend 实现。

Communication Layer 属于 rodesk 前端，用于封装外部系统访问接口。

职责：

- 管理连接
- 封装通信协议
- 转换为 rodesk Domain Model

不负责：

- ROS2 通信
- 硬件驱动
- Agent Runtime
- 机器人控制算法

## 2. 架构

```text
rodesk

 |
 |
services

 +-- REST Client
 +-- WebSocket Client
 +-- WebRTC Client

 |

External Robot System
```

## 3. REST API

用于非实时交互：

- 初始化
- 配置读取
- Robot 信息
- Session 管理

## 4. WebSocket

用于实时双向通信。

消息分类：

### Robot

```
robot.state
robot.sensor
```

### Agent

```
agent.event
agent.tool_call
```

### Teleoperation

```
teleop.command
teleop.feedback
```

## 5. WebRTC

用于实时媒体：

- Camera Stream
- Audio Stream

视频采用 Camera First 设计，控制和状态信息通过 Overlay UI 展示。

## 6. Domain Model

Frontend 不直接依赖：

- ROS2 Message
- Backend Internal API

所有外部数据转换为 rodesk Domain Model。

## 7. Mock Support

开发阶段通过 mock 环境模拟通信接口。

生产环境替换为真实 Robot System 时，Frontend API 保持不变。
