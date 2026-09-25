<script setup lang="ts">
import { computed } from 'vue';
import {
  ChevronDown,
  FolderOpen,
  MessageSquare,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
} from 'lucide-vue-next';
import type { AgentSession } from '../types';
import HarnessIcon from './HarnessIcon.vue';
import css from './SidebarRoot.module.css';

const props = defineProps<{
  sessions: AgentSession[];
  activeSessionId: string | null;
}>();

const emit = defineEmits<{
  createSession: [];
  selectSession: [id: string];
  toggle: [];
}>();

const selectedId = computed(() => props.activeSessionId);
</script>

<template>
  <aside :class="css.root" aria-label="会话侧栏">
    <div :class="css.logoRow">
      <button :class="css.brand" type="button" aria-label="新会话" @click="emit('createSession')">
        <img :class="css.wordmark" src="/assets/deepseek-harness-wordmark.svg" alt="" />
        <span :class="css.brandBadge">HARNESS</span>
      </button>
      <button :class="css.toggle" type="button" aria-label="收起侧栏" @click="emit('toggle')">
        <HarnessIcon icon="panel-left" :size="16" />
      </button>
    </div>

    <button :class="css.newSession" type="button" @click="emit('createSession')">
      <HarnessIcon icon="new-chat" :size="14" />
      <span :class="css.wideOnly">新会话</span>
    </button>

    <section :class="css.workspaceArea" aria-label="工作区">
      <div :class="css.sectionHeading">
        <span :class="css.wideOnly">工作区</span>
        <div :class="css.headingActions">
          <button :class="css.iconButton" type="button" aria-label="搜索工作区">
            <Search :size="17" />
          </button>
          <button :class="css.iconButton" type="button" aria-label="筛选工作区">
            <SlidersHorizontal :size="17" />
          </button>
          <button :class="css.iconButton" type="button" aria-label="添加工作区">
            <Plus :size="18" />
          </button>
        </div>
      </div>

      <button :class="css.workspaceRow" type="button" aria-label="当前工作区 rodesk">
        <FolderOpen :size="17" />
        <span :class="css.wideOnly">rodesk</span>
        <ChevronDown :class="[css.chevron, css.wideOnly]" :size="14" />
      </button>
    </section>

    <nav :class="css.sessionList" aria-label="会话列表">
      <button
        v-for="session in sessions"
        :key="session.id"
        :class="[css.sessionRow, { [css.selected]: session.id === selectedId }]"
        type="button"
        :title="session.title"
        @click="emit('selectSession', session.id)"
      >
        <MessageSquare :size="16" />
        <span :class="css.sessionTitle">{{ session.title }}</span>
      </button>
    </nav>

    <div :class="css.footer">
      <button :class="css.settings" type="button" aria-label="设置">
        <Settings :size="18" />
        <span :class="css.wideOnly">设置</span>
      </button>
    </div>
  </aside>
</template>
