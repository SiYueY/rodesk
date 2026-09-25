<script setup lang="ts">
import { OctagonX } from 'lucide-vue-next';
import { Button } from '@/components/ui';

defineProps<{
  disabled: boolean;
}>();

const emit = defineEmits<{
  stop: [];
}>();
</script>

<template>
  <Button variant="destructive" size="lg" :disabled="disabled" @click="emit('stop')">
    <OctagonX :size="18" />
    <span class="ml-2">STOP</span>
  </Button>
</template>
