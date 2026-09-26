<script setup lang="ts">
defineProps<{ label: string; showDots: boolean; ended: boolean }>();
const emit = defineEmits<{ cycle: [] }>();
</script>

<template>
  <button class="call-status" type="button" :disabled="ended" @click="emit('cycle')">
    <span v-if="showDots" class="call-dots" aria-hidden="true"><i /><i /><i /></span>
    <span>{{ label }}</span>
  </button>
</template>
