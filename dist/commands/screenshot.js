import { Simctl } from '../utils/simctl.js';
import { logger } from '../utils/logger.js';
import path from 'path';
export async function screenshot(filePath) {
    try {
        // Resolve to absolute path
        const absolutePath = path.resolve(filePath);
        logger.info(`Taking screenshot: ${absolutePath}`);
        const booted = await Simctl.getBootedDevice();
        if (!booted) {
            logger.error('No booted simulator found');
            logger.info('Boot a simulator first with "simulator-use boot <device>"');
            process.exit(1);
        }
        logger.device(`Using: ${booted.name}`);
        await Simctl.screenshot(absolutePath);
        logger.success(`Screenshot saved: ${absolutePath}`);
    }
    catch (error) {
        logger.error(error.message);
        process.exit(1);
    }
}
//# sourceMappingURL=screenshot.js.map