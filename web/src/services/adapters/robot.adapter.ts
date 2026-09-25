import type { RobotState } from '@/domain'

export interface RobotAdapter {
  getState(): Promise<RobotState>
}
