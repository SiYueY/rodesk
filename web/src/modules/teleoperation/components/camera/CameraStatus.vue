<script setup lang="ts">
import { computed } from 'vue';
import type { CameraConnectionStatus } from '../../types/camera';

const props = defineProps<{
  status: CameraConnectionStatus;
  error: string | null;
}>();

const label = computed(() => {
  switch (props.status) {
    case 'connecting':
      return 'Connecting';
    case 'connected':
      return 'Connected';
    case 'error':
      return 'Error';
    case 'disconnected':
      return 'Disconnected';
    default:
      return 'Idle';
  }
});
</script>

<template>
  <div
    class="teleop-camera-status"
    :class="`teleop-camera-status--${status}`"
    role="status"
    aria-live="polite"
  >
    <span class="teleop-camera-status__dot" aria-hidden="true" />
    <span>{{ label }}</span>
    <span v-if="error" class="teleop-camera-status__error">{{ error }}</span>
  </div>
</template>
