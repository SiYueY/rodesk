<script setup lang="ts">
defineProps<{ disabled: boolean }>();
const emit = defineEmits<{ stop: [] }>();
</script>

<template>
  <button class="teleop-stop" type="button" :disabled="disabled" @click="emit('stop')">STOP</button>
</template>
