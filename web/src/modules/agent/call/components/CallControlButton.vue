<script setup lang="ts">
defineProps<{ label: string; enabled: boolean; disabled?: boolean }>();
const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <button
    class="call-control"
    :class="{ 'is-off': !enabled }"
    type="button"
    :aria-label="label"
    :aria-pressed="enabled"
    :disabled="disabled"
    @click="emit('click')"
  >
    <slot />
    <span class="call-slash" aria-hidden="true" />
  </button>
</template>
