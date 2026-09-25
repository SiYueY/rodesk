# DeepSeek Harness Agent UI 迁移与 rodesk Agent Module 实现计划

## 1. 背景与目标

### 1.1 项目背景

rodesk 是一个面向机器人系统的人机交互桌面应用。

当前前端技术栈：

-   Vue 3
-   TypeScript
-   Vite
-   Pinia
-   Tailwind CSS
-   shadcn-vue

项目定位：

> Lightweight Robot Interaction Workspace

rodesk 不定位为机器人开发平台、Agent 平台、插件生态系统或 IDE。

------------------------------------------------------------------------

## 1.2 目标

本阶段目标：

参考 DeepSeek Harness 前端源码，实现 rodesk Agent Module。

重点不是重新设计 Agent UI，而是：

DeepSeek Harness 前端源码

↓

分析成熟 UI 结构和交互逻辑

↓

迁移到 rodesk Vue3 工程

↓

形成 rodesk Agent Workspace

最终效果：

DeepSeek Harness Agent UX + Vue3 工程实现 + Robot Context 扩展。

------------------------------------------------------------------------

## 2. DeepSeek Harness 源码分析范围

重点分析：

-   UI Layout
-   Agent Conversation
-   Message 模型
-   Tool Call 展示
-   Streaming 交互
-   状态管理
-   Service/Connection 分层

不重点分析：

-   后端 Agent Runtime
-   模型调用逻辑
-   插件生态
-   平台化能力

------------------------------------------------------------------------

## 3. rodesk Agent Module 目标设计

保持 Feature Module 架构。

目录：

web/src/modules/agent/

-   views
-   components
-   stores
-   services
-   types
-   mock

不引入 Plugin Runtime。

------------------------------------------------------------------------

## 4. UI 和交互迁移要求

### Workspace Layout

参考 DeepSeek Harness Workspace。

目标：

-   Conversation
-   Robot Context
-   Tool Result
-   Console

第一阶段使用固定布局，不实现复杂 Dock Runtime。

------------------------------------------------------------------------

### Conversation

必须采用 Agent Conversation 模型。

禁止简单：

interface Message { text:string }

推荐：

interface Message { id:string role:"user"\|"assistant"\|"tool" blocks:
MessageBlock\[\] timestamp:number }

支持：

-   TextBlock
-   ToolCallBlock
-   ResultBlock
-   RobotActionBlock

------------------------------------------------------------------------

### Tool Call

参考：

Agent

↓

Tool Call

↓

Tool Result

↓

Answer

迁移：

Agent

↓

Robot Action

↓

Execution Result

↓

Observation

------------------------------------------------------------------------

## 5. 不采用的 DeepSeek 设计

不迁移：

-   Plugin Loader
-   Plugin Manifest
-   Plugin Registry
-   Extension API
-   复杂 Runtime 抽象

原因：

rodesk 是固定产品，不是平台。

------------------------------------------------------------------------

## 6. rodesk 前端代码质量要求

总体原则：

简单、明确、可维护、可扩展。

------------------------------------------------------------------------

### Vue

必须使用：

```{=html}
<script setup lang="ts">
```
使用 Composition API。

组件要求：

-   单一职责
-   明确 Props
-   明确 Emit
-   避免隐藏状态

------------------------------------------------------------------------

### TypeScript

要求：

-   strict
-   明确类型
-   避免 any

禁止为了通用设计复杂泛型。

------------------------------------------------------------------------

### 状态管理

Pinia 管理：

-   Conversation
-   Session
-   Application State

不管理临时 UI 状态。

------------------------------------------------------------------------

### Service

所有通信必须经过 Service。

禁止组件直接：

-   fetch
-   axios
-   WebSocket

------------------------------------------------------------------------

### Domain

业务模型独立。

UI 不定义业务对象。

------------------------------------------------------------------------

### 性能

第一阶段不提前优化。

禁止提前引入：

-   Virtual List
-   Worker
-   Cache Framework
-   Complex Diff

------------------------------------------------------------------------

## 7. 实施阶段

### Phase 1：Agent Workspace UI

实现：

-   AgentView
-   AgentLayout
-   ConversationPanel
-   ContextPanel
-   ToolPanel
-   InputBox

------------------------------------------------------------------------

### Phase 2：Conversation Model

实现：

-   Message
-   MessageBlock
-   Conversation
-   ToolCall
-   Pinia Store

------------------------------------------------------------------------

### Phase 3：Mock Agent Runtime

实现：

-   send message
-   stream response
-   tool call
-   tool result

------------------------------------------------------------------------

### Phase 4：Robot Context Integration

增加：

-   Robot Status
-   Action Result
-   Observation

------------------------------------------------------------------------

### Phase 5：质量收敛

包括：

-   类型检查
-   组件拆分
-   文档
-   测试
-   样式统一

------------------------------------------------------------------------

## 8. 最终验收标准

功能：

-   Agent Workspace
-   Conversation
-   Streaming 模拟
-   Tool Call 展示
-   Robot Context

架构：

-   agent 独立模块
-   UI 与 Service 分离
-   Store 边界清晰
-   无平台化复杂设计

代码：

-   TypeScript strict
-   Vue3 标准写法
-   无明显 any
-   无超大组件
-   无无意义抽象

------------------------------------------------------------------------

## 9. Codex 执行要求

请不要直接开发一个新的 Agent UI。

执行流程：

1.  阅读 DeepSeek Harness 前端源码；
2.  分析 UI、状态、交互；
3.  建立迁移映射；
4.  按阶段实现；
5.  优先达到 DeepSeek Harness 交互效果；
6.  后续加入机器人能力；
7.  保持 rodesk 简洁、稳定、可维护标准。

最终目标：

DeepSeek Harness Agent UX

-   

Vue3 Engineering Quality

-   

Robot Interaction Capability
