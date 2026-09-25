import type { RobotState } from '@/domain/robot'

export function createMockRobot(): RobotState {
  return {
    id: 'mock-robot',
    name: 'Mock Robot',
    status: 'online',
    timestamp: Date.now(),
  }
}
