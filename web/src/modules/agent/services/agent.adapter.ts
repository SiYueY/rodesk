import type { AgentEvent } from '../types';

export interface AgentAdapter {
  subscribe(listener: (event: AgentEvent) => void): () => void;
  sendMessage(sessionId: string, message: string): Promise<void>;
  cancel(sessionId: string): void;
}
