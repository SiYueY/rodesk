<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import MediaStreamPlayer from '@/components/media/MediaStreamPlayer.vue';

defineProps<{ stream: MediaStream | null; cameraEnabled: boolean }>();
const mockVideoUrl = `${import.meta.env.BASE_URL}media/unitree-camera-mock.mp4`;

const video = ref<HTMLVideoElement | null>(null);
const emit = defineEmits<{ 'playback-error': [message: string] }>();

function ensureVideoPlayback() {
  const element = video.value;
  if (!element) return;
  void element.play().catch((reason: unknown) => {
    if (reason instanceof DOMException && reason.name === 'AbortError') return;
    emit('playback-error', reason instanceof Error ? reason.message : '视频播放失败');
  });
}
function onVisibilityChange() {
  if (document.visibilityState === 'visible') ensureVideoPlayback();
}
function onVideoError() {
  emit('playback-error', video.value?.error?.message ?? '视频加载失败');
}
onMounted(() => {
  ensureVideoPlayback();
  document.addEventListener('visibilitychange', onVisibilityChange);
});
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange);
  video.value?.pause();
  video.value?.removeAttribute('src');
  video.value?.querySelector('source')?.removeAttribute('src');
  video.value?.load();
});
</script>

<template>
  <section class="call-media" aria-hidden="true">
    <video
      ref="video"
      class="call-media-video"
      autoplay
      muted
      loop
      playsinline
      webkit-playsinline
      preload="auto"
      @error="onVideoError"
    >
      <source :src="mockVideoUrl" type="video/mp4" />
    </video>
    <MediaStreamPlayer
      v-show="stream && cameraEnabled"
      class="call-media-video"
      :stream="stream"
      aria-label="当前摄像头画面"
      @playback-error="emit('playback-error', $event)"
    />
    <div class="call-video-shade" />
    <div class="call-voice-tint" />
    <div class="call-voice-orb-wrap"><div class="call-voice-orb" /></div>
  </section>
</template>
