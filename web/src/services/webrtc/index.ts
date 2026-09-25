export interface VideoStreamClient {
  connect(url: string): Promise<void>
  close(): void
}
