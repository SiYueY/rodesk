import { afterEach, describe, expect, it, vi } from 'vitest';
import { useWebRTC } from './useWebRTC';
import type { CameraSignaling } from '../services/camera.service';

const stopTrack = vi.fn();
const remoteStream = {
  getTracks: () => [{ stop: stopTrack }],
} as unknown as MediaStream;

class FakePeerConnection extends EventTarget {
  static instances: FakePeerConnection[] = [];
  iceGatheringState = 'complete';
  connectionState = 'new';
  localDescription: RTCSessionDescriptionInit | null = null;
  closed = false;

  constructor() {
    super();
    FakePeerConnection.instances.push(this);
  }

  addTransceiver() {}
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    return { type: 'offer', sdp: 'mock-offer' };
  }
  async setLocalDescription(offer: RTCSessionDescriptionInit): Promise<void> {
    this.localDescription = offer;
  }
  async setRemoteDescription(): Promise<void> {
    const track = Object.assign(new Event('track'), {
      track: { kind: 'video' },
      streams: [remoteStream],
    });
    this.dispatchEvent(track);
  }
  close() {
    this.closed = true;
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  FakePeerConnection.instances = [];
});

describe('useWebRTC', () => {
  it('exchanges SDP, exposes the video stream, and releases the peer on disconnect', async () => {
    vi.stubGlobal('RTCPeerConnection', FakePeerConnection);
    const signaling: CameraSignaling = {
      exchangeOffer: vi.fn().mockResolvedValue({ type: 'answer', sdp: 'mock-answer' }),
    };
    const client = useWebRTC(signaling);

    await expect(client.connect('ROBOT-01', 'front')).resolves.toBe(remoteStream);
    expect(signaling.exchangeOffer).toHaveBeenCalledWith(
      'ROBOT-01',
      'front',
      { type: 'offer', sdp: 'mock-offer' },
      expect.any(AbortSignal),
    );
    expect(client.status.value).toBe('connected');
    expect(client.stream.value).toBe(remoteStream);

    client.disconnect();
    expect(FakePeerConnection.instances[0].closed).toBe(true);
    expect(stopTrack).toHaveBeenCalledOnce();
    expect(client.status.value).toBe('disconnected');
    expect(client.stream.value).toBeNull();
  });

  it('aborts pending signaling without changing the disconnected state to error', async () => {
    vi.stubGlobal('RTCPeerConnection', FakePeerConnection);
    const signaling: CameraSignaling = {
      exchangeOffer: vi.fn(
        (_robotId, _cameraId, _offer, signal) =>
          new Promise<RTCSessionDescriptionInit>((_, reject) => {
            signal.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            );
          }),
      ),
    };
    const client = useWebRTC(signaling);
    const pending = client.connect('ROBOT-01', 'front');
    await vi.waitFor(() => expect(signaling.exchangeOffer).toHaveBeenCalledOnce());

    client.disconnect();
    await expect(pending).rejects.toThrow('Aborted');
    expect(client.status.value).toBe('disconnected');
    expect(client.error.value).toBeNull();
    expect(FakePeerConnection.instances[0].closed).toBe(true);
  });

  it('reports signaling errors and closes the unfinished peer', async () => {
    vi.stubGlobal('RTCPeerConnection', FakePeerConnection);
    const signaling: CameraSignaling = {
      exchangeOffer: vi.fn().mockRejectedValue(new Error('Gateway unavailable')),
    };
    const client = useWebRTC(signaling);

    await expect(client.connect('ROBOT-01', 'front')).rejects.toThrow('Gateway unavailable');
    expect(client.status.value).toBe('error');
    expect(client.error.value).toBe('Gateway unavailable');
    expect(client.stream.value).toBeNull();
    expect(FakePeerConnection.instances[0].closed).toBe(true);
  });
});
