import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { AgentAdapter } from '../services/agent.adapter';
import type { AgentEvent } from '../types';

const harness = vi.hoisted(() => {
  const listeners = new Set<(event: AgentEvent) => void>();
  let resolveSend: (() => void) | undefined;

  const adapter: AgentAdapter = {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    sendMessage: vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSend = resolve;
        }),
    ),
    cancel: vi.fn(),
  };

  return {
    adapter,
    emit(event: AgentEvent) {
      listeners.forEach((listener) => listener(event));
    },
    resolveSend() {
      resolveSend?.();
    },
    reset() {
      listeners.clear();
      resolveSend = undefined;
      vi.clearAllMocks();
    },
  };
});

vi.mock('../services', () => ({
  agentAdapter: harness.adapter,
}));

import { useAgentStore } from './agent.store';

describe('agent store', () => {
  beforeEach(() => {
    harness.reset();
    setActivePinia(createPinia());
  });

  it('creates and selects sessions', () => {
    const store = useAgentStore();
    const first = store.createSession();
    const second = store.createSession();

    store.selectSession(first.id);

    expect(store.sessions).toHaveLength(2);
    expect(store.activeSessionId).toBe(first.id);
    expect(second.title).toBe('新会话');
  });

  it('builds a streaming assistant response from adapter events', async () => {
    const store = useAgentStore();
    const pending = store.send('你好');
    const session = store.activeSession!;

    harness.emit({
      type: 'assistant-start',
      sessionId: session.id,
      messageId: 'assistant-1',
      time: 1,
    });
    harness.emit({
      type: 'assistant-delta',
      sessionId: session.id,
      messageId: 'assistant-1',
      text: '你好，',
      time: 2,
    });
    harness.emit({
      type: 'assistant-delta',
      sessionId: session.id,
      messageId: 'assistant-1',
      text: '我是 Agent。',
      time: 3,
    });
    harness.emit({
      type: 'completed',
      sessionId: session.id,
      messageId: 'assistant-1',
      time: 4,
    });
    harness.resolveSend();
    await pending;

    expect(session.title).toBe('你好');
    expect(session.status).toBe('completed');
    expect(session.messages).toHaveLength(2);
    expect(session.messages[1]).toMatchObject({
      id: 'assistant-1',
      role: 'assistant',
      streaming: false,
      blocks: [{ kind: 'text', text: '你好，我是 Agent。' }],
    });
  });

  it('marks a stopped response as cancelled', async () => {
    const store = useAgentStore();
    const pending = store.send('停止');
    const session = store.activeSession!;

    store.stop();
    harness.emit({
      type: 'assistant-start',
      sessionId: session.id,
      messageId: 'assistant-2',
      time: 1,
    });
    harness.emit({
      type: 'cancelled',
      sessionId: session.id,
      messageId: 'assistant-2',
      time: 2,
    });
    harness.resolveSend();
    await pending;

    expect(harness.adapter.cancel).toHaveBeenCalledWith(session.id);
    expect(session.status).toBe('cancelled');
    expect(session.messages[1]?.streaming).toBe(false);
  });

  it('records adapter failures on the active session', async () => {
    const store = useAgentStore();
    const pending = store.send('失败');
    const session = store.activeSession!;

    harness.emit({
      type: 'assistant-start',
      sessionId: session.id,
      messageId: 'assistant-3',
      time: 1,
    });
    harness.emit({
      type: 'failed',
      sessionId: session.id,
      messageId: 'assistant-3',
      error: '连接失败',
      time: 2,
    });
    harness.resolveSend();
    await pending;

    expect(session.status).toBe('failed');
    expect(session.error).toBe('连接失败');
    expect(session.messages[1]?.streaming).toBe(false);
  });
});
