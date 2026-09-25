import type { TeleoperationService } from '../services/teleoperationService';
import type { VelocityCommand } from '../types';

export class MockTeleoperationService implements TeleoperationService {
  async connect(): Promise<void> {
    console.info('[teleoperation] mock service connected');
  }

  async disconnect(): Promise<void> {
    console.info('[teleoperation] mock service disconnected');
  }

  async sendVelocity(command: VelocityCommand): Promise<void> {
    console.info('[teleoperation] velocity command', command);
  }
}
