<script setup lang="ts">
defineProps<{
  title: string;
  side: 'left' | 'right';
  rows: ReadonlyArray<{ label: string; value: string }>;
}>();
</script>

<template>
  <div
    class="teleop-panel"
    :class="side === 'left' ? 'teleop-panel--left' : 'teleop-panel--right'"
    @click.stop
  >
    <div class="teleop-panel__title">{{ title }}</div>
    <div v-for="row in rows" :key="row.label" class="teleop-panel__row">
      <span>{{ row.label }}</span
      ><span>{{ row.value }}</span>
    </div>
  </div>
</template>
