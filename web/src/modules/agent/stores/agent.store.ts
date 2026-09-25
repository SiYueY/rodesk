import { computed, onScopeDispose, ref } from 'vue';
import { defineStore } from 'pinia';
import { agentAdapter } from '../services';
import type { AgentEvent, AgentMessage, AgentSession, TextBlock } from '../types';

export const useAgentStore = defineStore('agent', () => {
  const sessions = ref<AgentSession[]>([]);
  const activeSessionId = ref<string | null>(null);
  const activeSession = computed(
    () => sessions.value.find((session) => session.id === activeSessionId.value) ?? null,
  );

  function createSession() {
    const session: AgentSession = {
      id: crypto.randomUUID(),
      title: '新会话',
      createdAt: Date.now(),
      status: 'idle',
      messages: [],
    };
    sessions.value.unshift(session);
    activeSessionId.value = session.id;
    return session;
  }

  function selectSession(id: string) {
    if (sessions.value.some((session) => session.id === id)) activeSessionId.value = id;
  }

  function applyEvent(event: AgentEvent) {
    const session = sessions.value.find((item) => item.id === event.sessionId);
    if (!session) return;
    const message = session.messages.find(
      (item) =>
        item.id === ('messageId' in event ? event.messageId : '') && item.role === 'assistant',
    );
    switch (event.type) {
      case 'assistant-start':
        session.messages.push({
          id: event.messageId,
          role: 'assistant',
          blocks: [],
          timestamp: event.time,
          streaming: true,
        });
        break;
      case 'assistant-delta':
        if (message) {
          const textBlock = message.blocks.find(
            (block): block is TextBlock => block.kind === 'text',
          );
          if (textBlock) textBlock.text += event.text;
          else message.blocks.push({ id: crypto.randomUUID(), kind: 'text', text: event.text });
        }
        break;
      case 'completed':
        session.status = 'completed';
        if (message) message.streaming = false;
        break;
      case 'cancelled':
        session.status = 'cancelled';
        if (message) message.streaming = false;
        break;
      case 'failed':
        session.status = 'failed';
        session.error = event.error;
        if (message) message.streaming = false;
        break;
    }
  }

  const unsubscribe = agentAdapter.subscribe(applyEvent);
  onScopeDispose(unsubscribe);

  async function send(text: string) {
    const prompt = text.trim();
    if (!prompt || activeSession.value?.status === 'running') return;
    const session = activeSession.value ?? createSession();
    session.title = session.messages.length === 0 ? prompt.slice(0, 32) : session.title;
    session.status = 'running';
    session.error = undefined;
    const userMessage: AgentMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      blocks: [{ id: crypto.randomUUID(), kind: 'text', text: prompt }],
      timestamp: Date.now(),
    };
    session.messages.push(userMessage);
    try {
      await agentAdapter.sendMessage(session.id, prompt);
    } catch (error) {
      session.status = 'failed';
      session.error = error instanceof Error ? error.message : '发送失败';
    }
  }

  function stop() {
    if (activeSession.value?.status === 'running') agentAdapter.cancel(activeSession.value.id);
  }

  return { sessions, activeSessionId, activeSession, createSession, selectSession, send, stop };
});
