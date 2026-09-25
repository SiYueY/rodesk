<script setup lang="ts">
import { useJoystick } from '../../composables/useJoystick';
import type { JoystickSource, JoystickState } from '../../types';

defineProps<{ id: JoystickSource }>();
const emit = defineEmits<{ change: [state: JoystickState] }>();
const { bindRoot, state, knobTransform, arrowStyle } = useJoystick((value) =>
  emit('change', value),
);
</script>

<template>
  <div
    :ref="bindRoot"
    class="teleop-joystick"
    :class="{ 'teleop-joystick--active': state.active }"
    role="group"
    :aria-label="id === 'left' ? 'Left Stick' : 'Right Stick'"
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
