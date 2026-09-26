<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowUp, ChevronDown, Paperclip, Phone, Plus, ShieldCheck, Square } from 'lucide-vue-next';
import css from './InputBar.module.css';

const props = defineProps<{ sessionId: string | null; running: boolean; empty: boolean }>();
const emit = defineEmits<{ send: [text: string]; stop: [] }>();
const draft = ref('');
const editor = ref<HTMLElement>();
const router = useRouter();
function openCall() {
  void router.push('/call');
}

watch(
  () => props.sessionId,
  () => {
    draft.value = '';
    if (editor.value) editor.value.replaceChildren();
  },
);
function updateDraft(event: Event) {
  const target = event.currentTarget;
  if (target instanceof HTMLElement) draft.value = target.innerText.replace(/\u00a0/g, ' ');
}
function submit() {
  const text = draft.value.trim();
  if (!text || props.running) return;
  draft.value = '';
  if (editor.value) editor.value.replaceChildren();
  emit('send', text);
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    submit();
  }
}
</script>

<template>
  <section :class="[css.root, empty ? css.hero : css.docked]" aria-label="消息输入区">
    <div :class="css.card">
      <div
        ref="editor"
        :class="css.input"
        role="textbox"
        aria-multiline="true"
        aria-label="描述你想要构建的内容, / 调用指令, @ 文件或对话"
        :aria-disabled="running"
        :contenteditable="!running"
        :data-empty="!draft"
        data-placeholder="描述你想要构建的内容, / 调用指令, @ 文件或对话"
        @input="updateDraft"
        @keydown="onKeydown"
      />
      <div :class="css.toolbar">
        <div :class="css.leftControls">
          <button :class="css.roundButton" type="button" aria-label="添加">
            <Plus :size="18" />
          </button>
          <button :class="css.roundButton" type="button" aria-label="添加附件">
            <Paperclip :size="16" />
          </button>
          <button :class="css.permission" type="button">
            <ShieldCheck :size="16" /><span>工作区内修改</span><ChevronDown :size="12" />
          </button>
        </div>
        <div :class="css.rightControls">
          <button :class="css.model" type="button">
            <span>DeepSeek-V4-Flash</span><span :class="css.quality">High</span
            ><ChevronDown :size="14" />
          </button>
          <button :class="css.callButton" type="button" aria-label="打开通话" @click="openCall">
            <Phone :size="18" aria-hidden="true" />
          </button>
          <button
            v-if="running"
            :class="[css.submit, css.stop]"
            type="button"
            aria-label="停止响应"
            @click="emit('stop')"
          >
            <Square :size="13" fill="currentColor" />
          </button>
          <button
            v-else
            :class="css.submit"
            type="button"
            aria-label="发送消息"
            :disabled="!draft.trim()"
            @click="submit"
          >
            <ArrowUp :size="18" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
