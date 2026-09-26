# Agent Call

`call.html` 是冻结的视觉原型，`call_vue_development.md` 是迁移计划。运行页面位于 `/call`，Agent 输入栏的电话图标是入口；结束通话后立即返回 Agent 首页，通话页没有顶部返回按钮。

当前默认使用 `MockCallService` 与 `MockCallCameraAdapter`。页面展示仓库内的 `/media/unitree-camera-mock.mp4`，因此按钮和来源选择可演示，但不会发起真实语音会话，也不会申请本机摄像头权限。真实 Agent Realtime 后端和 CameraSignaling 尚未在仓库中提供。

媒体边界位于 `web/src/modules/agent/call/services/`：

- `LocalCameraAdapter` 用 `getUserMedia` 打开前后摄像头，并在切换或关闭时停止视频轨道。
- `RobotCameraAdapter` 通过现有 `CameraService` 接口连接机器人视频；`createCallRuntime({ cameraMode: 'devices', signaling })` 使用现有 `useWebRTC` 构造该接口。只启用 `cameraMode: 'devices'` 也可连接本机摄像头；选择机器人来源时会提示缺少 signaling。
- `SourceCameraAdapter` 按来源选择本地或机器人适配器。
- `MediaStreamPlayer` 是 Call 与 Teleoperation 共用的纯视频组件。Teleoperation 的状态展示仍留在自己的模块中。

默认运行时保持 Mock，以保证 `/call` 可以独立开发和视觉验证。接入真实后端时在应用组装处通过 `callRuntimeFactoryKey` 提供 `() => createCallRuntime({ cameraMode: 'devices', signaling, service })`；每次进入页面都会创建独立运行时。页面组件不包含 SDP、ROS2 或后端协议细节。

在 `web` 目录运行 `pnpm run lint`、`pnpm run test`、`pnpm run build` 和 `pnpm run test:visual`。视觉测试固定视频在 2 秒处，对比原型与 `/call` 的五种尺寸和主要交互状态，并检查 Agent、Teleoperation 路由。测试优先使用本机 `/usr/bin/google-chrome`；其他环境可通过 Playwright 安装 Chromium 后运行。
