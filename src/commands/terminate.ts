import { Simctl } from '../utils/simctl.js';
import { logger } from '../utils/logger.js';

export async function terminate(bundleId: string): Promise<void> {
  try {
    logger.info(`Terminating app: ${bundleId}`);

    const booted = await Simctl.getBootedDevice();
    if (!booted) {
      logger.error('No booted simulator found');
      logger.info('Boot a simulator first with "simulator-use boot <device>"');
      process.exit(1);
    }

    logger.device(`Using: ${booted.name}`);

    await Simctl.terminate(bundleId);
    logger.success(`Terminated: ${bundleId}`);
  } catch (error: any) {
    logger.error(error.message);
    process.exit(1);
  }
}
