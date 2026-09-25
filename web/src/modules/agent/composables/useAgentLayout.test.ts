import { describe, expect, it } from 'vitest';
import {
  RIGHTBAR_DEFAULT_RATIO,
  RIGHTBAR_MIN_WIDTH,
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  resolveAgentLayoutColumns,
} from './useAgentLayout';

const desktopState = {
  frameWidth: 2048,
  narrow: false,
  sidebarExpanded: true,
  rightbarExpanded: true,
  sidebarWidth: SIDEBAR_DEFAULT_WIDTH,
  rightbarWidth: 2048 * RIGHTBAR_DEFAULT_RATIO,
};

describe('resolveAgentLayoutColumns', () => {
  it('uses the Harness default widths on a desktop viewport', () => {
    expect(resolveAgentLayoutColumns(desktopState)).toEqual({
      left: SIDEBAR_DEFAULT_WIDTH,
      right: 922,
    });
  });

  it('clamps the left side panel to its supported range', () => {
    expect(
      resolveAgentLayoutColumns({
        ...desktopState,
        sidebarWidth: 1,
        rightbarExpanded: false,
      }),
    ).toEqual({ left: SIDEBAR_MIN_WIDTH, right: 0 });

    expect(
      resolveAgentLayoutColumns({
        ...desktopState,
        sidebarWidth: 999,
        rightbarExpanded: false,
      }),
    ).toEqual({ left: SIDEBAR_MAX_WIDTH, right: 0 });
  });

  it('preserves the conversation minimum width while shrinking the right panel', () => {
    expect(
      resolveAgentLayoutColumns({
        ...desktopState,
        frameWidth: 1100,
        sidebarWidth: SIDEBAR_MAX_WIDTH,
      }),
    ).toEqual({ left: SIDEBAR_MAX_WIDTH, right: 0 });

    expect(
      resolveAgentLayoutColumns({
        ...desktopState,
        frameWidth: 1200,
        sidebarWidth: SIDEBAR_MAX_WIDTH,
      }),
    ).toEqual({
      left: SIDEBAR_MAX_WIDTH,
      right: 380,
    });
  });

  it('restores the requested right panel when width becomes sufficient', () => {
    const constrained = resolveAgentLayoutColumns({
      ...desktopState,
      frameWidth: 1100,
      sidebarWidth: SIDEBAR_MAX_WIDTH,
    });
    const restored = resolveAgentLayoutColumns({
      ...desktopState,
      frameWidth: 1600,
      sidebarWidth: SIDEBAR_MAX_WIDTH,
    });

    expect(constrained.right).toBe(0);
    expect(restored.right).toBeGreaterThanOrEqual(RIGHTBAR_MIN_WIDTH);
  });

  it('does not allocate side panel columns on narrow screens', () => {
    expect(
      resolveAgentLayoutColumns({
        ...desktopState,
        narrow: true,
      }),
    ).toEqual({ left: 0, right: 0 });
  });
});
