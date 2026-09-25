<template>
  <div class="teleoperation-layout">
    <slot name="camera" />
    <div class="teleoperation-layout__hud">
      <slot name="header" />
      <main class="teleoperation-layout__middle">
        <slot name="left-buttons" />
        <slot name="overlay" />
        <slot name="right-buttons" />
      </main>
      <footer class="teleoperation-layout__bottom">
        <slot name="left-joystick" />
        <slot name="telemetry" />
        <slot name="right-joystick" />
      </footer>
    </div>
  </div>
</template>

<style scoped>
.teleoperation-layout__hud {
  display: contents;
}
</style>
