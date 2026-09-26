<script setup lang="ts">
import { ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import CameraSourceMenu from './CameraSourceMenu.vue';
import type { CameraSource } from '../types';

const props = defineProps<{
  cameraEnabled: boolean;
  ended: boolean;
  cameraMenuOpen: boolean;
  selectedCameraId: string;
  cameraSources: CameraSource[];
}>();
const emit = defineEmits<{
  scenario: [];
  'toggle-camera-menu': [];
  'select-camera': [id: string];
  'close-camera-menu': [];
}>();
const menu = ref<InstanceType<typeof CameraSourceMenu> | null>(null);
const trigger = ref<HTMLButtonElement | null>(null);
onClickOutside(
  () => menu.value?.element ?? null,
  () => {
    if (props.cameraMenuOpen) emit('close-camera-menu');
  },
  { ignore: [trigger] },
);
</script>

<template>
  <header class="call-topbar">
    <button class="call-scenario" type="button" :disabled="ended" @click="emit('scenario')">
      <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
        <rect height="7" rx="2" width="7" x="3" y="3"></rect>
        <rect height="7" rx="2" width="7" x="14" y="3"></rect>
        <rect height="7" rx="2" width="7" x="3" y="14"></rect>
        <rect height="7" rx="2" width="7" x="14" y="14"></rect>
      </svg>
      <span> 选择情景 </span>
    </button>
    <div class="call-camera-tools">
      <button
        :aria-expanded="cameraMenuOpen"
        aria-haspopup="menu"
        aria-label="选择摄像头来源"
        class="call-icon-btn"
        :disabled="!cameraEnabled || ended"
        ref="trigger"
        @click="emit('toggle-camera-menu')"
        type="button"
      >
        <svg
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <rect height="10" rx="2" width="10" x="5" y="7"></rect>
          <path d="M15 10l4-2v8l-4-2"></path>
          <path d="M8 4h8"></path>
          <path d="M8 20h8"></path>
          <path d="M3 12h2"></path>
        </svg>
      </button>
    </div>
    <CameraSourceMenu
      ref="menu"
      :sources="cameraSources"
      :selected-id="selectedCameraId"
      :open="cameraMenuOpen"
      @select="emit('select-camera', $event)"
    />
  </header>
</template>
