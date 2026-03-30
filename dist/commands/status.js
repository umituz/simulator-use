import { Simctl } from '../utils/simctl.js';
import { logger } from '../utils/logger.js';
export async function status() {
    try {
        logger.header('iOS Simulator Status');
        const booted = await Simctl.getBootedDevice();
        if (!booted) {
            logger.warn('No booted simulators');
            logger.info('Boot a simulator with "simulator-use boot <device>"');
            return;
        }
        logger.device(`Device: ${booted.name}`);
        logger.info(`UDID: ${booted.udid}`);
        logger.info(`Runtime: ${booted.runtime}`);
        logger.info(`State: ${booted.state}`);
        console.log('');
        logger.success('Simulator is running');
    }
    catch (error) {
        logger.error(error.message);
        process.exit(1);
    }
}
//# sourceMappingURL=status.js.map