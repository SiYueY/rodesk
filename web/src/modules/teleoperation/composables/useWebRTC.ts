import { ref, shallowRef } from 'vue';
import type { CameraService, CameraSignaling } from '../services/camera.service';
import type { CameraConnectionStatus } from '../types/camera';

function cancellationError(): DOMException {
  return new DOMException('Camera session cancelled', 'AbortError');
}

function errorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : 'Camera connection failed';
}

function waitForIceGathering(peer: RTCPeerConnection, signal: AbortSignal): Promise<void> {
  if (peer.iceGatheringState === 'complete') return Promise.resolve();

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      peer.removeEventListener('icegatheringstatechange', onChange);
      signal.removeEventListener('abort', onAbort);
    };
    const onChange = () => {
      if (peer.iceGatheringState !== 'complete') return;
      cleanup();
      resolve();
    };
    const onAbort = () => {
      cleanup();
      reject(cancellationError());
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Camera ICE gathering timed out'));
    }, 10000);
    peer.addEventListener('icegatheringstatechange', onChange);
    signal.addEventListener('abort', onAbort, { once: true });
    if (signal.aborted) onAbort();
    else onChange();
  });
}

function waitForVideoTrack(peer: RTCPeerConnection, signal: AbortSignal): Promise<MediaStream> {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      peer.removeEventListener('track', onTrack);
      signal.removeEventListener('abort', onAbort);
    };
    const onTrack = (event: RTCTrackEvent) => {
      if (event.track.kind !== 'video') return;
      cleanup();
      resolve(event.streams[0] ?? new MediaStream([event.track]));
    };
    const onAbort = () => {
      cleanup();
      reject(cancellationError());
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Camera video track timed out'));
    }, 15000);
    peer.addEventListener('track', onTrack);
    signal.addEventListener('abort', onAbort, { once: true });
    if (signal.aborted) onAbort();
  });
}

/**
 * Browser-side WebRTC session. A gateway-specific signaling adapter can be
 * supplied later without exposing its HTTP protocol to TeleoperationView.
 */
export function useWebRTC(
  signaling: CameraSignaling,
  configuration: RTCConfiguration = {},
): CameraService {
  const status = ref<CameraConnectionStatus>('idle');
  const stream = shallowRef<MediaStream | null>(null);
  const error = ref<string | null>(null);
  let peer: RTCPeerConnection | null = null;
  let controller: AbortController | null = null;
  let generation = 0;

  function release() {
    controller?.abort();
    controller = null;
    peer?.close();
    peer = null;
    stream.value?.getTracks().forEach((track) => track.stop());
    stream.value = null;
  }

  function disconnect() {
    generation += 1;
    release();
    error.value = null;
    status.value = 'disconnected';
  }

  async function connect(robotId: string, cameraId: string): Promise<MediaStream> {
    disconnect();
    const session = generation;
    const abort = new AbortController();
    controller = abort;
    status.value = 'connecting';

    try {
      const connection = new RTCPeerConnection(configuration);
      peer = connection;
      let earlyStream: MediaStream | null = null;
      connection.addEventListener('track', (event) => {
        if (event.track.kind === 'video') {
          earlyStream = event.streams[0] ?? new MediaStream([event.track]);
        }
      });
      connection.addEventListener('connectionstatechange', () => {
        if (session !== generation) return;
        if (
          connection.connectionState === 'failed' ||
          connection.connectionState === 'disconnected'
        ) {
          const failed = connection.connectionState === 'failed';
          generation += 1;
          release();
          status.value = failed ? 'error' : 'disconnected';
          error.value = failed ? 'Camera peer connection failed' : null;
        }
      });
      connection.addTransceiver('video', { direction: 'recvonly' });
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      await waitForIceGathering(connection, abort.signal);
      if (session !== generation || !connection.localDescription) throw cancellationError();

      const answer = await signaling.exchangeOffer(
        robotId,
        cameraId,
        connection.localDescription,
        abort.signal,
      );
      if (session !== generation) throw cancellationError();
      await connection.setRemoteDescription(answer);
      if (session !== generation) throw cancellationError();

      const received = earlyStream ?? (await waitForVideoTrack(connection, abort.signal));
      if (session !== generation) throw cancellationError();
      stream.value = received;
      status.value = 'connected';
      return received;
    } catch (reason) {
      if (session === generation) {
        generation += 1;
        release();
        error.value = errorMessage(reason);
        status.value = 'error';
      }
      throw reason;
    }
  }

  return { status, stream, error, connect, disconnect };
}
