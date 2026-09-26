# Teleoperation 模块

Teleoperation HUD 使用 Vue 3 Composition API。HUD 几何以 [HTML 基线](../../../../docs/teleoperation/teleoperation.html)（V23.3）和 [设计规范](../../../../docs/teleoperation/teleoperation_design.md)为准；视频层遵循 [Camera WebRTC 设计](../../../../docs/teleoperation/camera_webrtc_design.md)。

## 页面结构

`views/TeleoperationView.vue` 组合遥操和相机状态。`TeleoperationLayout` 将全屏相机层与 HUD 分开：相机在背景，HUD 在上方。相机层不属于 Center Overlay Zone；Panel 仍是 Center Overlay 的子节点。

HUD 保持原有三行 Zone 几何：

- Header：透明返回按钮、模式和网络状态。
- Middle：Left Button、Center Overlay、Right Button。
- Bottom：Left Joystick、Bottom Telemetry、Right Joystick。

`components/zones/` 仅负责空间、尺寸和定位。`teleoperation.css` 保存 HUD 样式和 V16 摇杆尺寸规则；相机外观放在 `components/camera/camera.css`，不会改变 Zone 几何。

## 移动端横屏与全屏

从 Agent 页面点击 Teleoperation 入口时，页面会在该点击操作中请求浏览器全屏，随后尝试锁定横屏。直接打开 `/teleoperation` 时，支持全屏的移动浏览器会显示“点击进入横屏全屏”；竖屏且不支持全屏时提示手动横屏。离开遥操页会解除方向锁定并退出全屏。浏览器可能拒绝这些请求，尤其在 iPhone Safari 中，网页无法保证自动全屏或锁定横屏；此时页面仍按现有视口布局工作。

## Camera Layer 与数据流

`MockCameraLayer` 直接在页面内循环播放本地 MP4，并在实际播放后显示 Connected；自动播放失败时提供重试按钮。播放器将完整视频画面按比例置于相机层内，屏幕宽高比不同时留深色空白。真实相机接入时使用 `CameraLayer`、`WebRTCPlayer` 和 `useCamera` 播放 `MediaStream`；离开页面时会断开相机会话并停止视频轨道。

真实相机的数据流为：

`CameraService.connect(robotId, cameraId)` → `MediaStream` → `WebRTCPlayer`。

`useCamera` 管理页面生命周期。`useWebRTC` 负责 `RTCPeerConnection`、ICE 收集、SDP 信令交换、视频轨道和清理；它通过 `CameraSignaling` 接口调用网关适配器，页面不感知 ROS2、camera topic 或后端传输格式。当前没有 Python WebRTC Gateway 的接口实现，页面使用 `MockCameraLayer` 直接播放本地 [`unitree-camera-mock.mp4`](../../../public/media/unitree-camera-mock.mp4)，避免移动浏览器中的 canvas 转流兼容问题。该文件下载自 [Unitree 视频](https://www.unitree.com/images/7504897529034b05890225e149d3af28.mp4)，运行时不依赖外网。接入网关时提供 `CameraSignaling` 实现，并将页面中的 `MockCameraLayer` 换为使用 `useCamera(useWebRTC(signaling))` 的 `CameraLayer`。

## HUD 控件与 Mock 边界

`VirtualJoystick` 保留原有底座、控制球、方向箭头和动画。`useJoystick` 管理单个摇杆的状态与生命周期，`services/joystick/nipple-adapter.ts` 以 `static`、`dataOnly` 模式使用 nipplejs 处理鼠标和触摸输入，不生成第三方 UI。左右摇杆共用 `JoystickState`（归一化的 x、y 和 active），页面统一存储两侧状态；`TelemetryReadout` 显示 LX、LY、RX、RY。`JoystickCommand` 定义了未来控制接口所需的 source、x、y 和 timestamp，当前不发送运动命令。

`StopControl` 保留连接状态禁用逻辑与 STOP 回调，通过 `MockTeleoperationService` 发送零速度命令。机器人相机和遥操服务均未连接真实设备。

## 验证

在 `web/` 运行 `npm run build`、`npm run lint` 和 `npm run test`。页面对照使用 1920×1080、1366×768、390×844、430×932 四种视口，检查相机覆盖范围、Panel 所属 Zone、摇杆与按钮几何、视频轨道绑定和页面离开时的清理。
