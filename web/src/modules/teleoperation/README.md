# Teleoperation 模块

该模块提供第一版遥操界面与本地 Mock Service。它负责相机占位区、虚拟控制杆、停止操作及页面生命周期内的 Mock 连接状态。

## 范围

- 机器人相机区域仅为静态 UI 占位，不读取摄像头或网络视频流。
- 左右控制杆仅呈现视觉状态，不发送运动速度。
- STOP 通过 Mock Service 发送零速度 VelocityCommand。
- 不包含 WebSocket、ROS、ROS message、geometry_msgs、Twist 或后端接口。

## 结构

- components：相机、控制杆和停止控件。
- composables：临时连接状态与 STOP 行为。
- services：遥操通信接口与单例组装。
- mock：可替换的本地 Service 实现。
- types：与 UI 无关的 VelocityCommand 数据模型。
- views：页面组合层。

后续接入真实机器人时，以 TeleoperationService 的实现替换 MockTeleoperationService，UI 与速度模型保持不变。
