# rodesk 前端领域模型设计

## 1. 目标

rodesk 作为 Robot Agent 前端，需要统一描述 Agent、机器人状态以及用户控制命令。

领域模型位于 Vue 应用和通信层之间，避免 UI 组件直接依赖 HTTP/WebSocket/WebRTC 协议。

## 2. 核心对象

## RobotState

描述机器人当前运行状态。

```ts
interface RobotState {
  id: string;
  name: string;
  mode: 'idle' | 'manual' | 'autonomous';
  connected: boolean;
  battery?: number;
  timestamp: number;
}
```

## SensorState

描述机器人传感器状态。

包括：

- Camera
- IMU
- LiDAR
- Joint State
- Navigation State

## AgentSession

描述一次 Agent 交互会话。

```ts
interface AgentSession {
  id: string;
  messages: AgentMessage[];
  status: AgentStatus;
}
```

## AgentEvent

Agent 执行过程事件。

事件类型：

- message
- thinking
- planning
- tool_call
- execution
- completed
- failed

## RobotCommand

用户或 Agent 对机器人的控制请求。

```ts
interface RobotCommand {
  type:
    | 'velocity'
    | 'joint'
    | 'cartesian'
    | 'action';
  timestamp: number;
}
```

## 3. 状态管理

Pinia Store 建议：

```
stores/
├── robot.ts
├── agent.ts
├── teleoperation.ts
└── connection.ts
```

## 4. 设计原则

- UI 不直接解析通信协议
- Domain Model 保持机器人无关
- 支持多机器人扩展
- 支持 Agent 和人工控制共享机器人接口
