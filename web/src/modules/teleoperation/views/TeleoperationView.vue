<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { ArrowLeft } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui';
import TeleoperationLayout from '../components/layout/TeleoperationLayout.vue';
import HeaderZone from '../components/zones/HeaderZone.vue';
import LeftButtonZone from '../components/zones/LeftButtonZone.vue';
import CenterOverlayZone from '../components/zones/CenterOverlayZone.vue';
import RightButtonZone from '../components/zones/RightButtonZone.vue';
import LeftJoystickZone from '../components/zones/LeftJoystickZone.vue';
import BottomTelemetryZone from '../components/zones/BottomTelemetryZone.vue';
import RightJoystickZone from '../components/zones/RightJoystickZone.vue';
import OverlayPanel from '../components/controls/OverlayPanel.vue';
import TelemetryReadout from '../components/controls/TelemetryReadout.vue';
import VirtualJoystick from '../components/controls/VirtualJoystick.vue';
import StopControl from '../components/controls/StopControl.vue';
import MockCameraLayer from '../components/camera/MockCameraLayer.vue';
import { useTeleoperationSession } from '../composables/useTeleoperationSession';
import { useTeleoperationLayout } from '../composables/useTeleoperationLayout';
import { enterTeleoperationImmersiveMode, leaveTeleoperationImmersiveMode } from '../immersive';
import type { JoystickSource, JoystickState } from '../types';
import '../teleoperation.css';

type OpenPanel = 'info' | 'status' | null;
const router = useRouter();
const { connectionStatus, error, stop } = useTeleoperationSession();
const { layoutStyle } = useTeleoperationLayout();
const stopDisabled = computed(() => connectionStatus.value !== 'connected');
const joysticks = ref<Record<JoystickSource, JoystickState>>({
  left: { x: 0, y: 0, active: false },
  right: { x: 0, y: 0, active: false },
});
const openPanel = ref<OpenPanel>(null);
const touchDevice = ref(false);
const portrait = ref(false);
const fullscreen = ref(false);
const fullscreenSupported = ref(false);

function updateImmersiveState() {
  touchDevice.value = window.matchMedia('(pointer: coarse)').matches;
  portrait.value = window.innerHeight > window.innerWidth;
  fullscreen.value = !!document.fullscreenElement;
  fullscreenSupported.value = document.fullscreenEnabled;
}

onMounted(() => {
  updateImmersiveState();
  window.addEventListener('resize', updateImmersiveState);
  document.addEventListener('fullscreenchange', updateImmersiveState);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateImmersiveState);
  document.removeEventListener('fullscreenchange', updateImmersiveState);
  leaveTeleoperationImmersiveMode();
});

function enterImmersiveMode() {
  void enterTeleoperationImmersiveMode().finally(updateImmersiveState);
}

const infoRows = [
  { label: 'Model', value: 'Unitree' },
  { label: 'ID', value: 'ROBOT-01' },
  { label: 'Mode', value: 'Stand' },
];
const statusRows = [
  { label: 'Battery', value: '82%' },
  { label: 'Network', value: 'Online' },
  { label: 'Temp', value: 'Normal' },
];

function returnToAgent() {
  void router.push('/');
}

function togglePanel(panel: Exclude<OpenPanel, null>) {
  openPanel.value = openPanel.value === panel ? null : panel;
}

const hoverableButtonSelector = '.teleop-header-zone__back, .teleop-action, .teleop-stop';

function buttonFromPointer(event: PointerEvent): HTMLButtonElement | null {
  return event.target instanceof Element
    ? event.target.closest<HTMLButtonElement>(hoverableButtonSelector)
    : null;
}

function onButtonPointerOver(event: PointerEvent) {
  const button = buttonFromPointer(event);
  if (
    !button ||
    button.disabled ||
    (event.relatedTarget instanceof Node && button.contains(event.relatedTarget))
  )
    return;
  if (event.pointerType === 'mouse' || (event.pointerType === 'pen' && event.buttons === 0)) {
    button.classList.add('teleop-button--hovered');
  }
}

function onButtonPointerOut(event: PointerEvent) {
  const button = buttonFromPointer(event);
  if (button && !(event.relatedTarget instanceof Node && button.contains(event.relatedTarget))) {
    button.classList.remove('teleop-button--hovered');
  }
}

function onButtonPointerDown(event: PointerEvent) {
  if (event.pointerType === 'touch')
    buttonFromPointer(event)?.classList.remove('teleop-button--hovered');
}

function onJoystickChange(source: JoystickSource, state: JoystickState) {
  joysticks.value = { ...joysticks.value, [source]: state };
}
</script>

<template>
  <div
    class="teleoperation-page"
    :style="layoutStyle"
    @click="openPanel = null"
    @pointerover="onButtonPointerOver"
    @pointerout="onButtonPointerOut"
    @pointerdown="onButtonPointerDown"
  >
    <div
      v-if="touchDevice && (portrait || (fullscreenSupported && !fullscreen))"
      class="teleop-rotate-prompt"
      :class="{ 'teleop-rotate-prompt--landscape': !portrait }"
    >
      <button
        v-if="fullscreenSupported && !fullscreen"
        type="button"
        @click.stop="enterImmersiveMode"
      >
        点击进入横屏全屏
      </button>
      <span v-else>请将设备横屏使用</span>
    </div>
    <TeleoperationLayout>
      <template #camera>
        <MockCameraLayer />
      </template>

      <template #header>
        <HeaderZone>
          <Button
            class="teleop-header-zone__back"
            variant="ghost"
            size="icon"
            type="button"
            aria-label="返回 Agent"
            @click.stop="returnToAgent"
          >
            <ArrowLeft :size="20" aria-hidden="true" />
          </Button>
          <div class="teleop-header-zone__mode">常规模式</div>
          <div class="teleop-header-zone__status">5G&nbsp;&nbsp;WiFi&nbsp;&nbsp;82%</div>
        </HeaderZone>
      </template>

      <template #left-buttons>
        <LeftButtonZone>
          <div class="teleop-tools teleop-tools--left">
            <button
              class="teleop-action"
              :class="{ 'teleop-action--selected': openPanel === 'info' }"
              type="button"
              aria-label="机器人信息"
              :aria-expanded="openPanel === 'info'"
              @click.stop="togglePanel('info')"
            >
              人
            </button>
            <button class="teleop-action" type="button" aria-label="其他操作">▦</button>
          </div>
        </LeftButtonZone>
      </template>

      <template #overlay>
        <CenterOverlayZone>
          <OverlayPanel
            v-if="openPanel === 'info'"
            title="Robot Info"
            side="left"
            :rows="infoRows"
          />
          <OverlayPanel
            v-if="openPanel === 'status'"
            title="Robot Status"
            side="right"
            :rows="statusRows"
          />
          <p v-if="error" class="teleop-error" role="alert">{{ error }}</p>
        </CenterOverlayZone>
      </template>

      <template #right-buttons>
        <RightButtonZone>
          <StopControl :disabled="stopDisabled" @stop="stop" />
          <div class="teleop-tools teleop-tools--right">
            <button
              class="teleop-action"
              :class="{ 'teleop-action--selected': openPanel === 'status' }"
              type="button"
              aria-label="机器人状态"
              :aria-expanded="openPanel === 'status'"
              @click.stop="togglePanel('status')"
            >
              ⌖
            </button>
            <button class="teleop-action" type="button" aria-label="其他操作">⌘</button>
          </div>
        </RightButtonZone>
      </template>

      <template #left-joystick>
        <LeftJoystickZone>
          <VirtualJoystick id="left" @change="onJoystickChange('left', $event)" />
        </LeftJoystickZone>
      </template>

      <template #telemetry>
        <BottomTelemetryZone>
          <TelemetryReadout :left="joysticks.left" :right="joysticks.right" />
        </BottomTelemetryZone>
      </template>

      <template #right-joystick>
        <RightJoystickZone>
          <VirtualJoystick id="right" @change="onJoystickChange('right', $event)" />
        </RightJoystickZone>
      </template>
    </TeleoperationLayout>
  </div>
</template>
