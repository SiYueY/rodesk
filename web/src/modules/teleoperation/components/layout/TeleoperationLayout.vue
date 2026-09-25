<template>
  <div class="teleoperation-layout">
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
</template>
