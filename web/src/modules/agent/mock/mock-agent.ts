import type { AgentAdapter } from '../services/agent.adapter';
import type { AgentEvent } from '../types';

type MockEvent = AgentEvent extends infer Event
  ? Event extends { sessionId: string; time: number }
    ? Omit<Event, 'sessionId' | 'time'>
    : never
  : never;

function pause(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Cancelled', 'AbortError'));
      return;
    }
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', cancel);
      resolve();
    }, ms);
    function cancel() {
      window.clearTimeout(timer);
      reject(new DOMException('Cancelled', 'AbortError'));
    }
    signal.addEventListener('abort', cancel, { once: true });
  });
}

export function createMockAgent(): AgentAdapter {
  const listeners = new Set<(event: AgentEvent) => void>();
  const active = new Map<string, AbortController>();
  const emit = (sessionId: string, event: MockEvent) => {
    const fullEvent = { ...event, sessionId, time: Date.now() } as AgentEvent;
    listeners.forEach((listener) => listener(fullEvent));
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async sendMessage(sessionId, prompt) {
      if (active.has(sessionId)) throw new Error('此会话正在运行');
      const controller = new AbortController();
      active.set(sessionId, controller);
      const messageId = crypto.randomUUID();
      emit(sessionId, { type: 'assistant-start', messageId });
      const response = `我收到了你的消息：“${prompt}”。当前页面使用本地演示响应，接入模型服务后会在这里显示真实回复。`;
      try {
        for (let index = 0; index < response.length; index += 8) {
          await pause(70, controller.signal);
          emit(sessionId, {
            type: 'assistant-delta',
            messageId,
            text: response.slice(index, index + 8),
          });
        }
        emit(sessionId, { type: 'completed', messageId });
      } catch (error) {
        if (controller.signal.aborted) emit(sessionId, { type: 'cancelled', messageId });
        else
          emit(sessionId, {
            type: 'failed',
            messageId,
            error: error instanceof Error ? error.message : '未知错误',
          });
      } finally {
        active.delete(sessionId);
      }
    },
    cancel(sessionId) {
      active.get(sessionId)?.abort();
    },
  };
}
