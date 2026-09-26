import { describe, expect, it } from 'vitest';
import { useCameraSources } from './useCameraSources';
import { defaultCameraSources } from '../types';

describe('useCameraSources', () => {
  it('opens, selects a source, and closes the menu', () => {
    const camera = useCameraSources(defaultCameraSources);
    expect(camera.selectedId.value).toBe('phone-front');
    camera.toggleMenu();
    expect(camera.menuOpen.value).toBe(true);
    expect(camera.selectSource('robot-wrist')?.cameraId).toBe('wrist');
    expect(camera.selectedId.value).toBe('robot-wrist');
    expect(camera.menuOpen.value).toBe(false);
    camera.openMenu();
    camera.closeMenu();
    expect(camera.menuOpen.value).toBe(false);
    expect(camera.selectSource('missing')).toBeNull();
    expect(camera.selectedId.value).toBe('robot-wrist');
  });
});
