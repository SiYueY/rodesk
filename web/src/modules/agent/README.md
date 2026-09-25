# Agent 前端模块

该模块以本地 DeepSeek Harness 源码为视觉和交互依据，以 Vue 3、Pinia 和固定 Agent Adapter 实现。它不包含插件加载器、Manifest、Registry、Extension API 或动态运行时。

## 目录职责

- views：页面组合层。AgentView 连接 Pinia 与展示组件，并持有布局组合逻辑。
- components：展示与局部交互组件。通过 Props 与 Emits 通信，不直接读取 Agent Store。
- composables：页面生命周期内的临时 UI 状态。useAgentLayout 管理三栏宽度、拖拽、断点和侧栏开关。
- stores：Pinia 会话、消息块和流式事件状态。
- services：Agent 通信接口及其组装入口。
- mock：本地 Mock Adapter，实现流式文本和取消行为。
- types：独立于 UI 的会话、消息块和流事件模型。

依赖方向为：view → store → service interface → mock implementation。布局开关和拖拽宽度不进入 Pinia，也不会持久化。

## 页面行为

- / 为首页，/agent 以及未知地址均回到首页。
- 桌面端默认显示可拖拽的左侧会话栏、中央对话区和右侧 Robot 栏。右栏当前仅显示 Hello Robot。
- 左右栏均可隐藏；隐藏后不占布局宽度，并在中央画布角落提供恢复入口。
- 小于 1024px 时右栏隐藏，左栏以带遮罩的抽屉显示。
- 输入框在空会话与活动会话之间保持同一实例，支持 Enter 发送、Shift+Enter 换行和停止流式响应。

## 验证

在 web 目录执行：

    pnpm run lint
    pnpm run build
    pnpm test
