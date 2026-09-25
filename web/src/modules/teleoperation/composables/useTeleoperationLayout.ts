import { onMounted, onUnmounted, ref } from 'vue';

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

export function useTeleoperationLayout() {
  const layoutStyle = ref<Record<string, string>>({});

  function updateLayout() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const joystickSize = clamp(Math.min(height * 0.35, width * 0.195), 118, 180);
    const sideMargin = clamp(width * 0.032, 12, 38);
    const bottomMargin = clamp(height * 0.05, 12, 34);
    const toolSize = clamp(height * 0.078, 42, 54);
    const toolGap = clamp(height * 0.024, 10, 16);
    layoutStyle.value = {
      '--joy-size': `${joystickSize}px`,
      '--side-margin': `${sideMargin}px`,
      '--bottom-margin': `${bottomMargin}px`,
      '--tool-size': `${toolSize}px`,
      '--tool-gap': `${toolGap}px`,
    };
  }

  onMounted(() => {
    updateLayout();
    window.addEventListener('resize', updateLayout);
  });
  onUnmounted(() => window.removeEventListener('resize', updateLayout));

  return { layoutStyle };
}
