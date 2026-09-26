import type { Ref, ShallowRef } from 'vue';
import type { CameraConnectionStatus } from '@/modules/teleoperation/types/camera';
import type { CameraSource } from '../types';

export interface CallCameraAdapter {
  readonly stream: Readonly<ShallowRef<MediaStream | null>>;
  readonly status: Readonly<Ref<CameraConnectionStatus>>;
  readonly error: Readonly<Ref<string | null>>;
  open(source: CameraSource): Promise<void>;
  close(): void;
}
