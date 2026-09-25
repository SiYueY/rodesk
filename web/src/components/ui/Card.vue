<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{ class?: string }>();
const attrs = useAttrs();
const classes = computed(() =>
  cn(
    'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
    props.class,
    attrs.class,
  ),
);
</script>

<template>
  <div v-bind="attrs" :class="classes">
    <slot />
  </div>
</template>
