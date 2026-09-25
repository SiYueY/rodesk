<script setup lang="ts">
import { computed } from 'vue';
import { Gamepad2, PanelRight } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui';
import ConversationMainPanel from '../components/ConversationMainPanel.vue';
import RightRobotPanel from '../components/RightRobotPanel.vue';
import SidebarRoot from '../components/SidebarRoot.vue';
import { useAgentLayout } from '../composables/useAgentLayout';
import { useAgentStore } from '../stores/agent.store';
import css from './AgentView.module.css';

const router = useRouter();
const store = useAgentStore();
const {
  closeSidebarAfterNavigation,
  columns,
  drag,
  frame,
  gridStyle,
  narrow,
  openRightbar,
  openSidebar,
  onDragEnd,
  onDragMove,
  onDragStart,
  rightbarExpanded,
  rightbarVisible,
  sidebarExpanded,
  toggleRightbar,
  toggleSidebar,
} = useAgentLayout();

const emptyConversation = computed(() => !store.activeSession?.messages.length);
const teleoperationEntryStyle = computed(() => ({
  right: `${columns.value.right + (rightbarExpanded.value ? 16 : 60)}px`,
}));

function bindFrame(element: unknown) {
  frame.value = element instanceof HTMLElement ? element : undefined;
}

function createSession() {
  store.createSession();
  closeSidebarAfterNavigation();
}

function selectSession(id: string) {
  store.selectSession(id);
  closeSidebarAfterNavigation();
}
</script>

<template>
  <div
    :ref="bindFrame"
    :class="[
      css.appFrame,
      {
        [css.sidebarOpen]: sidebarExpanded,
        [css.rightbarOpen]: rightbarExpanded,
        [css.dragging]: drag,
      },
    ]"
    :style="gridStyle"
    :data-narrow="narrow"
  >
    <SidebarRoot
      v-if="sidebarExpanded"
      :class="css.leftColumn"
      :sessions="store.sessions"
      :active-session-id="store.activeSessionId"
      @create-session="createSession"
      @select-session="selectSession"
      @toggle="toggleSidebar"
    />

    <ConversationMainPanel
      :class="css.centerColumn"
      :session="store.activeSession"
      :empty="emptyConversation"
      :running="store.activeSession?.status === 'running'"
      @send="store.send"
      @stop="store.stop"
    />

    <RightRobotPanel v-if="rightbarVisible" :class="css.rightColumn" @toggle="toggleRightbar" />

    <Button
      :class="css.teleoperationEntry"
      :style="teleoperationEntryStyle"
      variant="ghost"
      size="icon"
      title="Teleoperation"
      aria-label="打开 Teleoperation"
      @click="router.push('/teleoperation')"
    >
      <Gamepad2 :size="20" />
    </Button>

    <button
      v-if="!rightbarExpanded"
      :class="css.openRightbar"
      type="button"
      aria-label="展开 Robot 侧栏"
      @click="openRightbar"
    >
      <PanelRight :size="20" />
    </button>

    <button
      v-if="!sidebarExpanded"
      :class="css.openSidebar"
      type="button"
      aria-label="展开会话列表"
      @click="openSidebar"
    >
      <img src="/assets/deepseek-harness-fish.svg" alt="" />
    </button>

    <button
      v-if="!narrow && columns.left > 0"
      :class="css.resizeHandle"
      :style="{ left: columns.left + 'px' }"
      type="button"
      aria-label="调整会话侧栏宽度"
      @pointerdown="onDragStart('sidebar', $event)"
      @pointermove="onDragMove"
      @pointerup="onDragEnd"
      @pointercancel="onDragEnd"
    />

    <button
      v-if="!narrow && rightbarVisible"
      :class="css.resizeHandle"
      :style="{ left: 'calc(100% - ' + columns.right + 'px)' }"
      type="button"
      aria-label="调整 Robot 侧栏宽度"
      @pointerdown="onDragStart('rightbar', $event)"
      @pointermove="onDragMove"
      @pointerup="onDragEnd"
      @pointercancel="onDragEnd"
    />

    <button
      v-if="narrow && sidebarExpanded"
      :class="css.sidebarScrim"
      type="button"
      aria-label="关闭会话列表"
      @click="sidebarExpanded = false"
    />

    <button
      v-if="narrow && rightbarExpanded"
      :class="css.rightbarScrim"
      type="button"
      aria-label="关闭 Robot 侧栏"
      @click="rightbarExpanded = false"
    />
  </div>
</template>
