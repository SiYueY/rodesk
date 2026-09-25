<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import HarnessIcon from './HarnessIcon.vue';
import type { AgentSession, MessageBlock } from '../types';
import InputBar from './InputBar.vue';
import css from './ConversationContent.module.css';

const props = defineProps<{
  session: AgentSession | null;
  empty: boolean;
  running: boolean;
}>();
const emit = defineEmits<{ send: [text: string]; stop: [] }>();
const draftArea = ref<HTMLElement>();
const phase = computed(() => (props.empty ? 'hero' : 'active'));
const blockLabel = (block: Exclude<MessageBlock, { kind: 'text' }>) => {
  if (block.kind === 'tool-call') return block.toolName;
  if (block.kind === 'robot-action') return block.action;
  return block.content;
};
const transcriptElement = (element: unknown) => {
  if (element instanceof HTMLElement) draftArea.value = element;
};
watch(
  () => props.session?.messages.length,
  async () => {
    await nextTick();
    draftArea.value?.scrollTo({ top: draftArea.value.scrollHeight, behavior: 'smooth' });
  },
);
</script>

<template>
  <div
    :class="[css.stage, phase === 'hero' ? css.heroPhase : css.activePhase]"
    :data-conversation-phase="phase"
  >
    <div v-if="!empty" :ref="transcriptElement" :class="css.transcript" aria-live="polite">
      <article
        v-for="message in session?.messages"
        :key="message.id"
        :class="[css.message, message.role === 'user' ? css.userMessage : css.assistantMessage]"
      >
        <div :class="css.messageRole">{{ message.role === 'user' ? '你' : 'DeepSeek' }}</div>
        <template v-for="block in message.blocks" :key="block.id">
          <div v-if="block.kind === 'text'" :class="css.messageBody">
            {{ block.text
            }}<span v-if="message.streaming" :class="css.cursor" aria-label="正在生成">▍</span>
          </div>
          <div v-else :class="css.executionBlock">
            <span>{{ block.kind === 'result' ? '执行结果' : '执行中' }}</span>
            <strong>{{ blockLabel(block) }}</strong>
          </div>
        </template>
      </article>
      <p v-if="session?.error" :class="css.error">{{ session.error }}</p>
    </div>

    <div :class="[css.composerStack, empty ? css.composerHero : css.composerActive]">
      <template v-if="empty">
        <div :class="css.heroShell">
          <div :class="css.heroTitle">
            <img src="/assets/deepseek-harness-fish.svg" alt="" />
            <span :class="css.titleGroup"
              ><span>探索未至之境</span><span :class="css.previewBadge">预览版</span></span
            >
          </div>
        </div>
        <div :class="css.heroWorkspaceRow">
          <button :class="css.workspaceChip" type="button" aria-label="工作区 rodesk">
            <HarnessIcon icon="folder-open" :size="16" /><span>rodesk</span
            ><HarnessIcon icon="chevron-down" :size="12" />
          </button>
          <button :class="css.presetChip" type="button" aria-label="标准模式">
            <HarnessIcon icon="agent-preset" :size="16" /><span>标准模式</span
            ><HarnessIcon icon="chevron-down" :size="12" />
          </button>
        </div>
      </template>
      <div :class="css.composerSeat">
        <InputBar
          :session-id="session?.id ?? null"
          :running="running"
          :empty="empty"
          @send="emit('send', $event)"
          @stop="emit('stop')"
        />
      </div>
    </div>
  </div>
</template>
