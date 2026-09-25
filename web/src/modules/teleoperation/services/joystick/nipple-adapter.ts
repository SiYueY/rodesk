import nipplejs from 'nipplejs';
import type { JoystickAxes, JoystickState } from '../../types/joystick';

type JoystickListener = (state: JoystickState, visualVector: JoystickAxes) => void;

export interface JoystickAdapter {
  mount(element: HTMLElement): void;
  destroy(): void;
  onChange(callback: JoystickListener): void;
}

const centered: JoystickAxes = { x: 0, y: 0 };
const idle: JoystickState = { ...centered, active: false };

function deadzoneMap(value: number, deadzone = 0.04): number {
  const magnitude = Math.abs(value);
  if (magnitude <= deadzone) return 0;
  return Math.sign(value) * ((magnitude - deadzone) / (1 - deadzone));
}

/** Keep nipplejs input and DOM ownership outside Vue's visual joystick. */
export function createNippleAdapter(): JoystickAdapter {
  let element: HTMLElement | null = null;
  let manager: ReturnType<typeof nipplejs.create> | null = null;
  let observer: ResizeObserver | null = null;
  let width = 0;
  let active = false;
  let listener: JoystickListener | null = null;

  function publish(state: JoystickState, visualVector: JoystickAxes) {
    active = state.active;
    listener?.(state, visualVector);
  }

  function createManager() {
    if (!element) return;
    width = element.getBoundingClientRect().width;
    const max = Math.max(1, width / 2 - width * 0.16 - 4);
    manager = nipplejs.create({
      zone: element,
      mode: 'static',
      dataOnly: true,
      position: { left: '50%', top: '50%' },
      size: max * 2,
      fadeTime: 0,
    });
    manager.on('start', () => publish({ ...centered, active: true }, centered));
    manager.on('move', ({ data }) => {
      const visualVector = {
        x: Math.max(-1, Math.min(1, data.vector.x)),
        y: Math.max(-1, Math.min(1, data.vector.y)),
      };
      publish(
        {
          x: deadzoneMap(visualVector.x),
          y: deadzoneMap(visualVector.y),
          active: true,
        },
        visualVector,
      );
    });
    manager.on('end', () => publish(idle, centered));
  }

  function destroy() {
    observer?.disconnect();
    observer = null;
    manager?.destroy();
    manager = null;
    element = null;
    width = 0;
    if (active) publish(idle, centered);
  }

  return {
    mount(target) {
      destroy();
      element = target;
      createManager();
      observer = new ResizeObserver(() => {
        if (!element || element.getBoundingClientRect().width === width) return;
        manager?.destroy();
        manager = null;
        if (active) publish(idle, centered);
        createManager();
      });
      observer.observe(target);
    },
    destroy,
    onChange(callback) {
      listener = callback;
    },
  };
}
