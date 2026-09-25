import { onMounted, onUnmounted, ref } from 'vue';
import { teleoperationService } from '../services';
import type { VelocityCommand } from '../types';

export type TeleoperationConnectionStatus = 'connecting' | 'connected' | 'failed';

const stopCommand: VelocityCommand = {
  linearX: 0,
  linearY: 0,
  angularZ: 0,
};

export function useTeleoperationSession() {
  const connectionStatus = ref<TeleoperationConnectionStatus>('connecting');
  const error = ref<string | null>(null);

  async function connect() {
    connectionStatus.value = 'connecting';
    error.value = null;

    try {
      await teleoperationService.connect();
      connectionStatus.value = 'connected';
    } catch (reason) {
      connectionStatus.value = 'failed';
      error.value = reason instanceof Error ? reason.message : '无法连接遥操服务';
    }
  }

  async function stop() {
    if (connectionStatus.value !== 'connected') return;

    try {
      await teleoperationService.sendVelocity(stopCommand);
    } catch (reason) {
      connectionStatus.value = 'failed';
      error.value = reason instanceof Error ? reason.message : '无法发送停止命令';
    }
  }

  onMounted(() => {
    void connect();
  });

  onUnmounted(() => {
    void teleoperationService.disconnect();
  });

  return {
    connectionStatus,
    error,
    stop,
  };
}
