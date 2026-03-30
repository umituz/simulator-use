import { Simctl } from '../utils/simctl.js';
import { logger } from '../utils/logger.js';

export async function launch(bundleId: string): Promise<void> {
  try {
    logger.info(`Launching app: ${bundleId}`);

    const booted = await Simctl.getBootedDevice();
    if (!booted) {
      logger.error('No booted simulator found');
      logger.info('Boot a simulator first with "simulator-use boot <device>"');
      process.exit(1);
    }

    logger.device(`Using: ${booted.name}`);

    await Simctl.launch(bundleId);
    logger.success(`Launched: ${bundleId}`);
  } catch (error: any) {
    logger.error(error.message);
    process.exit(1);
  }
}
