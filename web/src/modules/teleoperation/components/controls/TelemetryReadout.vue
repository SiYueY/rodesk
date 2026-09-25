<script setup lang="ts">
import type { JoystickAxes } from '../../types';

defineProps<{
  left: JoystickAxes;
  right: JoystickAxes;
}>();
</script>

<template>
  <div class="teleop-telemetry">
    <div class="teleop-metric">
      <b>{{ left.x.toFixed(2) }}</b
      ><span>LX</span>
    </div>
    <div class="teleop-metric">
      <b>{{ left.y.toFixed(2) }}</b
      ><span>LY</span>
    </div>
    <div class="teleop-metric">
      <b>{{ right.x.toFixed(2) }}</b
      ><span>RX</span>
    </div>
    <div class="teleop-metric">
      <b>{{ right.y.toFixed(2) }}</b
      ><span>RY</span>
    </div>
  </div>
</template>
