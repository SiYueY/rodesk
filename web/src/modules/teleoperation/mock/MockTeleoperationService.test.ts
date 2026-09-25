import { afterEach, describe, expect, it, vi } from 'vitest';
import { MockTeleoperationService } from './MockTeleoperationService';

describe('MockTeleoperationService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('connects, disconnects, and logs a velocity command', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const service = new MockTeleoperationService();
    const command = { linearX: 0, linearY: 0, angularZ: 0 };

    await service.connect();
    await service.sendVelocity(command);
    await service.disconnect();

    expect(info).toHaveBeenNthCalledWith(1, '[teleoperation] mock service connected');
    expect(info).toHaveBeenNthCalledWith(2, '[teleoperation] velocity command', command);
    expect(info).toHaveBeenNthCalledWith(3, '[teleoperation] mock service disconnected');
  });
});
