<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import CameraStatus from './CameraStatus.vue';
import type { CameraConnectionStatus } from '../../types/camera';
import './camera.css';

const mockVideoUrl = `${import.meta.env.BASE_URL}media/unitree-camera-mock.mp4`;
const video = ref<HTMLVideoElement | null>(null);
const status = ref<CameraConnectionStatus>('connecting');
const error = ref<string | null>(null);

function reportPlaybackError(reason: unknown) {
  if (reason instanceof DOMException && reason.name === 'AbortError') return;
  status.value = 'error';
  error.value = reason instanceof Error ? reason.message : '本地 Mock 相机视频播放失败';
}

function startPlayback() {
  const element = video.value;
  if (!element) return;
  status.value = 'connecting';
  error.value = null;
  void element.play().catch(reportPlaybackError);
}

function onPlaying() {
  status.value = 'connected';
  error.value = null;
}

function onVideoError() {
  reportPlaybackError(video.value?.error);
}

onMounted(startPlayback);
onUnmounted(() => {
  video.value?.pause();
  video.value?.removeAttribute('src');
  video.value?.load();
});
</script>

<template>
  <div class="teleop-camera-layer">
    <video
      ref="video"
      class="teleop-camera-player"
      :src="mockVideoUrl"
      autoplay
      playsinline
      muted
      loop
      aria-label="机器人相机模拟画面"
      @playing="onPlaying"
      @error="onVideoError"
    />
    <CameraStatus :status="status" :error="error" />
    <button
      v-if="status === 'error'"
      class="teleop-camera-retry"
      type="button"
      @click="startPlayback"
    >
      点击重试视频播放
    </button>
  </div>
</template>
