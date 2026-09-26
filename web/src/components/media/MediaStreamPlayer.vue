<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';

const props = withDefaults(defineProps<{ stream: MediaStream | null; muted?: boolean }>(), {
  muted: true,
});
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

onBeforeUnmount(() => {
  if (video.value) video.value.srcObject = null;
});
</script>

<template>
  <video ref="video" autoplay playsinline :muted="muted" />
</template>
