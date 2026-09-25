<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import WebRTCPlayer from './WebRTCPlayer.vue';
import CameraStatus from './CameraStatus.vue';
import type { CameraConnectionStatus } from '../../types/camera';
import './camera.css';

const props = defineProps<{
  stream: MediaStream | null;
  status: CameraConnectionStatus;
  error: string | null;
}>();

const playbackError = ref<string | null>(null);
watch(
  () => props.stream,
  () => {
    playbackError.value = null;
  },
);
const displayedStatus = computed(() => (playbackError.value ? 'error' : props.status));
const displayedError = computed(() => playbackError.value ?? props.error);
</script>

<template>
  <div class="teleop-camera-layer">
    <WebRTCPlayer :stream="stream" @playback-error="playbackError = $event" />
    <CameraStatus :status="displayedStatus" :error="displayedError" />
  </div>
</template>
