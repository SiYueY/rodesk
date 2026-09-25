<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    class?: string;
  }>(),
  {
    variant: 'default',
    size: 'default',
  },
);

const attrs = useAttrs();
const classes = computed(() =>
  cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
      'bg-primary text-primary-foreground hover:bg-primary/90': props.variant === 'default',
      'bg-secondary text-secondary-foreground hover:bg-secondary/80': props.variant === 'secondary',
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground':
        props.variant === 'outline',
      'hover:bg-accent hover:text-accent-foreground': props.variant === 'ghost',
      'bg-destructive text-destructive-foreground hover:bg-destructive/90':
        props.variant === 'destructive',
    },
    {
      'h-10 px-4 py-2': props.size === 'default',
      'h-9 px-3': props.size === 'sm',
      'h-11 px-8': props.size === 'lg',
      'h-10 w-10 p-0': props.size === 'icon',
    },
    props.class,
    attrs.class,
  ),
);
</script>

<template>
  <button v-bind="attrs" :class="classes">
    <slot />
  </button>
</template>
