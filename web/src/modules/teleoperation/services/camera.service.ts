import type { Ref, ShallowRef } from 'vue';
import type { CameraConnectionStatus } from '../types/camera';

export interface CameraService {
  readonly status: Readonly<Ref<CameraConnectionStatus>>;
  readonly stream: Readonly<ShallowRef<MediaStream | null>>;
  readonly error: Readonly<Ref<string | null>>;
  connect(robotId: string, cameraId: string): Promise<MediaStream>;
  disconnect(): void;
}

/**
 * The backend adapter owns its transport and wire format. The camera client only
 * exchanges browser SDP, leaving ROS2 and camera topics outside the frontend.
 */
export interface CameraSignaling {
  exchangeOffer(
    robotId: string,
    cameraId: string,
    offer: RTCSessionDescriptionInit,
    signal: AbortSignal,
  ): Promise<RTCSessionDescriptionInit>;
}
