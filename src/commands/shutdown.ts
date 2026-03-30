import { Simctl } from '../utils/simctl.js';
import { logger } from '../utils/logger.js';

export async function shutdown(deviceIdentifier: string): Promise<void> {
  try {
    logger.info(`Shutting down simulator: ${deviceIdentifier}`);

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

    if (device.state === 'Shutdown') {
      logger.warn(`Device already shut down: ${device.name}`);
      return;
    }

    await Simctl.shutdownDevice(device.udid);
    logger.success(`Shut down: ${device.name}`);
  } catch (error: any) {
    logger.error(error.message);
    process.exit(1);
  }
}
