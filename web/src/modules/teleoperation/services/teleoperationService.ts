import type { VelocityCommand } from '../types';

export interface TeleoperationService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendVelocity(command: VelocityCommand): Promise<void>;
}
