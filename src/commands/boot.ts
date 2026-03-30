import { Simctl } from '../utils/simctl.js';
import { logger } from '../utils/logger.js';

export async function boot(deviceIdentifier: string): Promise<void> {
  try {
    logger.info(`Booting simulator: ${deviceIdentifier}`);

    const devices = await Simctl.listDevices();

    // Find device by name or UDID
    const device = devices.find(
      d => d.name === deviceIdentifier || d.udid === deviceIdentifier
    );

    if (!device) {
      logger.error(`Device not found: ${deviceIdentifier}`);
      logger.info('Run "simulator-use list" to see available devices');
      process.exit(1);
    }

    if (device.state === 'Booted') {
      logger.warn(`Device already booted: ${device.name}`);
      return;
    }

    await Simctl.bootDevice(device.udid);
    logger.success(`Booted: ${device.name}`);
  } catch (error: any) {
    logger.error(error.message);
    process.exit(1);
  }
}
