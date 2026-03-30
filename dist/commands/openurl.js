import { Simctl } from '../utils/simctl.js';
import { logger } from '../utils/logger.js';
export async function openUrl(url) {
    try {
        logger.info(`Opening URL: ${url}`);
        const booted = await Simctl.getBootedDevice();
        if (!booted) {
            logger.error('No booted simulator found');
            logger.info('Boot a simulator first with "simulator-use boot <device>"');
            process.exit(1);
        }
        logger.device(`Using: ${booted.name}`);
        await Simctl.openUrl(url);
        logger.success(`Opened in Safari`);
    }
    catch (error) {
        logger.error(error.message);
        process.exit(1);
    }
}
//# sourceMappingURL=openurl.js.map