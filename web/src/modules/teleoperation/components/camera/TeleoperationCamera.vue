<script setup lang="ts">
defineProps<{ status: 'connecting' | 'connected' | 'failed' }>();
</script>

<template>
  <div class="teleop-camera" role="img" :aria-label="`机器人相机背景，状态：${status}`" />
</template>
