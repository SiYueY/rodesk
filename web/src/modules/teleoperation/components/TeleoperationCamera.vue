<script setup lang="ts">
import { Camera, CircleDot } from 'lucide-vue-next';
import { Card } from '@/components/ui';

defineProps<{
  status: 'connecting' | 'connected' | 'failed';
}>();
</script>

<template>
  <Card
    class="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-muted/40 p-0 sm:min-h-[440px]"
  >
    <div
      class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--dsw-static-neutral-bluish-100)_0,_transparent_70%)] opacity-70"
    />
    <div class="relative flex flex-col items-center gap-3 text-center">
      <div class="flex h-14 w-14 items-center justify-center rounded-full bg-background shadow-sm">
        <Camera :size="26" class="text-muted-foreground" />
      </div>
      <div>
        <h2 class="m-0 text-lg font-medium">Robot Camera</h2>
        <p class="mt-1 text-sm text-muted-foreground">设备视频流接入后将在这里显示</p>
      </div>
    </div>
    <div
      class="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm"
    >
      <CircleDot
        :size="14"
        :class="
          status === 'connected'
            ? 'text-primary'
            : status === 'failed'
              ? 'text-destructive'
              : 'text-muted-foreground'
        "
      />
      <span>{{
        status === 'connected'
          ? 'Mock connected'
          : status === 'failed'
            ? 'Connection failed'
            : 'Connecting'
      }}</span>
    </div>
  </Card>
</template>
