<script setup lang="ts">
import { ref } from 'vue';
import type { JoystickAxes } from '../../types';

defineProps<{ label: string }>();
const emit = defineEmits<{ change: [axes: JoystickAxes] }>();

const root = ref<HTMLElement | null>(null);
const active = ref(false);
const knobTransform = ref('translate(-50%,-50%)');
const arrowStyle = ref<Record<string, string>>({});
let pointerId: number | null = null;

function deadzoneMap(value: number, deadzone = 0.04): number {
  const magnitude = Math.abs(value);
  if (magnitude <= deadzone) return 0;
  return Math.sign(value) * ((magnitude - deadzone) / (1 - deadzone));
}

function move(event: PointerEvent) {
  if (!root.value) return;
  const bounds = root.value.getBoundingClientRect();
  let dx = event.clientX - (bounds.left + bounds.width / 2);
  let dy = event.clientY - (bounds.top + bounds.height / 2);
  const knobRadius = bounds.width * 0.16;
  const max = Math.max(1, bounds.width / 2 - knobRadius - 4);
  const distance = Math.hypot(dx, dy);
  if (distance > max) {
    dx = (dx / distance) * max;
    dy = (dy / distance) * max;
  }

  const magnitude = Math.min(1, Math.hypot(dx, dy) / max);
  const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
  const arrowRadius = bounds.width / 2 + 14 * 0.6;
  const radians = (angle * Math.PI) / 180;
  knobTransform.value = `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;
  arrowStyle.value = {
    left: `calc(50% + ${Math.sin(radians) * arrowRadius}px)`,
    top: `calc(50% + ${-Math.cos(radians) * arrowRadius}px)`,
    transform: `translate(-50%,-50%) rotate(${angle}deg)`,
    opacity: magnitude < 0.05 ? '0' : String(0.4 + 0.6 * magnitude),
  };
  emit('change', { x: deadzoneMap(dx / max), y: deadzoneMap(-dy / max) });
}

function reset() {
  if (pointerId === null) return;
  pointerId = null;
  active.value = false;
  knobTransform.value = 'translate(-50%,-50%)';
  arrowStyle.value = { opacity: '0' };
  emit('change', { x: 0, y: 0 });
}

function start(event: PointerEvent) {
  if (pointerId !== null || !root.value) return;
  pointerId = event.pointerId;
  root.value.setPointerCapture(event.pointerId);
  active.value = true;
  move(event);
}

function continueMove(event: PointerEvent) {
  if (pointerId === event.pointerId) move(event);
}

function end(event: PointerEvent) {
  if (pointerId === event.pointerId) reset();
}
</script>

<template>
  <div
    ref="root"
    class="teleop-joystick"
    :class="{ 'teleop-joystick--active': active }"
    role="group"
    :aria-label="label"
    @pointerdown="start"
    @pointermove="continueMove"
    @pointerup="end"
    @pointercancel="end"
    @lostpointercapture="reset"
  >
    <div class="teleop-joystick__game-accent" />
    <div class="teleop-joystick__base" />
    <div class="teleop-joystick__ring-1" />
    <div class="teleop-joystick__ring-2" />
    <div class="teleop-joystick__cross-h" />
    <div class="teleop-joystick__cross-v" />
    <div class="teleop-joystick__direction-arrow" :style="arrowStyle" />
    <div class="teleop-joystick__knob" :style="{ transform: knobTransform }" />
  </div>
</template>
