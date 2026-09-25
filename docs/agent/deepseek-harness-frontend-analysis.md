# DeepSeek Harness 前端源码分析与 rodesk 迁移映射

## 分析基线

- 本地源码：`deepseek-harness/`，提交 `477b4f420553e8a52c2fbccc464d7561b239c443`（2026-09-24）。`apps/web` 包版本为 `0.1.7-rc.2`。
- 依据：[迁移计划](deepseek.md)。本分析覆盖布局、Conversation、消息模型、Tool Call、流式交互、状态管理和通信分层；不分析模型调用或后端 Agent Runtime 的实现。
- 这里的“迁移”指借鉴交互和数据流，在 rodesk 的 Vue 3 架构中实现；以下源码链接均指向本地下载版本。

## 1. 前端入口和架构

`apps/web` 不是主要 UI 实现。其 [入口](../../deepseek-harness/apps/web/src/main.ts) 创建 `AppWebEntry`；[Web mount](../../deepseek-harness/packages/client/web/src/mount.ts) 将渲染器挂载到 DOM。实际界面分布在 `packages/client/ui-*`，会话状态位于 `packages/api/session-controller/src/client`，连接位于 `packages/client/connection` 和 `packages/api/gateway/src/client`。

核心数据流：

```text
Composer/Input machine
  → ConversationController.sendSession
  → Session.prompt（请求）
  → Gateway 的 Session follow 流（历史快照 + 增量事件 + Assistant 临时帧）
  → SessionEventSource
  → UiConversation/Chat 事件投影
  → ChatView、消息行和 ToolCallTree
```

证据：[提交入口](../../deepseek-harness/packages/client/ui-conversation/src/client/service.ts)、[Session.prompt](../../deepseek-harness/packages/api/session-controller/src/client/sessions/session.ts)、[follow 流](../../deepseek-harness/packages/api/session-controller/src/client/transport.ts)、[事件窗口](../../deepseek-harness/packages/api/session-controller/src/client/contract/events.ts)、[Conversation 组装](../../deepseek-harness/packages/client/ui-conversation/src/client/conversation/assembly.ts)。

**迁移判断：** rodesk 已有 `AgentView`、`AgentAdapter`、全局 `services` 和 `domain` 的骨架。Vue 组件应消费由 Agent service/store 提供的领域状态；不需要复制 Harness 的 Cordis、slot 注册器或包拆分方式。

## 2. UI Layout

[AppFrame](../../deepseek-harness/packages/client/ui-layout/src/client/AppFrame.tsx) 是左侧栏、中心主视图、右侧栏的三列布局。中心可以显示 Conversation 或其他全局面板；右侧栏由具体内容决定是否占据宽度。该框架还处理拖动宽度、窄屏侧栏折叠和覆盖层。Conversation 自身由 [ConversationMainPanel](../../deepseek-harness/packages/client/ui-conversation/src/client/skeleton/ConversationMainPanel.tsx)、[ConversationContent](../../deepseek-harness/packages/client/ui-conversation/src/client/skeleton/ConversationContent.tsx) 组成：空会话显示居中输入区，开始后切换到对话内容与底部输入区；输入组件保持同一实例。

[ChatView](../../deepseek-harness/packages/client/ui-chat/src/client/chat/ChatView.tsx) 有历史加载、加载失败、按回合导航、跟随最新消息和回到底部的交互。[Trajectory](../../deepseek-harness/packages/client/ui-trajectory/src/client/index.ts) 是另一个 Conversation 视图；[终端](../../deepseek-harness/packages/client/ui-sidebar-terminal/src/client/index.ts) 是可选侧栏内容，并非 Agent 对话模型的组成部分。

| 迁移计划中的区域 | Harness 对应实现 | rodesk 第一阶段建议 |
| --- | --- | --- |
| Conversation | 中心 Conversation + ChatView | 主区域；包含空态、消息列表、输入区、滚动反馈 |
| Robot Context | 无直接对应的机器人面板 | 右侧固定面板；显示选中机器人的状态和本次动作上下文 |
| Tool Result | Chat 中的工具调用树与卡片 | 默认嵌在对话流；较长结果可在右侧详情查看 |
| Console | 可选终端侧栏 | 先定义为**只读事件/执行日志**；是否需要交互终端另行决定 |

固定布局符合计划的第一阶段边界。建议保留窄屏折叠与消息区独立滚动；暂不实现 Dock Runtime、拖动分栏或多视图注册。

## 3. Conversation 与 Message 模型

Harness 的持久事实是 Session 事件，Chat 消息是事件投影。它不是一个单纯的 `{ role, text }[]`：

- [ConversationNode 联合类型](../../deepseek-harness/packages/client/ui-conversation/src/client/contract/records.ts) 包含 user、assistant、steering、context、tool result、turn error 等；节点带事件顺序 `seq` 和时间。
- Assistant 内容是带 `kind` 的 block：text、reasoning、image、tool-call、other；[Assistant 节点](../../deepseek-harness/packages/client/ui-conversation/src/client/contract/records.ts) 还记录 turn、step、messageId、完成或中断状态。
- [Message Definition](../../deepseek-harness/packages/client/ui-chat/src/client/conversation-nodes/message.ts) 根据事件来源区分普通用户消息、运行中插入的消息和系统上下文。
- [ChatSnapshot](../../deepseek-harness/packages/client/ui-chat/src/client/contract/snapshot.ts) 保留排序和按节点键读取的视图数据，不把传输事件直接塞进组件。

迁移计划中的 `Message { role, blocks }` 可以作为**渲染模型**，但不能单独承担流式、Tool Call 关联及重放。rodesk 至少需要区分：

1. `AgentEvent`：service 接收的事件，带 `sessionId`、事件 ID 或序号、时间、类型和必要的关联 ID。
2. `ConversationItem`：从事件整理出的可显示项，使用判别字段区分用户消息、Assistant 内容、工具调用、结果、机器人动作和错误。
3. `SessionState`：当前会话的连接、运行、失败等状态。草稿、展开/折叠和面板选择属于视图状态。

这些是 rodesk 建议模型，**不是** Harness 的类型逐字翻译。`RobotActionBlock` 应有动作 ID、目标机器人、状态和结果关联；不能仅靠文字描述动作。

## 4. Tool Call 展示

[Tool Definition](../../deepseek-harness/packages/client/ui-chat/src/client/conversation-nodes/tool.ts) 将 `tool-call-delta`、`tool/call`、`tool/result` 按 `callId` 合并；执行过程中有 `preparing → start → result` 阶段，结果保留 `isError`、错误信息和元数据。若历史窗口缺少调用起点，结果仍可显示。中断时未完成的调用会得到中断展示状态。

[ToolCallTree](../../deepseek-harness/packages/client/ui-tool/src/client/tool/ToolCallTree.tsx) 按工具名选择专用卡片，未知工具退回通用卡片；子调用可以递归显示。其展示逻辑与调用事实分开。[Tool model](../../deepseek-harness/packages/client/ui-tool/src/client/tool/models/tool-call-model.ts) 负责把原始数据转换为可读标题与摘要。

rodesk 可保留三个要点：`callId` 配对、进行中/成功/失败可见、未知工具有通用展示。机器人动作可以复用“发起 → 执行 → 结果 → 观察”的**交互形式**，但动作命令、执行反馈和传感器观察应是不同事件；是否需要人工确认必须由实际机器人接口和产品要求决定。Harness 的通用工具卡片不能直接作为机器人执行结果的语义模型。

## 5. Streaming 与输入交互

[SessionEventStream](../../deepseek-harness/packages/api/session-controller/src/client/transport.ts) 先打开当前历史快照，再接收按序追加的持久事件与 Assistant 临时帧；它检查序号连续性。[Session](../../deepseek-harness/packages/api/session-controller/src/client/sessions/session.ts) 将历史替换、前插、追加和 Assistant 结算发布到 [事件窗口](../../deepseek-harness/packages/api/session-controller/src/client/contract/events.ts)。临时帧到达后会更新流式内容；正式消息到达时，临时内容被结算，避免双重显示。

[Assistant 投影](../../deepseek-harness/packages/client/ui-chat/src/client/conversation-nodes/assistant.ts) 按 block index 合并 text、reasoning 和工具参数增量。[Conversation 组装器](../../deepseek-harness/packages/client/ui-conversation/src/client/conversation/assembly.ts) 对高频更新延迟发布，以降低重绘。[ChatView](../../deepseek-harness/packages/client/ui-chat/src/client/chat/ChatView.tsx) 在用户离开底部时显示返回底部按钮，而不是强制每个增量都滚到底部。

提交侧同样重要：[Session.beginSubmission](../../deepseek-harness/packages/api/session-controller/src/client/sessions/session.ts) 先显示本地待确认消息；请求失败时移除该回显并保留草稿。运行中的再次提交可选择排队或插入当前执行，见 [提交策略](../../deepseek-harness/packages/client/ui-conversation/src/client/input/submission-policy.ts)；[取消](../../deepseek-harness/packages/client/ui-conversation/src/client/service.ts) 单独结束正在运行的回合。

rodesk 第一阶段建议覆盖：`idle → submitting → streaming → completed / failed / cancelled`，以及工具调用的进行中状态。Mock 应按事件顺序发出增量和结算，不只用定时器逐字追加一个字符串。排队和插入当前执行属于后续可选能力，除非现有 Agent 接口明确支持。

## 6. 状态管理与 Service/Connection 分层

Harness 将 Session、事件窗口和连接生命周期放在对象层；UI store 主要保存视图偏好。例如 [Conversation store](../../deepseek-harness/packages/client/ui-conversation/src/client/stores.ts) 保存草稿和视图选择，[Chat store](../../deepseek-harness/packages/client/ui-chat/src/client/stores.ts) 保存展开状态，[Layout store](../../deepseek-harness/packages/client/ui-layout/src/client/stores.ts) 保存分栏与面板状态。聊天组件不直接发请求。

请求由 [Connection RPC](../../deepseek-harness/packages/client/connection/src/client/rpc.ts) 发出；普通 Web 页面使用 HTTP 请求，持续事件使用 [Gateway WebSocket](../../deepseek-harness/packages/api/gateway/src/client/stream-client.ts)。[ConnectionController](../../deepseek-harness/packages/client/connection/src/client/connection.ts) 管理 connected/connecting/disconnected、取消和退避重连。Session follow 在传输恢复后重建历史基线，避免仅凭断线期间的增量猜测状态。

在 rodesk 中可保持现有 `services/adapters` 方向：`AgentAdapter` 提供提交、取消、订阅事件或状态；Mock 与真实连接实现同一接口。Pinia 管理会话与对话的可读状态，通信细节留在 service；组件只调用 store action 或 service facade。无需引入 Harness 的注册器、快照引擎或通用 Gateway，但必须定义断线后的重新同步策略。

## 7. 对现有计划的修订建议

| 计划项 | 源码分析后的处理 |
| --- | --- |
| Phase 1 先做所有面板 | 先确定最小事件、会话和工具状态，再做 UI；否则组件会围绕临时数据重写 |
| `MessageBlock` 推荐类型 | 保留判别联合；另定义事件 ID、`callId`、生命周期和失败信息 |
| `Tool Result` 独立面板 | 默认结果随调用出现在对话流，右侧仅展示选中项详情 |
| Streaming 模拟 | Mock 发出与真实适配器同格式的事件，并包含完成、失败、取消 |
| Robot Context | 明确机器人状态来源、刷新时效、离线状态与当前会话的关系 |
| Console | 明确是只读日志还是交互终端；第一阶段按只读日志设计 |
| “所有通信经过 Service” | 保留；Store 持有领域状态，Service/Adapter 负责请求和订阅 |

## 8. rodesk 最小迁移切片与验收

建议实现顺序：

1. 定义 rodesk 事件、ConversationItem、SessionState 和 `AgentAdapter`，明确共享 `domain/` 与 Agent 模块私有类型的归属。
2. 建立可重放的 Mock：用户提交、Assistant 增量、Tool Call、Tool Result、完成、失败、取消；同一事件序列应得出同一 UI 状态。
3. 实现固定布局、空态、对话流、输入框和工具卡片，并接入 Mock。
4. 加入 Robot Context、动作事件和观察结果；确认真实机器人接口后再实现执行操作。
5. 按场景验证：首次发送、重复发送、流式结算、调用失败、取消、断线恢复、切换会话、旧消息加载及窄屏布局。

分析时的代码起点：[AgentView](../../web/src/modules/agent/AgentView.vue) 是占位页，[AgentAdapter](../../web/src/services/adapters/agent.adapter.ts) 只有 `sendMessage(message): Promise<void>`；[WorkspaceLayout](../../web/src/layouts/WorkspaceLayout.vue) 提供外壳。实现进展与使用方式见 [Agent module README](../../web/src/modules/agent/README.md)。
