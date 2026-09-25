# Teleoperation 模块

Teleoperation HUD 使用 Vue 3 Composition API。视觉与布局以 [HTML 基线](../../../../docs/teleoperation/teleoperation.html)（文件内标注 V23.3）和 [设计规范](../../../../docs/teleoperation/teleoperation_design.md)为准。

## 页面结构

`views/TeleoperationView.vue` 是页面入口，组合 Mock 连接状态、面板开关和左右摇杆读数。`components/layout/TeleoperationLayout.vue` 建立三行布局：

- Header Zone：返回 Agent 的透明按钮、模式和网络状态。
- Middle：Left Button Zone、Center Overlay Zone、Right Button Zone。
- Bottom：Left Joystick Zone、Bottom Telemetry Zone、Right Joystick Zone。

`components/zones/` 仅拥有空间、尺寸和定位。`teleoperation.css` 保存参考页面的布局尺寸与控件外观；`useTeleoperationLayout` 按参考页面的 V16 公式在视口变化时更新 CSS 变量。

## 组件关系

- `CenterOverlayZone` 包含全屏相机背景、Robot Info / Robot Status 面板和连接错误。Panel 是 Overlay 的子节点，只在中间区域显示。
- `LeftJoystickZone` 与 `RightJoystickZone` 分别包含 `VirtualJoystick`。摇杆通过 Pointer Events 输出归一化的 `JoystickAxes`，松开或取消指针时归零。
- `BottomTelemetryZone` 容纳 `TelemetryReadout`，后者只显示 LX、LY、RX、RY，不发送命令，也不改变摇杆位置。
- `RightButtonZone` 包含 `StopControl`；STOP 保留连接状态禁用逻辑和 `useTeleoperationSession.stop` 回调。

## 数据与服务边界

`services/TeleoperationService` 定义连接、断开和速度命令接口；当前由 `mock/MockTeleoperationService` 实现。STOP 向 Mock Service 发送零速度命令。摇杆读数只在本地显示，不连接机器人或发送运动速度。相机图像是 HTML 基线使用的静态外部图片。

## 验证

在 `web/` 目录运行 `npm run build`、`npm run lint` 和 `npm run test`。页面视觉对照使用 1920×1080、1366×768、390×844、430×932 四种视口，并分别检查面板打开、摇杆拖动与 STOP。
