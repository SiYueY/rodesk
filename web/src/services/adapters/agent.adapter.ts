export interface AgentAdapter {
  sendMessage(message: string): Promise<void>
}
