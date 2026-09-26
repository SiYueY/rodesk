import { describe, expect, it, vi } from 'vitest';
import { useCallSession } from './useCallSession';

describe('useCallSession', () => {
  it('starts in the ready state and toggles controls back to their initial appearance', () => {
    vi.useFakeTimers();
    try {
      const call = useCallSession();
      expect([
        call.micEnabled.value,
        call.cameraEnabled.value,
        call.subtitleEnabled.value,
        call.speakerEnabled.value,
      ]).toEqual([true, true, true, true]);
      expect(call.phase.value).toBe('ready');
      call.toggleMicrophone();
      call.toggleCamera();
      call.toggleSubtitle();
      call.toggleSpeaker();
      expect([
        call.micEnabled.value,
        call.cameraEnabled.value,
        call.subtitleEnabled.value,
        call.speakerEnabled.value,
      ]).toEqual([false, false, false, false]);
      call.toggleSubtitle();
      expect(call.subtitleEnabled.value).toBe(true);
      call.dispose();
    } finally {
      vi.useRealTimers();
    }
  });

  it('cycles demo phases and freezes controls when ended', () => {
    vi.useFakeTimers();
    try {
      const call = useCallSession();
      call.cyclePhase();
      expect(call.phase.value).toBe('listening');
      call.cyclePhase();
      expect(call.phase.value).toBe('thinking');
      call.cyclePhase();
      expect(call.phase.value).toBe('speaking');
      call.openMore();
      call.endCall();
      expect(call.phase.value).toBe('ended');
      expect(call.moreOpen.value).toBe(false);
      call.toggleMicrophone();
      call.cyclePhase();
      expect(call.micEnabled.value).toBe(true);
      expect(call.phase.value).toBe('ended');
      vi.advanceTimersByTime(1500);
      expect(call.toastVisible.value).toBe(false);
      call.dispose();
    } finally {
      vi.useRealTimers();
    }
  });
});
