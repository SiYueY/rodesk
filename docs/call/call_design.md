# rodesk Agent Call Vue3 完整开发计划

> **适用代码基线**
>
> - Repository: `SiYueY/rodesk`
> - Branch: `develop`
> - 分析时 HEAD: `e66f763f9c8b99d463017d4348bdbfaa68c44a83`
> - Web: Vue 3 + TypeScript + Vite + Vue Router + Pinia + Tailwind CSS + Vitest
> - Node.js: 22
> - 包管理器: pnpm
>
> **视觉基线**
>
> - 已确认效果的 `call.html`
> - Call 页面迁移的首要要求是：**在相同 viewport 下尽可能做到与 HTML 原型一模一样**
>
> **本文目标**
>
> 本文不是重新设计 Call 页面，也不是重新设计 rodesk 前端架构，而是基于当前 `develop`
> 已经存在的 Agent、Teleoperation、Camera/WebRTC、Mock 和 Router 实现，给出一套可直接执行的
> Vue3 开发计划。开发必须按阶段连续完成，不应每完成一个很小的修改就停止，也不应在视觉迁移尚未
> 验证前提前做大规模组件重构。

---

# 1. 当前工程分析与最终实现边界

## 1.1 当前 rodesk 已经具备的基础

当前 `web/src` 的有效工程结构已经比较稳定：

```text
web/src/
├── App.vue
├── main.ts
├── assets/
│   ├── styles.css
│   └── theme.css
├── components/
│   └── ui/
├── lib/
├── modules/
│   ├── agent/
│   └── teleoperation/
└── router/
    └── index.ts
```

`App.vue` 当前只负责：

```vue
<RouterView />
```

因此 `/teleoperation` 已经是独立全屏 route。Call 页面也应采用同样模式，不需要再创建全局
App Layout，也不要把 Call 页面嵌入 Agent 对话页的三栏布局。

当前 Router：

```text
/
  -> AgentView

/teleoperation
  -> TeleoperationView

/agent
  -> redirect /
```

Call 新增：

```text
/call
  -> AgentCallView
```

---

## 1.2 Call 应属于 Agent，而不是 Teleoperation

当前 Call 原型承担的是：

```text
Human
  │
  ▼
Realtime Agent Call
  ├── Voice
  ├── Camera
  ├── Subtitle
  └── Speaker
```

而 Teleoperation 当前承担：

```text
Human
  │
  ▼
Direct Robot Control
  ├── Joystick
  ├── STOP
  ├── Robot HUD
  └── Camera Background
```

二者虽然都存在 Camera，但业务语义不同。

因此 Call 不应放在：

```text
modules/teleoperation/
```

也不建议新增完全独立的：

```text
modules/call/
```

推荐作为 Agent 的子功能：

```text
web/src/modules/agent/call/
```

这样未来可以自然接入：

- Agent Session；
- Agent 语音状态；
- Agent Realtime API；
- Tool / Robot 执行状态；
- 当前会话上下文。

---

## 1.3 现有 Teleoperation 中可复用与不可直接复用的内容

当前 Teleoperation 已经实现：

```text
components/camera/
├── CameraLayer.vue
├── CameraStatus.vue
└── WebRTCPlayer.vue

composables/
├── useCamera.ts
└── useWebRTC.ts

services/
└── camera.service.ts

mock/
└── MockCameraService.ts
```

并已经存在本地视频：

```text
web/public/media/unitree-camera-mock.mp4
```

### 可以复用的设计

可以复用：

- `MediaStream` 作为前端视频统一输出；
- `CameraService` / `CameraSignaling` 的协议隔离思路；
- `useWebRTC` 的 RTC 连接思路；
- 页面卸载时释放 MediaStream；
- 本地 Unitree MP4 作为开发 Mock。

### 第一阶段不能直接复用的 UI

不要直接在 Call 中使用：

```text
Teleoperation CameraLayer.vue
CameraStatus.vue
teleoperation.css
```

原因是 `CameraLayer.vue` 包含 Teleoperation 专属的：

```text
Connecting / Connected / Error / Disconnected
```

状态胶囊，而当前 Call 基线没有这一视觉元素。

Call 必须拥有独立：

```text
CallMediaLayer.vue
```

后续真正适合共享的是“纯 MediaStream Player”，而不是完整 Camera UI。

---

# 2. 最终目录和职责设计

建议新增：

```text
web/src/modules/agent/call/
│
├── views/
│   └── AgentCallView.vue
│
├── components/
│   ├── CallMediaLayer.vue
│   ├── CallTopBar.vue
│   ├── CameraSourceMenu.vue
│   ├── CallStatus.vue
│   ├── CallControls.vue
│   ├── CallControlButton.vue
│   ├── CallMoreSheet.vue
│   └── CallToast.vue
│
├── composables/
│   ├── useCallSession.ts
│   └── useCameraSources.ts
│
├── services/
│   ├── call.service.ts
│   └── index.ts
│
├── mock/
│   └── MockCallService.ts
│
├── types/
│   ├── call.ts
│   └── index.ts
│
└── call.css
```

同时新增文档：

```text
docs/agent/call/
├── call.html
└── call_vue_development.md
```

其中：

- `call.html`：保存最终确认的 HTML baseline；
- `call_vue_development.md`：保存本计划；
- baseline 一旦迁移开始，不再随意修改。

---

## 2.1 AgentCallView.vue

这是页面编排层，不是所有逻辑的堆积点。

职责：

- 组合所有 Call 子组件；
- 持有页面级 composable；
- 调用 Vue Router；
- 把状态和事件连接起来；
- 不直接写 WebRTC；
- 不直接操作 DOM；
- 不通过 `getElementById()` 控制页面；
- 不使用 inline style 模拟复杂状态。

目标模板结构：

```vue
<template>
  <main
    class="agent-call-page"
    :class="{
      'agent-call-page--camera-off': !cameraEnabled,
      'agent-call-page--ended': ended,
    }"
  >
    <CallMediaLayer />

    <div class="call-overlay">
      <CallTopBar />
      <div class="call-overlay__spacer" />
      <CallStatus />
      <CallControls />
    </div>

    <CallMoreSheet />
    <CallToast />
  </main>
</template>
```

注意：

这里的 DOM 层次必须和 baseline 对应，不能为了组件抽象随意插入 wrapper。

---

## 2.2 CallMediaLayer.vue

负责：

```text
Media Background
├── video
├── video-shade
├── voice-tint
└── voice-orb
```

Phase 1/2：

```vue
<video
  :src="`${import.meta.env.BASE_URL}media/unitree-camera-mock.mp4`"
  autoplay
  muted
  loop
  playsinline
  preload="auto"
/>
```

必须保留：

```text
autoplay
muted
loop
playsinline
preload
object-fit: cover
```

Call 页面启动后，执行：

```ts
video.value?.play().catch(() => {})
```

页面重新 visible 时再次确保播放。

摄像头关闭时：

- video 节点仍然保留；
- 不用 `v-if` 删除 video；
- 只通过 root class 显示 `voice-tint` 和 `voice-orb`；
- 顶部 Camera Source 按钮隐藏。

原因：

- 避免重新加载视频；
- 避免切换时黑屏；
- 避免布局重排；
- 保持当前原型效果。

---

## 2.3 CallTopBar.vue

职责：

```text
Scenario Button (centered)
Camera Source Button (right aligned)
Camera Source Menu
```

Props：

```ts
interface Props {
  cameraEnabled: boolean
  cameraMenuOpen: boolean
  selectedCameraId: string
  cameraSources: CameraSource[]
}
```

Emits：

```ts
defineEmits<{
  scenario: []
  'toggle-camera-menu': []
  'select-camera': [cameraId: string]
  'close-camera-menu': []
}>()
```

CallTopBar 不提供返回按钮。结束通话由 View 启动资源清理，并立即执行：

```ts
void router.replace('/')
```

使用路由替换，避免后退重新进入已结束的会话；清理失败时记录错误，仍返回 Agent 首页。

---

## 2.4 CameraSourceMenu.vue

只负责选择 UI。

不负责：

- `getUserMedia()`；
- WebRTC；
- Robot camera topic；
- MediaStream；
- ROS2；
- Toast；
- 路由。

数据：

```ts
export type CameraSourceType = 'local' | 'robot'

export interface CameraSource {
  id: string
  label: string
  type: CameraSourceType
  facingMode?: 'user' | 'environment'
  robotId?: string
  cameraId?: string
}
```

初始 Mock：

```ts
const defaultCameraSources: CameraSource[] = [
  {
    id: 'phone-front',
    label: '手机前置摄像头',
    type: 'local',
    facingMode: 'user',
  },
  {
    id: 'phone-rear',
    label: '手机后置摄像头',
    type: 'local',
    facingMode: 'environment',
  },
  {
    id: 'robot-head',
    label: '机器人头部摄像头',
    type: 'robot',
    robotId: 'ROBOT-01',
    cameraId: 'head',
  },
  {
    id: 'robot-chest',
    label: '机器人胸部摄像头',
    type: 'robot',
    robotId: 'ROBOT-01',
    cameraId: 'chest',
  },
  {
    id: 'robot-wrist',
    label: '机器人腕部摄像头',
    type: 'robot',
    robotId: 'ROBOT-01',
    cameraId: 'wrist',
  },
]
```

点击外部关闭建议使用现有依赖：

```text
@vueuse/core
```

即：

```ts
onClickOutside(...)
```

不要自己在多个组件反复添加 `document.addEventListener('click')`。

---

## 2.5 CallStatus.vue

职责仅为视觉：

Props：

```ts
interface Props {
  label: string
  showDots: boolean
}
```

状态模型：

```ts
export type CallPhase =
  | 'ready'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'ended'
```

显示映射：

```ts
const phasePresentation = {
  ready: {
    label: '你可以开始说话',
    showDots: true,
  },
  listening: {
    label: '正在聆听…',
    showDots: true,
  },
  thinking: {
    label: '正在思考…',
    showDots: true,
  },
  speaking: {
    label: '说话或点击打断',
    showDots: false,
  },
  ended: {
    label: '通话已结束',
    showDots: false,
  },
}
```

三点动画保持纯 CSS。

不要改成 Spinner。

---

## 2.6 CallControls.vue

布局固定：

```text
┌─────────┬─────────┬─────────┐
│ Mic     │ Camera  │ Subtitle│
├─────────┼─────────┼─────────┤
│ Speaker │ End     │ More    │
└─────────┴─────────┴─────────┘
```

必须保持当前 DOM 顺序，不建议动态 `v-for`。

原因：

- Subtitle 是特殊文字图标；
- End 是一次性 action；
- More 是 Sheet trigger；
- Mic / Camera / Speaker 才是统一 toggle；
- 为配置驱动而抽象会增加视觉偏差风险。

Props：

```ts
interface Props {
  micEnabled: boolean
  cameraEnabled: boolean
  subtitleEnabled: boolean
  speakerEnabled: boolean
  ended: boolean
}
```

Emits：

```ts
defineEmits<{
  'toggle-mic': []
  'toggle-camera': []
  'toggle-subtitle': []
  'toggle-speaker': []
  end: []
  more: []
}>()
```

---

## 2.7 CallControlButton.vue

只抽象：

```text
Mic
Camera
Speaker
```

Props：

```ts
interface Props {
  label: string
  enabled: boolean
  disabled?: boolean
}
```

Template：

```vue
<button
  class="call-control"
  :class="{ 'call-control--off': !enabled }"
  :disabled="disabled"
>
  <slot />
  <span class="call-control__slash" />
</button>
```

图标必须继续使用 baseline 已确认的 inline SVG path。

第一版禁止替换成 Lucide。

虽然当前工程已经依赖：

```text
lucide-vue-next
```

但 Lucide 的：

- viewBox；
- stroke width；
- 视觉重心；
- icon bounding box；

都会改变最终效果。

---

## 2.8 Subtitle Button

Subtitle 不使用 `CallControlButton` 强行统一。

直接：

```vue
<button
  class="call-control call-control--subtitle"
  :class="{ 'call-control--off': !subtitleEnabled }"
>
  <span class="call-control__subtitle-glyph">字</span>
</button>
```

CSS 单独控制 slash。

必须满足：

### 初始开启

```text
白色半透明圆
黑色“字”
没有 slash
```

### 关闭

```text
透明暗色圆
白色“字”
白色 slash
无 backdrop blur
```

### 再开启

完全恢复初始状态。

这是此前最容易回归的问题，必须写测试并手工验证。

---

## 2.9 CallMoreSheet.vue

保持当前原型：

```text
切换情景
字幕
设备
```

第一版仅做 UI。

Props：

```ts
open: boolean
```

Emits：

```ts
close
scenario
subtitle
device
```

点击 backdrop：

```text
close
```

不要一开始引入 Dialog/Drawer 第三方组件。

原因：

- 当前 Sheet 已经确认外观；
- shadcn-style Drawer 会改变 border-radius、overlay、transition 和 spacing；
- 先完成 1:1，再决定是否复用通用 Drawer。

---

# 3. 状态与 Service 设计

## 3.1 useCallSession.ts

本 composable 管理 Call 页面 UI Session 状态。

```ts
export interface CallSessionState {
  micEnabled: boolean
  cameraEnabled: boolean
  subtitleEnabled: boolean
  speakerEnabled: boolean
  phase: CallPhase
  ended: boolean
}
```

建议默认值：

```ts
micEnabled = true
cameraEnabled = true
subtitleEnabled = true
speakerEnabled = true
phase = 'ready'
ended = false
```

API：

```ts
toggleMicrophone()
toggleCamera()
toggleSubtitle()
toggleSpeaker()
setPhase(phase)
endCall()
```

第一版不要使用 Pinia。

原因：

- `/call` 页状态目前只在页面生命周期内有效；
- 刷新后重建完全可接受；
- 当前 Agent Store 管理的是文本 Session；
- 提前增加 Call Store 会使 Agent Store / Call Store 同步边界复杂化。

只有后续需要：

- 切出 Call 页面后继续通话；
- Agent 页面显示实时通话；
- Desktop tray 控制；
- 全局设备占用；
- 后台通话；

才引入 Pinia。

---

## 3.2 CallService

虽然 UI 第一阶段可以完全本地工作，但最终需要清晰 Service Boundary。

```ts
export interface CallService {
  start(): Promise<void>
  end(): Promise<void>

  setMicrophoneEnabled(enabled: boolean): Promise<void>
  setCameraEnabled(enabled: boolean): Promise<void>
  setSubtitleEnabled(enabled: boolean): Promise<void>
  setSpeakerEnabled(enabled: boolean): Promise<void>
}
```

Mock：

```ts
export class MockCallService implements CallService {
  async start() {}
  async end() {}
  async setMicrophoneEnabled() {}
  async setCameraEnabled() {}
  async setSubtitleEnabled() {}
  async setSpeakerEnabled() {}
}
```

Service 不应该操作 DOM。

Service 也不应该负责按钮颜色。

---

## 3.3 useCameraSources.ts

职责：

```text
sources
selectedSource
menuOpen
selectSource
openMenu
closeMenu
toggleMenu
```

不直接负责具体 MediaStream transport。

接口：

```ts
export function useCameraSources(initialSources: CameraSource[]) {
  const sources = ref(initialSources)
  const selectedId = ref(initialSources[0]?.id ?? '')
  const menuOpen = ref(false)

  function selectSource(id: string) { ... }
  function openMenu() { ... }
  function closeMenu() { ... }
  function toggleMenu() { ... }

  return { ... }
}
```

---

# 4. CSS 与 Pixel Fidelity 迁移规则

## 4.1 不把 baseline CSS 改写成 Tailwind

当前项目存在 Tailwind，但 Call 第一版不应该把：

```css
width
height
grid
rgba
gradient
safe-area
animation
```

转换成几十个 utility class。

原因：

1. baseline 已经通过多轮人工调整；
2. 一旦转写，难以逐值比对；
3. Tailwind 默认 token 不等于当前数值；
4. Tailwind Preflight 已经全局启用，进一步依赖 utility 会增加定位难度。

因此采用：

```text
call.css
```

并通过：

```css
.agent-call-page
```

严格限定作用域。

---

## 4.2 必须冻结的基础变量

从 `call.html` 原样迁移：

```css
.agent-call-page {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
  --safe-right: env(safe-area-inset-right, 0px);

  --control-size: clamp(76px, 21vw, 92px);
  --control-gap-x: clamp(28px, 9vw, 52px);
  --control-gap-y: clamp(24px, 5.5vh, 40px);

  --control-active-bg: rgba(255, 255, 255, .28);
  --control-off-bg: rgba(0, 0, 0, .10);
  --control-passive-bg: rgba(20, 20, 25, .015);
}
```

不要在迁移过程中“优化”为 Theme Token。

Call 是视频 HUD，当前透明色不是普通应用 Button token。

---

## 4.3 Root

必须：

```css
.agent-call-page {
  position: relative;
  width: 100%;
  height: 100dvh;
  min-height: 100vh;
  overflow: hidden;
  isolation: isolate;
  background: #000;
  color: #fff;
}
```

当前全局：

```css
html,
body,
#app {
  height: 100%;
}
```

已经满足 route fullscreen 的基础。

---

## 4.4 Overlay

保持：

```text
auto
1fr
auto
auto
```

对应：

```text
TopBar
Flexible Space
Status
Controls
```

不要换成大量 `position:absolute`。

现有结构已经经过视觉调整，Grid 更稳定。

---

## 4.5 开启按钮

保持：

```css
.call-control {
  background: rgba(255, 255, 255, .28);
  color: #050505;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
```

Subtitle：

```css
backdrop-filter: blur(8px);
```

---

## 4.6 关闭按钮

这是最重要的冻结项之一：

```css
.call-control--off {
  background: rgba(0, 0, 0, .10);
  color: #fff;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
```

**禁止重新加入 blur。**

之前之所以多次出现“背景透明度已经很低但仍然遮挡视频”，真正原因就是：

```text
backdrop-filter
```

导致按钮圆形区域内的视频被局部模糊。

---

## 4.7 Passive Controls

End / More：

```css
background: rgba(20, 20, 25, .015);
```

End icon：

```css
color: #ff594d;
```

不要套用全局 destructive button。

---

## 4.8 Media

```css
.call-media__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
```

`video-shade`、`voice-tint`、`voice-orb` 的渐变、shadow、animation 应直接从 baseline
复制，不重新“近似实现”。

---

## 4.9 Safe Area

顶部：

```text
env(safe-area-inset-top)
```

底部：

```text
env(safe-area-inset-bottom)
```

左右：

```text
env(safe-area-inset-left/right)
```

必须保留。

Call 页面以后会在：

- 手机 Web；
- Tauri；
- 可能的 PWA；

使用，不能只针对桌面浏览器。

---

# 5. 五阶段开发实施计划

下面五个阶段必须按顺序执行。

---

## Phase 0：冻结 baseline 与创建开发入口

### 目标

在正式写 Vue 前，先保证所有人使用同一视觉基线。

### 修改

新增：

```text
docs/agent/call/call.html
docs/agent/call/call_vue_development.md
```

`call.html` 内容来自当前最终确认的：

```text
call.html
```

不要把多个历史 v8.x 文件一起提交。

只保留一个冻结 baseline。

### 路由

暂时新增：

```ts
{
  path: '/call',
  name: 'agent-call',
  component: () => import('@/modules/agent/call/views/AgentCallView.vue'),
}
```

此时 `AgentCallView.vue` 可以仅有空 Root，用于进入开发页面。

### 不做

- 不修改 Agent 页按钮；
- 不修改 Teleoperation；
- 不新增依赖；
- 不修改 CameraService。

### 验证

```bash
cd web
pnpm run build
pnpm run lint
pnpm run test
```

---

## Phase 1：静态视觉 1:1 Vue 迁移

### 目标

不考虑真实业务，只要求 Vue 页面与 HTML baseline 尽可能一致。

### 1. 创建结构

```text
agent/call/
├── views/AgentCallView.vue
├── components/
│   ├── CallMediaLayer.vue
│   ├── CallTopBar.vue
│   ├── CameraSourceMenu.vue
│   ├── CallStatus.vue
│   ├── CallControls.vue
│   ├── CallControlButton.vue
│   ├── CallMoreSheet.vue
│   └── CallToast.vue
└── call.css
```

### 2. Media

直接：

```ts
const mockVideoUrl = `${import.meta.env.BASE_URL}media/unitree-camera-mock.mp4`
```

不要继续用外部 Unitree URL。

### 3. SVG

把 baseline 中 SVG path 原样复制。

不要替换：

```text
Mic
Camera
Speaker
End
More
Camera Source
```

### 4. CSS

把 baseline CSS 转成 `.agent-call-page` namespace。

只允许：

- class rename；
- namespace；
- Vue component 文件拆分。

禁止：

- 参数修改；
- opacity 修改；
- gap 修改；
- gradient 修改；
- blur 修改；
- SVG 修改；
- layout 算法修改。

### 5. Static State

默认固定：

```text
Mic = On
Camera = On
Subtitle = On
Speaker = On
CallPhase = ready
Camera menu = Closed
More = Closed
Ended = false
```

### Phase 1 验收

Viewport：

```text
390 × 844
430 × 932
768 × 1024
1366 × 768
1920 × 1080
```

必须逐项检查：

- TopBar X/Y；
- Status X/Y；
- Controls X/Y；
- Control size；
- 3-column gap；
- 2-row gap；
- video crop；
- subtitle glyph；
- red End；
- passive More；
- menu size；
- safe area。

视觉不一致时：

> 只修复与 baseline 的差异，不重新设计。

---

## Phase 2：Vue 状态与完整交互

### 目标

把 HTML 中 imperative JS 完整迁移成 Vue reactive state。

新增：

```text
composables/useCallSession.ts
composables/useCameraSources.ts
types/call.ts
types/index.ts
```

### 1. Mic

点击：

```text
On -> Off -> On
```

UI：

```text
On:
white translucent + black icon

Off:
dark transparent + white icon + white slash
```

### 2. Camera

点击 Off：

```text
cameraEnabled = false
root adds camera-off
Camera button becomes off
voice tint shown
voice orb shown
camera source trigger hidden
```

点击 On：

完全恢复。

### 3. Subtitle

必须严格：

```text
Initial On:
white translucent
black 字
no slash

Off:
dark transparent
white 字
white slash
no blur

On:
return exactly to Initial
```

### 4. Speaker

与 Mic 相同模式。

### 5. Camera Source Menu

行为：

```text
Trigger click -> open
Source click -> select + close + toast
Outside click -> close
Camera off -> force close
```

使用 VueUse `onClickOutside`。

### 6. Status

Prototype 暂时允许点击状态区循环：

```text
ready
listening
thinking
speaking
```

但必须把这个行为集中在 composable，不让 `CallStatus` 自己改 phase。

### 7. More Sheet

```text
More click -> open
Backdrop click -> close
```

### 8. End

点击结束通话时，关闭菜单并启动媒体与通话服务清理；立即通过 `router.replace('/')` 返回 Agent 首页，不停留在结束状态或显示结束提示。清理失败只记录错误，不阻止返回。

### 9. Navigation

顶部不显示返回按钮。Agent 输入栏的通话按钮进入 `/call`，结束通话返回 `/`。

### 10. Toast

集中为：

```ts
showToast(message)
```

不要让每个 Component 自己管理 timer。

建议 `useCallSession` 或 View 管理：

```ts
toastMessage
toastVisible
```

### Phase 2 单元测试

新增：

```text
useCallSession.test.ts
useCameraSources.test.ts
```

必须覆盖：

```text
default state
mic toggle
camera toggle
subtitle true -> false -> true
speaker toggle
end
camera menu open/close
camera source select
```

### Phase 2 验证

再次执行五组 viewport。

特别检查：

```text
Subtitle initial
Subtitle off
Subtitle on again
Camera off
Camera on again
```

---

## Phase 3：Call Service 与 Camera Source 架构

### 目标

在不改变 UI 的前提下，把页面从“纯本地原型”升级为可以接真实媒体/语音服务的前端模块。

新增：

```text
services/call.service.ts
services/index.ts
mock/MockCallService.ts
```

### 1. CallService

接口：

```ts
export interface CallService {
  start(): Promise<void>
  end(): Promise<void>
  setMicrophoneEnabled(enabled: boolean): Promise<void>
  setCameraEnabled(enabled: boolean): Promise<void>
  setSubtitleEnabled(enabled: boolean): Promise<void>
  setSpeakerEnabled(enabled: boolean): Promise<void>
}
```

### 2. MockCallService

开发环境全部立即成功。

UI 不应该判断：

```text
mock / production
```

只依赖 `CallService`。

### 3. Camera Source Adapter

不要立刻修改现有 Teleoperation `CameraService`。

先定义 Call 侧：

```ts
interface CallCameraAdapter {
  readonly stream: Readonly<ShallowRef<MediaStream | null>>
  readonly status: Readonly<Ref<CameraConnectionStatus>>
  readonly error: Readonly<Ref<string | null>>

  open(source: CameraSource): Promise<void>
  close(): void
}
```

### 4. Local Camera

后续实现：

```text
LocalCameraAdapter
```

使用：

```ts
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: ...
  },
  audio: false,
})
```

切换前后摄像头时：

1. stop old tracks；
2. request new stream；
3. replace stream；
4. update selected source；
5. error 时保持 UI 可恢复。

### 5. Robot Camera

实现：

```text
RobotCameraAdapter
```

底层使用现有：

```text
CameraService / CameraSignaling / useWebRTC
```

但不要让 `AgentCallView` import Teleoperation 的 UI Component。

### 6. Shared Media Player

当前 Teleoperation：

```text
components/camera/WebRTCPlayer.vue
```

实际上只是：

```text
MediaStream -> video.srcObject
```

这部分属于公共能力。

在 Phase 3 提取：

```text
web/src/components/media/MediaStreamPlayer.vue
```

接口：

```ts
stream: MediaStream | null
muted?: boolean
```

事件：

```ts
playback-error
```

然后：

```text
Teleoperation CameraLayer
  -> MediaStreamPlayer

CallMediaLayer
  -> MediaStreamPlayer
```

此重构必须单独验证 Teleoperation 不回归。

### 7. CallMediaLayer 双模式

开发 Mock：

```text
file video
```

真实 Camera：

```text
MediaStream
```

建议由 Adapter 统一输出 MediaStream 后再进一步统一。

但不要为了统一而在 Phase 1 先用 canvas `captureStream()`。

---

## Phase 4：Agent 页面接入

### 目标

Call 页面视觉与内部架构稳定以后，再正式接入 Agent 用户流程。

当前 AgentView 已有：

```text
Teleoperation Entry
```

不要把 Call 和 Teleoperation 混成同一入口。

建议：

```text
AgentView
├── Call Entry
└── Teleoperation Entry
```

具体 Call Entry 图标和位置应单独进行产品确认，不能因为开发方便随便加。

在入口设计未确认前：

```text
/call
```

可以直接作为开发路由使用。

### Session

第一版：

```text
/call
```

即可。

后续：

```text
/call?session=<agentSessionId>
```

然后：

```text
AgentCallView
  -> resolve existing Agent Session
```

不要在第一版把 Call 强绑定到 Agent Store。

---

## Phase 5：回归、文档和视觉测试体系

### 目标

把当前已经反复人工调试出来的视觉效果变成可保护的工程资产。

### 1. 基础命令

每次必须：

```bash
cd web

pnpm run lint
pnpm run test
pnpm run build
```

顺序可以是：

```text
lint -> test -> build
```

但三者都必须通过。

### 2. 当前 Vitest 环境

当前 `vite.config.ts`：

```ts
test: {
  environment: 'node',
  include: ['src/**/*.test.ts'],
}
```

因此目前适合：

```text
pure composable
pure service
adapter
state
```

单元测试。

不要在本次迁移中为了 Vue DOM Test 同时引入大量测试依赖。

### 3. Visual Regression

当前工程还没有 Playwright。

Call 页面稳定以后，再增加独立提交：

```text
test(web): add call visual regression
```

推荐 Playwright viewport：

```text
390 × 844
430 × 932
768 × 1024
1366 × 768
1920 × 1080
```

截图状态：

```text
call-default
call-mic-off
call-camera-off
call-subtitle-off
call-subtitle-restored
call-speaker-off
call-camera-menu
call-more-sheet
call-ended
```

### 4. 视频截图稳定性

不要让 Visual Regression 截取随机播放帧。

建议：

```text
?visualTest=1
```

进入视觉测试模式时：

方案 A：

```text
固定 poster
```

或：

方案 B：

```text
load -> pause -> currentTime = fixed
```

推荐 A。

### 5. 回归范围

必须同时检查：

```text
/
  AgentView

/teleoperation
  TeleoperationView

/call
  AgentCallView
```

因为：

- `styles.css` 是全局的；
- shared media player 后续会影响 Teleoperation；
- Router 变更可能影响入口。

---

# 6. 文件级实施清单

## 新增

```text
docs/agent/call/call.html
docs/agent/call/call_vue_development.md

web/src/modules/agent/call/views/AgentCallView.vue

web/src/modules/agent/call/components/CallMediaLayer.vue
web/src/modules/agent/call/components/CallTopBar.vue
web/src/modules/agent/call/components/CameraSourceMenu.vue
web/src/modules/agent/call/components/CallStatus.vue
web/src/modules/agent/call/components/CallControls.vue
web/src/modules/agent/call/components/CallControlButton.vue
web/src/modules/agent/call/components/CallMoreSheet.vue
web/src/modules/agent/call/components/CallToast.vue

web/src/modules/agent/call/composables/useCallSession.ts
web/src/modules/agent/call/composables/useCallSession.test.ts
web/src/modules/agent/call/composables/useCameraSources.ts
web/src/modules/agent/call/composables/useCameraSources.test.ts

web/src/modules/agent/call/services/call.service.ts
web/src/modules/agent/call/services/index.ts
web/src/modules/agent/call/mock/MockCallService.ts

web/src/modules/agent/call/types/call.ts
web/src/modules/agent/call/types/index.ts

web/src/modules/agent/call/call.css
```

Phase 3 可能新增：

```text
web/src/components/media/MediaStreamPlayer.vue
```

---

## 修改

必须：

```text
web/src/router/index.ts
```

后续可能：

```text
web/src/modules/agent/views/AgentView.vue
web/src/modules/agent/views/AgentView.module.css
web/src/modules/teleoperation/components/camera/CameraLayer.vue
```

文档：

```text
web/src/modules/agent/README.md
docs/frontend_architecture.md
```

不建议修改：

```text
web/src/assets/theme.css
web/src/components/ui/Button.vue
web/src/modules/teleoperation/teleoperation.css
```

除非确有共享基础设施需求。

---

# 7. 代码质量要求

## 7.1 TypeScript

当前 `tsconfig.json` 已启用：

```text
strict
noUnusedLocals
noUnusedParameters
noFallthroughCasesInSwitch
```

新增代码必须满足。

禁止：

```ts
any
```

除非第三方 API 无法避免，并必须局部化。

---

## 7.2 Vue

统一：

```vue
<script setup lang="ts">
```

Props / Emits 显式类型。

组件职责保持窄。

禁止：

- 巨型 500 行 View；
- 组件中直接 fetch/RTC；
- DOM query；
- `window.foo` 全局状态；
- 通过 CSS class 字符串作为业务状态来源。

---

## 7.3 CSS

原则：

```text
baseline fidelity > generic design-system reuse
```

Call CSS 必须以：

```css
.agent-call-page
```

作为命名空间。

类名推荐：

```text
agent-call-page
call-media
call-overlay
call-topbar
call-camera-menu
call-status
call-controls
call-control
call-more-sheet
call-toast
```

不要继续沿用 HTML 原型过于通用的：

```text
.control
.status
.overlay
```

否则容易污染其他模块。

---

## 7.4 不做过度抽象

第一版不需要：

```text
GenericOverlayController
GenericMediaSessionManager
UniversalRoundControl
GenericActionRegistry
```

只抽象项目现在真实存在的复用点。

---

# 8. 提交策略

为了便于审查，又避免几十个碎提交，推荐开发分支内 5 个逻辑提交：

```text
docs(call): freeze call visual baseline

feat(call): migrate call visual interface to vue

feat(call): add call interaction state

refactor(call): integrate camera and media abstractions

test(call): add call regression coverage
```

如果最终希望 `develop` 历史简洁，可以在功能分支完成后 squash 为：

```text
feat(call): add realtime agent call interface
```

不要每改一个按钮就一个提交。

---

# 9. 明确禁止事项

整个迁移期间禁止：

1. 为了“统一 UI”把六个主按钮换成现有 `Button.vue`；
2. 把 baseline SVG 全部替换成 Lucide；
3. 把 `call.css` 重写成 Tailwind；
4. 修改已确认的透明度；
5. 给关闭按钮重新增加 `backdrop-filter`；
6. 修改字幕字号和 slash，仅因为“感觉更规范”；
7. 改动 Voice Orb 渐变；
8. 改动视频 crop；
9. 把 Call 塞进 Teleoperation module；
10. 复制一套新的 WebRTC 实现；
11. 直接跨模块 import Teleoperation `CameraLayer.vue`；
12. 第一版就创建全局 Call Pinia Store；
13. 在视觉一致性尚未完成时同时重构 Agent 页面；
14. 开发一小步就停止，不完成当前 Phase；
15. 未运行页面，仅根据代码认为“应该一样”。

---

# 10. 最终验收标准

## 视觉

- [ ] `/call` 在 390×844 下与 baseline 接近 1:1；
- [ ] 430×932 正常；
- [ ] 768×1024 正常；
- [ ] 1366×768 正常；
- [ ] 1920×1080 正常；
- [ ] 视频 crop 一致；
- [ ] TopBar 一致；
- [ ] Status 一致；
- [ ] Controls geometry 一致；
- [ ] Button alpha 一致；
- [ ] off 状态无局部模糊；
- [ ] Subtitle 初始状态正确；
- [ ] Subtitle 恢复状态正确；
- [ ] Voice Orb 正确；
- [ ] Camera Menu 正确；
- [ ] More Sheet 正确；
- [ ] Safe Area 正确。

## 交互

- [ ] Mic toggle；
- [ ] Camera toggle；
- [ ] Subtitle toggle；
- [ ] Speaker toggle；
- [ ] Camera source open/select/close；
- [ ] More open/close；
- [ ] End；
- [ ] Toast；
- [ ] camera-off Voice Mode。

## 架构

- [ ] Call 属于 `modules/agent/call`；
- [ ] 没有复制 WebRTC；
- [ ] 没有直接依赖 Teleoperation UI；
- [ ] UI 不知道 ROS2；
- [ ] CameraSource 是前端 Domain Model；
- [ ] service / composable / component 边界清晰；
- [ ] Mock 可替换；
- [ ] 页面状态没有无必要 Pinia 化。

## 工程

- [ ] `pnpm run lint`；
- [ ] `pnpm run test`；
- [ ] `pnpm run build`；
- [ ] Agent 无回归；
- [ ] Teleoperation 无回归；
- [ ] TypeScript strict 无错误；
- [ ] 无 unused code；
- [ ] 无 console error；
- [ ] video / MediaStream 页面退出后正确释放。

---

# 11. 最终推荐开发顺序

Codex 或人工开发时，严格执行：

```text
1. 冻结 HTML baseline
        ↓
2. 创建 /call + Vue 静态页面
        ↓
3. 对照截图做到视觉 1:1
        ↓
4. 迁移 Mic / Camera / Subtitle / Speaker 等 Vue 状态
        ↓
5. 再次视觉回归
        ↓
6. 加 CallService + Mock
        ↓
7. 加 CameraSource domain
        ↓
8. 接 Local Camera / Robot Camera Adapter
        ↓
9. 提取 shared MediaStreamPlayer
        ↓
10. 回归 Teleoperation
        ↓
11. 接入 Agent 页面入口
        ↓
12. 完成 unit test / visual regression / docs
```

其中第 3 步和第 5 步是硬 Gate。

**视觉没有达到 baseline 时，不进入下一阶段。**

这能避免再次出现：

```text
Vue 化
+ 改图标
+ 改 CSS
+ 改 Camera
+ 改组件
```

同时发生，最后无法判断到底哪项修改破坏了效果的问题。
