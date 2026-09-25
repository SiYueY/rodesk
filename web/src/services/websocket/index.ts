export interface WebSocketClient {
  connect(url: string): Promise<void>
  disconnect(): void
  send<T>(message: T): void
  subscribe<T>(topic: string, callback: (message: T) => void): () => void
}
