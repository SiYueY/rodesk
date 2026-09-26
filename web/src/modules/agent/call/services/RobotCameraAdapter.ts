import type { CameraService } from '@/modules/teleoperation/services/camera.service';
import type { CameraSource } from '../types';
import type { CallCameraAdapter } from './camera.adapter';

export class RobotCameraAdapter implements CallCameraAdapter {
  constructor(private readonly camera: CameraService) {}
  get stream() {
    return this.camera.stream;
  }
  get status() {
    return this.camera.status;
  }
  get error() {
    return this.camera.error;
  }

  async open(source: CameraSource): Promise<void> {
    if (source.type !== 'robot' || !source.robotId || !source.cameraId)
      throw new Error('Invalid robot camera source');
    await this.camera.connect(source.robotId, source.cameraId);
  }
  close(): void {
    this.camera.disconnect();
  }
}
