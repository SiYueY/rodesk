export interface RobotState {
  id: string
  name: string
  status: 'online' | 'offline' | 'error'
  timestamp: number
}

export interface RobotCommand {
  type: string
  payload?: unknown
}
