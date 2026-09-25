export type SessionStatus = 'idle' | 'running' | 'completed' | 'failed' | 'cancelled';

export type AgentMessageRole = 'user' | 'assistant' | 'tool';

interface MessageBlockBase {
  id: string;
}

export interface TextBlock extends MessageBlockBase {
  kind: 'text';
  text: string;
}

export interface ToolCallBlock extends MessageBlockBase {
  kind: 'tool-call';
  toolName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface ResultBlock extends MessageBlockBase {
  kind: 'result';
  content: string;
  status: 'completed' | 'failed';
}

export interface RobotActionBlock extends MessageBlockBase {
  kind: 'robot-action';
  action: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export type MessageBlock = TextBlock | ToolCallBlock | ResultBlock | RobotActionBlock;

export interface AgentMessage {
  id: string;
  role: AgentMessageRole;
  blocks: MessageBlock[];
  timestamp: number;
  streaming?: boolean;
}

export interface AgentSession {
  id: string;
  title: string;
  createdAt: number;
  status: SessionStatus;
  messages: AgentMessage[];
  error?: string;
}

type EventBase = {
  sessionId: string;
  time: number;
};

export type AgentEvent = EventBase &
  (
    | { type: 'assistant-start'; messageId: string }
    | { type: 'assistant-delta'; messageId: string; text: string }
    | { type: 'completed'; messageId: string }
    | { type: 'failed'; messageId: string; error: string }
    | { type: 'cancelled'; messageId: string }
  );
