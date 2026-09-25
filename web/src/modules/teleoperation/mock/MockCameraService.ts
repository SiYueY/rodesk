import { ref, shallowRef } from 'vue';
import type { CameraService } from '../services/camera.service';
import type { CameraConnectionStatus } from '../types/camera';

const mockVideoUrl = `${import.meta.env.BASE_URL}media/unitree-camera-mock.mp4`;

function waitForVideoData(video: HTMLVideoElement, signal: AbortSignal): Promise<void> {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      video.removeEventListener('loadeddata', onReady);
      video.removeEventListener('error', onError);
      signal.removeEventListener('abort', onAbort);
    };
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('本地 Mock 相机视频加载失败'));
    };
    const onAbort = () => {
      cleanup();
      reject(new DOMException('Mock camera cancelled', 'AbortError'));
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('本地 Mock 相机视频加载超时'));
    }, 15000);
    video.addEventListener('loadeddata', onReady, { once: true });
    video.addEventListener('error', onError, { once: true });
    signal.addEventListener('abort', onAbort, { once: true });
    if (signal.aborted) onAbort();
    else if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) onReady();
  });
}

export class MockCameraService implements CameraService {
  readonly status = ref<CameraConnectionStatus>('idle');
  readonly stream = shallowRef<MediaStream | null>(null);
  readonly error = ref<string | null>(null);

  private video: HTMLVideoElement | null = null;
  private frameRequest: number | null = null;
  private controller: AbortController | null = null;
  private generation = 0;

  async connect(_robotId: string, _cameraId: string): Promise<MediaStream> {
    this.disconnect();
    const session = this.generation;
    const controller = new AbortController();
    this.controller = controller;
    this.status.value = 'connecting';
    this.error.value = null;

    try {
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.loop = true;
      video.preload = 'auto';
      this.video = video;
      video.src = mockVideoUrl;
      await waitForVideoData(video, controller.signal);
      if (session !== this.generation)
        throw new DOMException('Mock camera cancelled', 'AbortError');
      await video.play();
      if (session !== this.generation)
        throw new DOMException('Mock camera cancelled', 'AbortError');

      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 1280 / video.videoWidth);
      canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
      canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
      const context = canvas.getContext('2d');
      if (!context || !canvas.captureStream) throw new Error('当前浏览器不支持 Mock 视频流');

      const drawFrame = () => {
        if (session !== this.generation) return;
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        this.frameRequest = requestAnimationFrame(drawFrame);
      };
      drawFrame();

      const stream = canvas.captureStream(30);
      if (stream.getVideoTracks().length === 0) throw new Error('无法创建 Mock 视频轨道');
      this.stream.value = stream;
      this.status.value = 'connected';
      return stream;
    } catch (reason) {
      if (session === this.generation) {
        this.release();
        this.status.value = 'error';
        this.error.value = reason instanceof Error ? reason.message : 'Mock 视频流启动失败';
      }
      throw reason;
    }
  }

  private release(): void {
    this.controller?.abort();
    this.controller = null;
    if (this.frameRequest !== null) cancelAnimationFrame(this.frameRequest);
    this.frameRequest = null;
    this.stream.value?.getTracks().forEach((track) => track.stop());
    this.stream.value = null;
    if (this.video) {
      this.video.pause();
      this.video.removeAttribute('src');
      this.video.load();
    }
    this.video = null;
  }

  disconnect(): void {
    this.generation += 1;
    this.release();
    this.error.value = null;
    this.status.value = 'disconnected';
  }
}
