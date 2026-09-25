\% rodesk Teleoperation 页面设计规范

# 1. 设计目标与整体布局

本文定义 rodesk Teleoperation 页面的布局模型、组件职责以及 Vue3
实现约束。

该页面定位为机器人遥操作 HUD 界面，需要同时支持桌面浏览器、移动端
触控以及后续 Tauri 桌面应用。

核心原则：

-   Zone 负责布局，不负责业务。
-   Component 负责自身渲染，不改变 Zone 几何。
-   虚拟摇杆、按钮、状态面板相互隔离。
-   响应式调整尺寸，但保持交互空间关系。

整体结构：

    Header Zone

    Left Button Zone | Center Overlay Zone | Right Button Zone

    Left Joystick Zone | Bottom Center Telemetry | Right Joystick Zone

# 2. Zone 定义与布局规则

## Header Zone

职责：

-   Robot Identity
-   Operating Mode
-   Network Status

规则：

-   位于页面顶部。
-   高度独立。
-   不允许 Popup Panel 覆盖。
-   不参与遥控区域计算。

## Button Zone

左右按钮区域：

-   Left Button Zone
-   Right Button Zone

职责：

-   快捷操作按钮。
-   STOP 按钮属于 Right Button Zone。

规则：

-   左右严格镜像。
-   宽度由按钮尺寸决定。
-   宽度必须小于 Joystick Zone。
-   与 Center Overlay Zone 独立。

## Center Overlay Zone

职责：

承载所有浮层：

-   Robot Info
-   Robot Status
-   后续诊断和配置 Panel

规则：

-   Panel 必须是 Center Overlay Zone 的子节点。
-   禁止跨越 Header Zone。
-   禁止覆盖 Joystick Zone。
-   Panel 的位置由 Center Overlay 控制。

## Joystick Zone

包含：

-   Left Joystick Zone
-   Right Joystick Zone

规则：

-   摇杆尺寸保持 V16 逻辑。
-   不受 Panel 调整影响。
-   不参与 Overlay 布局。
-   左右完全镜像。

## Bottom Center Telemetry

职责：

显示：

-   LX
-   LY
-   RX
-   RY

规则：

-   只显示状态。
-   高度跟随内容。
-   高度必须明显小于 Joystick Zone。
-   不推动摇杆位置变化。

# 3. Responsive 设计规范

桌面模式：

-   保持左右 Zone。
-   Center Overlay 位于中央区域。
-   Panel 使用固定 HUD 风格。

移动端：

-   保持 Zone 拓扑结构。
-   允许 Panel 缩小。
-   允许字体和 padding 缩减。

禁止：

-   改变 Zone 顺序。
-   将 Panel 移动到 Button Zone。
-   修改摇杆尺寸逻辑。

# 4. Vue3 组件建议

    TeleoperationPage.vue

    TeleopLayout.vue

    HeaderZone.vue

    LeftButtonZone.vue

    CenterOverlayZone.vue
     └── OverlayPanel.vue

    RightButtonZone.vue

    LeftJoystickZone.vue
     └── VirtualJoystick.vue

    BottomTelemetry.vue

    RightJoystickZone.vue

组件职责：

-   Layout：管理 Zone。
-   Zone：管理空间。
-   Component：管理内容。

# 5. CSS 实现约束

必须：

-   使用 Grid/Flex 管理 Zone。
-   使用 CSS Variables 管理尺寸。
-   保持 pointer-events 隔离。

禁止：

-   子组件 absolute 跨区域定位。
-   Popup 修改父布局尺寸。
-   通过 margin 修正 Zone 问题。

# 6. V23.3 基线说明

V23.3 已完成：

-   Zone 布局重构。
-   Button / Joystick 分离。
-   Center Overlay 独立。
-   Panel 渲染稳定化。

Panel 使用：

-   border
-   rgba background
-   rounded corner

并关闭容易导致移动端异常渲染的模糊效果。

该版本作为 Vue3 Teleoperation 实现视觉基线。
