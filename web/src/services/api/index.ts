export interface ApiClient {
  request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T>
}
