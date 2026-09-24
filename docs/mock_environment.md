# rodesk Mock Environment

## 1. 目的

mock 是 rodesk 前端开发使用的仿真环境。

目标：

- 支持前端独立开发
- 提供稳定测试数据
- 验证 UI 交互流程
- 模拟 Robot 和 Agent 行为

mock 不是生产 Robot Backend。

## 2. 架构

```text
rodesk web

    |
    |
Communication Layer

    |

mock server

    |

Simulated Data
```

## 3. 模拟能力

### Robot State

模拟：

- Robot connection
- Battery
- Mode
- Joint State
- Sensor Data

### Agent Event

模拟：

- Thinking
- Planning
- Executing
- Completed

### Teleoperation

模拟：

- Command input
- Command feedback
- Safety state

### Video

阶段一：

使用本地视频资源验证：

- Camera View
- HUD Overlay
- Control Layout

阶段二：

增加 WebRTC 流程模拟。

## 4. 使用原则

前端代码不应该依赖 mock 实现。

通过配置切换：

```text
Development
    |
    mock

Production
    |
    real robot system
```

保持通信接口一致。
