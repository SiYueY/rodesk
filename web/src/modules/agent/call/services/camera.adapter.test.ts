import { afterEach, describe, expect, it, vi } from 'vitest';
import { ref, shallowRef } from 'vue';
import type { CameraService } from '@/modules/teleoperation/services/camera.service';
import { LocalCameraAdapter } from './LocalCameraAdapter';
import { RobotCameraAdapter } from './RobotCameraAdapter';
import { SourceCameraAdapter } from './SourceCameraAdapter';
import { createCallRuntime } from './createCallRuntime';
import { defaultCameraSources } from '../types';

function localSource() {
  return defaultCameraSources[0];
}
function robotSource() {
  return defaultCameraSources[2];
}
function fakeStream() {
  const stop = vi.fn();
  return { stream: { getTracks: () => [{ stop }] } as unknown as MediaStream, stop };
}
afterEach(() => vi.unstubAllGlobals());

describe('camera adapters', () => {
  it('opens a local camera and stops its track on close', async () => {
    const { stream, stop } = fakeStream();
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
    const adapter = new LocalCameraAdapter();
    await adapter.open(localSource());
    expect(getUserMedia).toHaveBeenCalledWith({ video: { facingMode: 'user' }, audio: false });
    expect(adapter.stream.value).toBe(stream);
    adapter.close();
    expect(stop).toHaveBeenCalledOnce();
    expect(adapter.stream.value).toBeNull();
  });

  it('releases a stream that arrives after the camera was closed', async () => {
    const { stream, stop } = fakeStream();
    let deliver: (stream: MediaStream) => void = () => {};
    const getUserMedia = vi.fn().mockReturnValue(
      new Promise<MediaStream>((resolve) => {
        deliver = resolve;
      }),
    );
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
    const adapter = new LocalCameraAdapter();
    const opening = adapter.open(localSource());
    adapter.close();
    deliver(stream);
    await opening;
    expect(stop).toHaveBeenCalledOnce();
    expect(adapter.stream.value).toBeNull();
  });

  it('reports local camera permission failure without publishing a stream', async () => {
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockRejectedValue(new Error('Permission denied')) },
    });
    const adapter = new LocalCameraAdapter();
    await expect(adapter.open(localSource())).rejects.toThrow('Permission denied');
    expect(adapter.stream.value).toBeNull();
    expect(adapter.status.value).toBe('error');
    expect(adapter.error.value).toBe('Permission denied');
  });

  it('passes robot source IDs to the existing camera service', async () => {
    const service: CameraService = {
      stream: shallowRef<MediaStream | null>(null),
      status: ref('idle'),
      error: ref(null),
      connect: vi.fn().mockResolvedValue(fakeStream().stream),
      disconnect: vi.fn(),
    };
    const adapter = new RobotCameraAdapter(service);
    await adapter.open(robotSource());
    expect(service.connect).toHaveBeenCalledWith('ROBOT-01', 'head');
    adapter.close();
    expect(service.disconnect).toHaveBeenCalledOnce();
  });

  it('routes a selected source and cleans up the previous transport', async () => {
    const local = {
      stream: shallowRef<MediaStream | null>(null),
      status: ref<'idle' | 'connected'>('idle'),
      error: ref<string | null>(null),
      open: vi.fn().mockResolvedValue(undefined),
      close: vi.fn(),
    };
    const robot = {
      stream: shallowRef<MediaStream | null>(null),
      status: ref<'idle' | 'connected'>('idle'),
      error: ref<string | null>(null),
      open: vi.fn().mockResolvedValue(undefined),
      close: vi.fn(),
    };
    const adapter = new SourceCameraAdapter(local, robot);
    await adapter.open(localSource());
    const video = fakeStream().stream;
    local.stream.value = video;
    expect(adapter.stream.value).toBe(video);
    await adapter.open(robotSource());
    expect(local.close).toHaveBeenCalledOnce();
    expect(robot.open).toHaveBeenCalledWith(robotSource());
    expect(adapter.stream.value).toBeNull();
    adapter.close();
    expect(robot.close).toHaveBeenCalledOnce();
  });

  it('can enable local devices without robot signaling and reports missing robot transport', async () => {
    const runtime = createCallRuntime({ cameraMode: 'devices' });
    expect(runtime.camera).toBeInstanceOf(SourceCameraAdapter);
    await expect(runtime.camera.open(robotSource())).rejects.toThrow('Robot camera signaling');
    expect(runtime.camera.status.value).toBe('error');
    runtime.camera.close();
  });
});
