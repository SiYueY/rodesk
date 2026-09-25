<script setup lang="ts">
import { computed } from 'vue';
import { ArrowLeft } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui';
import TeleoperationCamera from '../components/TeleoperationCamera.vue';
import VirtualJoystick from '../components/VirtualJoystick.vue';
import StopControl from '../components/StopControl.vue';
import { useTeleoperationSession } from '../composables/useTeleoperationSession';

const router = useRouter();
const { connectionStatus, error, stop } = useTeleoperationSession();
const stopDisabled = computed(() => connectionStatus.value !== 'connected');
</script>

<template>
  <main class="h-full overflow-y-auto bg-background text-foreground">
    <div class="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-8 px-5 py-5 sm:px-8 sm:py-8">
      <header class="flex items-center gap-4">
        <Button variant="ghost" size="sm" title="返回 Agent" @click="router.push('/')">
          <ArrowLeft :size="17" />
          <span class="ml-2">返回 Agent</span>
        </Button>
        <div>
          <p class="m-0 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Teleoperation
          </p>
          <h1 class="mt-1 text-2xl font-semibold tracking-tight">机器人遥操</h1>
        </div>
      </header>

      <TeleoperationCamera :status="connectionStatus" />

      <p v-if="error" class="m-0 text-sm text-destructive" role="alert">{{ error }}</p>

      <section class="grid grid-cols-2 gap-6 sm:gap-12" aria-label="虚拟控制杆">
        <VirtualJoystick label="Left Stick" />
        <VirtualJoystick label="Right Stick" />
      </section>

      <div class="flex justify-center pb-4">
        <StopControl :disabled="stopDisabled" @stop="stop" />
      </div>
    </div>
  </main>
</template>
