import { onMounted, onUnmounted } from 'vue';
import type { CameraService } from '../services/camera.service';

export function useCamera(service: CameraService, robotId: string, cameraId: string) {
  async function connect() {
    return service.connect(robotId, cameraId);
  }

  onMounted(() => {
    void connect().catch(() => {
      // The service exposes the error through its reactive status and error refs.
    });
  });
  onUnmounted(() => service.disconnect());

  return {
    status: service.status,
    stream: service.stream,
    error: service.error,
    connect,
    disconnect: () => service.disconnect(),
  };
}
