<script setup lang="ts">
import { Circle } from 'lucide-vue-next';

defineProps<{
  label: string;
}>();
</script>

<template>
  <section class="flex flex-col items-center gap-3" :aria-label="label">
    <div
      class="flex h-28 w-28 items-center justify-center rounded-full border border-border bg-card shadow-sm sm:h-32 sm:w-32"
    >
      <div
        class="flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary"
      >
        <Circle :size="18" fill="currentColor" />
      </div>
    </div>
    <span class="text-sm font-medium text-muted-foreground">{{ label }}</span>
  </section>
</template>
