import type { CallService } from '../services/call.service';

export class MockCallService implements CallService {
  async start() {}
  async end() {}
  async setMicrophoneEnabled(_enabled: boolean) {}
  async setCameraEnabled(_enabled: boolean) {}
  async setSubtitleEnabled(_enabled: boolean) {}
  async setSpeakerEnabled(_enabled: boolean) {}
}
