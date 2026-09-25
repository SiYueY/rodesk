<script setup lang="ts">
import { PanelRightClose } from 'lucide-vue-next';
import css from './RightRobotPanel.module.css';

const emit = defineEmits<{ toggle: [] }>();
</script>

<template>
  <aside :class="css.root" aria-label="Robot 侧栏">
    <button :class="css.toggle" type="button" aria-label="收起 Robot 侧栏" @click="emit('toggle')">
      <PanelRightClose :size="20" />
    </button>
    <p :class="css.greeting">Hello Robot</p>
  </aside>
</template>
