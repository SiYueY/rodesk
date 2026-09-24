<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'secondary' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    class?: string;
  }>(),
  {
    variant: 'default',
    size: 'default',
  },
);

const classes = computed(() =>
  cn(
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
    {
      'bg-primary text-primary-foreground hover:bg-primary/90': props.variant === 'default',
      'bg-secondary text-secondary-foreground hover:bg-secondary/80': props.variant === 'secondary',
      'border border-input bg-background hover:bg-accent': props.variant === 'outline',
      'hover:bg-accent hover:text-accent-foreground': props.variant === 'ghost',
    },
    {
      'h-10 px-4 py-2': props.size === 'default',
      'h-9 px-3': props.size === 'sm',
      'h-11 px-8': props.size === 'lg',
    },
    props.class,
  ),
);
</script>

<template>
  <button :class="classes">
    <slot />
  </button>
</template>
