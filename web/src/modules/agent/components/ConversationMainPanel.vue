<script setup lang="ts">
import type { AgentSession } from '../types';
import ConversationContent from './ConversationContent.vue';
import css from './ConversationMainPanel.module.css';

defineProps<{
  session: AgentSession | null;
  empty: boolean;
  running: boolean;
}>();

const emit = defineEmits<{
  send: [text: string];
  stop: [];
}>();
</script>

<template>
  <main :class="css.root" aria-label="Agent 对话">
    <ConversationContent
      :session="session"
      :empty="empty"
      :running="running"
      @send="emit('send', $event)"
      @stop="emit('stop')"
    />
  </main>
</template>
