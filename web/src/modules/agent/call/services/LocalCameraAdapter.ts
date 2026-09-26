import { ref, shallowRef } from 'vue';
import type { CallCameraAdapter } from './camera.adapter';
import type { CameraSource } from '../types';
import type { CameraConnectionStatus } from '@/modules/teleoperation/types/camera';

export class LocalCameraAdapter implements CallCameraAdapter {
  readonly stream = shallowRef<MediaStream | null>(null);
  readonly status = ref<CameraConnectionStatus>('idle');
  readonly error = ref<string | null>(null);
  private generation = 0;

  async open(source: CameraSource): Promise<void> {
    if (source.type !== 'local' || !source.facingMode)
      throw new Error('Invalid local camera source');
    this.close();
    const current = this.generation;
    this.status.value = 'connecting';
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access is unavailable');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: source.facingMode },
        audio: false,
      });
      if (current !== this.generation) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      this.stream.value = stream;
      this.status.value = 'connected';
    } catch (reason) {
      if (current !== this.generation) return;
      this.error.value = reason instanceof Error ? reason.message : '无法打开本地摄像头';
      this.status.value = 'error';
      throw reason;
    }
  }

  close(): void {
    this.generation += 1;
    this.stream.value?.getTracks().forEach((track) => track.stop());
    this.stream.value = null;
    this.error.value = null;
    this.status.value = 'disconnected';
  }
}
