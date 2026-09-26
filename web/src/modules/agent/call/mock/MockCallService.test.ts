import { describe, expect, it } from 'vitest';
import { MockCallService } from './MockCallService';

describe('MockCallService', () => {
  it('fulfills the call command contract without a backend', async () => {
    const service = new MockCallService();
    await expect(service.start()).resolves.toBeUndefined();
    await expect(service.setMicrophoneEnabled(false)).resolves.toBeUndefined();
    await expect(service.setCameraEnabled(false)).resolves.toBeUndefined();
    await expect(service.setSubtitleEnabled(false)).resolves.toBeUndefined();
    await expect(service.setSpeakerEnabled(false)).resolves.toBeUndefined();
    await expect(service.end()).resolves.toBeUndefined();
  });
});
