<script setup lang="ts">
import { ref } from 'vue';
import type { CameraSource } from '../types';

defineProps<{ sources: CameraSource[]; selectedId: string; open: boolean }>();
const emit = defineEmits<{ select: [id: string] }>();
const element = ref<HTMLElement | null>(null);
defineExpose({ element });
</script>

<template>
  <div ref="element" class="call-camera-source-menu" :class="{ show: open }" role="menu" aria-label="摄像头来源">
    <button
      v-for="source in sources"
      :key="source.id"
      class="call-camera-source-item"
      :class="{ active: source.id === selectedId }"
      type="button"
      role="menuitem"
      @click="emit('select', source.id)"
    >
      {{ source.label }}
    </button>
  </div>
</template>
