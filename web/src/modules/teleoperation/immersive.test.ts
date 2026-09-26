import { afterEach, describe, expect, it, vi } from 'vitest';
import { enterTeleoperationImmersiveMode, leaveTeleoperationImmersiveMode } from './immersive';

const lock = vi.fn().mockResolvedValue(undefined);
const unlock = vi.fn();
const requestFullscreen = vi.fn().mockResolvedValue(undefined);
const exitFullscreen = vi.fn().mockResolvedValue(undefined);

function stubBrowser(touch: boolean, fullscreenElement: Element | null = null) {
  vi.stubGlobal('window', { matchMedia: () => ({ matches: touch }) });
  vi.stubGlobal('document', {
    fullscreenElement,
    documentElement: { requestFullscreen },
    exitFullscreen,
  });
  vi.stubGlobal('screen', { orientation: { lock, unlock } });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('teleoperation immersive mode', () => {
  it('requests fullscreen before locking landscape after a touch entry', async () => {
    stubBrowser(true);
    await enterTeleoperationImmersiveMode();

    expect(requestFullscreen).toHaveBeenCalledOnce();
    expect(lock).toHaveBeenCalledWith('landscape');
    expect(requestFullscreen.mock.invocationCallOrder[0]).toBeLessThan(
      lock.mock.invocationCallOrder[0],
    );
  });

  it('still attempts landscape when fullscreen is rejected', async () => {
    stubBrowser(true);
    requestFullscreen.mockRejectedValueOnce(new Error('Not allowed'));

    await expect(enterTeleoperationImmersiveMode()).resolves.toBeUndefined();
    expect(lock).toHaveBeenCalledWith('landscape');
  });

  it('cleans up if fullscreen finishes after the page was left', async () => {
    stubBrowser(true);
    let finishFullscreen!: () => void;
    requestFullscreen.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishFullscreen = resolve;
        }),
    );

    const entering = enterTeleoperationImmersiveMode();
    leaveTeleoperationImmersiveMode();
    (document as unknown as { fullscreenElement: Element | null }).fullscreenElement =
      {} as Element;
    finishFullscreen();
    await entering;

    expect(exitFullscreen).toHaveBeenCalledOnce();
    expect(lock).not.toHaveBeenCalled();
  });

  it('releases the lock and fullscreen when leaving', () => {
    stubBrowser(true, {} as Element);
    leaveTeleoperationImmersiveMode();

    expect(unlock).toHaveBeenCalledOnce();
    expect(exitFullscreen).toHaveBeenCalledOnce();
  });

  it('leaves desktop display state alone', async () => {
    stubBrowser(false);
    await enterTeleoperationImmersiveMode();
    leaveTeleoperationImmersiveMode();

    expect(requestFullscreen).not.toHaveBeenCalled();
    expect(lock).not.toHaveBeenCalled();
    expect(unlock).not.toHaveBeenCalled();
  });
});
