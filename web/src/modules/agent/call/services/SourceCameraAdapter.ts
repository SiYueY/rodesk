import { ref, shallowRef, watch, type WatchStopHandle } from 'vue';
import type { CameraConnectionStatus } from '@/modules/teleoperation/types/camera';
import type { CameraSource } from '../types';
import type { CallCameraAdapter } from './camera.adapter';

/** Routes a selected source to its transport and exposes one video stream to the page. */
export class SourceCameraAdapter implements CallCameraAdapter {
  readonly stream = shallowRef<MediaStream | null>(null);
  readonly status = ref<CameraConnectionStatus>('idle');
  readonly error = ref<string | null>(null);
  private active: CallCameraAdapter | null = null;
  private stopWatching: WatchStopHandle[] = [];
  private generation = 0;

  constructor(
    private readonly local: CallCameraAdapter,
    private readonly robot: CallCameraAdapter | null,
  ) {}

  async open(source: CameraSource): Promise<void> {
    this.close();
    const current = this.generation;
    const adapter = source.type === 'local' ? this.local : this.robot;
    if (!adapter) {
      const reason = new Error('Robot camera signaling is not configured');
      this.status.value = 'error';
      this.error.value = reason.message;
      throw reason;
    }
    this.active = adapter;
    this.stopWatching = [
      watch(
        adapter.stream,
        (value) => {
          this.stream.value = value;
        },
        { immediate: true, flush: 'sync' },
      ),
      watch(
        adapter.status,
        (value) => {
          this.status.value = value;
        },
        { immediate: true, flush: 'sync' },
      ),
      watch(
        adapter.error,
        (value) => {
          this.error.value = value;
        },
        { immediate: true, flush: 'sync' },
      ),
    ];
    try {
      await adapter.open(source);
    } catch (reason) {
      if (current === this.generation) {
        this.status.value = 'error';
        this.error.value = reason instanceof Error ? reason.message : '摄像头连接失败';
      }
      throw reason;
    }
  }

  close(): void {
    this.generation += 1;
    this.stopWatching.forEach((stop) => stop());
    this.stopWatching = [];
    this.active?.close();
    this.active = null;
    this.stream.value = null;
    this.error.value = null;
    this.status.value = 'disconnected';
  }
}
