import { afterEach, describe, expect, it, vi } from 'vitest';
import nipplejs from 'nipplejs';
import { createNippleAdapter } from './nipple-adapter';
import type { JoystickState } from '../../types/joystick';

vi.mock('nipplejs', () => ({ default: { create: vi.fn() } }));

class FakeManager {
  handlers = new Map<string, (event: { data?: { vector: { x: number; y: number } } }) => void>();
  destroyed = false;

  on(event: string, callback: (event: { data?: { vector: { x: number; y: number } } }) => void) {
    this.handlers.set(event, callback);
  }

  fire(event: string, vector = { x: 0, y: 0 }) {
    this.handlers.get(event)?.({ data: { vector } });
  }

  destroy() {
    this.destroyed = true;
  }
}

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  callback: ResizeObserverCallback;
  disconnected = false;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    FakeResizeObserver.instances.push(this);
  }

  observe() {}
  disconnect() {
    this.disconnected = true;
  }
  resize() {
    this.callback([], this as unknown as ResizeObserver);
  }
}

function fakeElement(width: () => number): HTMLElement {
  return { getBoundingClientRect: () => ({ width: width() }) } as HTMLElement;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  FakeResizeObserver.instances = [];
});

describe('nipple adapter', () => {
  it('uses data only input and emits normalized movement and a neutral release', () => {
    const manager = new FakeManager();
    vi.mocked(nipplejs.create).mockReturnValue(
      manager as unknown as ReturnType<typeof nipplejs.create>,
    );
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const states: JoystickState[] = [];
    const adapter = createNippleAdapter();
    adapter.onChange((state) => states.push(state));
    adapter.mount(fakeElement(() => 200));

    expect(nipplejs.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'static',
        dataOnly: true,
        size: 128,
        position: { left: '50%', top: '50%' },
      }),
    );
    manager.fire('start');
    manager.fire('move', { x: 0.5, y: -1 });
    manager.fire('end');

    expect(states).toEqual([
      { x: 0, y: 0, active: true },
      { x: 0.4791666666666667, y: -1, active: true },
      { x: 0, y: 0, active: false },
    ]);
    adapter.destroy();
    expect(manager.destroyed).toBe(true);
    expect(FakeResizeObserver.instances[0].disconnected).toBe(true);
  });

  it('keeps both instances independent and resets input when the zone changes size', () => {
    const managers: FakeManager[] = [];
    vi.mocked(nipplejs.create).mockImplementation(() => {
      const manager = new FakeManager();
      managers.push(manager);
      return manager as unknown as ReturnType<typeof nipplejs.create>;
    });
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    let width = 200;
    const leftStates: JoystickState[] = [];
    const rightStates: JoystickState[] = [];
    const left = createNippleAdapter();
    const right = createNippleAdapter();
    left.onChange((state) => leftStates.push(state));
    right.onChange((state) => rightStates.push(state));
    left.mount(fakeElement(() => width));
    right.mount(fakeElement(() => 200));

    managers[0].fire('move', { x: 1, y: 0 });
    managers[1].fire('move', { x: 0, y: 1 });
    width = 120;
    FakeResizeObserver.instances[0].resize();

    expect(leftStates.at(-1)).toEqual({ x: 0, y: 0, active: false });
    expect(rightStates.at(-1)).toEqual({ x: 0, y: 1, active: true });
    expect(managers[0].destroyed).toBe(true);
    expect(nipplejs.create).toHaveBeenLastCalledWith(expect.objectContaining({ size: 73.6 }));
    left.destroy();
    right.destroy();
  });
});
