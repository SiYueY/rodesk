<script setup lang="ts">
import { watch, nextTick, ref } from 'vue';
import { onKeyStroke } from '@vueuse/core';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: []; scenario: []; subtitle: []; device: [] }>();
const firstAction = ref<HTMLButtonElement | null>(null);
watch(
  () => props.open,
  (open) => {
    if (open) void nextTick(() => firstAction.value?.focus());
  },
);
onKeyStroke('Escape', () => {
  if (props.open) emit('close');
});
</script>

<template>
  <div class="call-sheet-backdrop" :class="{ open }" @click.self="emit('close')">
    <section class="call-sheet" role="dialog" aria-modal="true" aria-label="更多通话选项">
      <div class="call-grabber" aria-hidden="true" />
      <div class="call-sheet-grid">
        <button ref="firstAction" type="button" @click="emit('scenario')">切换情景</button>
        <button type="button" @click="emit('subtitle')">字幕</button>
        <button type="button" @click="emit('device')">设备</button>
      </div>
    </section>
  </div>
</template>
