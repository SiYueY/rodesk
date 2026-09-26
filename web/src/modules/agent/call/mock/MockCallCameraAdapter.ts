import { ref, shallowRef } from 'vue';
import type { CameraConnectionStatus } from '@/modules/teleoperation/types/camera';
import type { CallCameraAdapter } from '../services/camera.adapter';
import type { CameraSource } from '../types';

/** Keeps the baseline video while the call backend is unavailable. */
export class MockCallCameraAdapter implements CallCameraAdapter {
  readonly stream = shallowRef<MediaStream | null>(null);
  readonly status = ref<CameraConnectionStatus>('connected');
  readonly error = ref<string | null>(null);
  async open(_source: CameraSource): Promise<void> {
    this.status.value = 'connected';
  }
  close(): void {
    this.status.value = 'disconnected';
  }
}
