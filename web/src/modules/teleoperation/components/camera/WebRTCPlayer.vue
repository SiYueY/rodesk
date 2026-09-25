<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue';

const props = defineProps<{ stream: MediaStream | null }>();
const emit = defineEmits<{ 'playback-error': [message: string] }>();
const video = ref<HTMLVideoElement | null>(null);

watch(
  [() => props.stream, video],
  ([stream, element]) => {
    if (!element) return;
    element.srcObject = stream;
    if (stream) {
      void element.play().catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        emit('playback-error', reason instanceof Error ? reason.message : 'Camera playback failed');
      });
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  if (video.value) video.value.srcObject = null;
});
</script>

<template>
  <video
    ref="video"
    class="teleop-camera-player"
    autoplay
    playsinline
    muted
    aria-label="机器人相机画面"
  />
</template>
