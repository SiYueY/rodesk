<script setup lang="ts">
import { computed, ref } from 'vue';
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
import CameraLayer from '../components/camera/CameraLayer.vue';
import { MockCameraService } from '../mock/MockCameraService';
import { useCamera } from '../composables/useCamera';
import { useTeleoperationSession } from '../composables/useTeleoperationSession';
import { useTeleoperationLayout } from '../composables/useTeleoperationLayout';
import type { JoystickAxes } from '../types';
import '../teleoperation.css';

type OpenPanel = 'info' | 'status' | null;
const router = useRouter();
const { connectionStatus, error, stop } = useTeleoperationSession();
const { layoutStyle } = useTeleoperationLayout();
const {
  status: cameraStatus,
  stream: cameraStream,
  error: cameraError,
} = useCamera(new MockCameraService(), 'ROBOT-01', 'front');
const stopDisabled = computed(() => connectionStatus.value !== 'connected');
const leftAxes = ref<JoystickAxes>({ x: 0, y: 0 });
const rightAxes = ref<JoystickAxes>({ x: 0, y: 0 });
const openPanel = ref<OpenPanel>(null);

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
</script>

<template>
  <div class="teleoperation-page" :style="layoutStyle" @click="openPanel = null">
    <TeleoperationLayout>
      <template #camera>
        <CameraLayer :stream="cameraStream" :status="cameraStatus" :error="cameraError" />
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
              type="button"
              aria-label="机器人信息"
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
              type="button"
              aria-label="机器人状态"
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
          <VirtualJoystick label="Left Stick" @change="leftAxes = $event" />
        </LeftJoystickZone>
      </template>

      <template #telemetry>
        <BottomTelemetryZone>
          <TelemetryReadout :left="leftAxes" :right="rightAxes" />
        </BottomTelemetryZone>
      </template>

      <template #right-joystick>
        <RightJoystickZone>
          <VirtualJoystick label="Right Stick" @change="rightAxes = $event" />
        </RightJoystickZone>
      </template>
    </TeleoperationLayout>
  </div>
</template>
