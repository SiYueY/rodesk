import { computed, onMounted, onUnmounted, ref } from 'vue';
import { createNippleAdapter } from '../services/joystick/nipple-adapter';
import type { JoystickAxes, JoystickState } from '../types/joystick';

const centered: JoystickAxes = { x: 0, y: 0 };

export function useJoystick(onChange: (state: JoystickState) => void) {
  const root = ref<HTMLElement | null>(null);
  const state = ref<JoystickState>({ ...centered, active: false });
  const visualVector = ref<JoystickAxes>(centered);
  const adapter = createNippleAdapter();

  adapter.onChange((nextState, nextVisualVector) => {
    state.value = nextState;
    visualVector.value = nextVisualVector;
    onChange(nextState);
  });

  const knobTransform = computed(() => {
    const width = root.value?.getBoundingClientRect().width ?? 0;
    const max = Math.max(1, width / 2 - width * 0.16 - 4);
    const dx = visualVector.value.x * max;
    const dy = -visualVector.value.y * max;
    return `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;
  });

  const arrowStyle = computed(() => {
    const { x, y } = visualVector.value;
    const magnitude = Math.min(1, Math.hypot(x, y));
    if (!state.value.active) return { opacity: '0' };
    const angle = (Math.atan2(x, y) * 180) / Math.PI;
    const width = root.value?.getBoundingClientRect().width ?? 0;
    const arrowRadius = width / 2 + 14 * 0.6;
    return {
      left: `calc(50% + ${Math.sin((angle * Math.PI) / 180) * arrowRadius}px)`,
      top: `calc(50% + ${-Math.cos((angle * Math.PI) / 180) * arrowRadius}px)`,
      transform: `translate(-50%,-50%) rotate(${angle}deg)`,
      opacity: magnitude < 0.05 ? '0' : String(0.4 + 0.6 * magnitude),
    };
  });

  function bindRoot(element: unknown) {
    root.value = element instanceof HTMLElement ? element : null;
  }

  onMounted(() => {
    if (root.value) adapter.mount(root.value);
  });
  onUnmounted(() => adapter.destroy());

  return { bindRoot, state, knobTransform, arrowStyle };
}
