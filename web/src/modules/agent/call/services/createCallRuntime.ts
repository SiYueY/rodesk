import type { InjectionKey } from 'vue';
import { useWebRTC } from '@/modules/teleoperation/composables/useWebRTC';
import type { CameraSignaling } from '@/modules/teleoperation/services/camera.service';
import { MockCallService } from '../mock/MockCallService';
import { MockCallCameraAdapter } from '../mock/MockCallCameraAdapter';
import { LocalCameraAdapter } from './LocalCameraAdapter';
import { RobotCameraAdapter } from './RobotCameraAdapter';
import { SourceCameraAdapter } from './SourceCameraAdapter';
import type { CallCameraAdapter } from './camera.adapter';
import type { CallService } from './call.service';

export interface CallRuntime {
  service: CallService;
  camera: CallCameraAdapter;
}

export interface CallRuntimeOptions {
  service?: CallService;
  cameraMode?: 'mock' | 'devices';
  signaling?: CameraSignaling;
}

export const callRuntimeFactoryKey: InjectionKey<() => CallRuntime> = Symbol('callRuntimeFactory');

/** Real devices and backend signaling can be injected at the application boundary. */
export function createCallRuntime(options: CallRuntimeOptions = {}): CallRuntime {
  return {
    service: options.service ?? new MockCallService(),
    camera:
      options.cameraMode === 'devices'
        ? new SourceCameraAdapter(
            new LocalCameraAdapter(),
            options.signaling ? new RobotCameraAdapter(useWebRTC(options.signaling)) : null,
          )
        : new MockCallCameraAdapter(),
  };
}
