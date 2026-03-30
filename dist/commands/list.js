import { Simctl } from '../utils/simctl.js';
import { logger } from '../utils/logger.js';
export async function list() {
    try {
        logger.header('Available iOS Simulators');
        const devices = await Simctl.listDevices();
        if (devices.length === 0) {
            logger.warn('No simulators found');
            return;
        }
        // Group by runtime
        const byRuntime = {};
        for (const device of devices) {
            if (!byRuntime[device.runtime]) {
                byRuntime[device.runtime] = [];
            }
            byRuntime[device.runtime].push(device);
        }
        // Display by runtime
        for (const [runtime, runtimeDevices] of Object.entries(byRuntime)) {
            logger.info(runtime);
            for (const device of runtimeDevices) {
                const status = device.state === 'Booted' ? '🟢' : '⚫';
                const deviceInfo = `  ${status} ${device.name} (${device.udid.substring(0, 8)}...)`;
                console.log(deviceInfo);
            }
            console.log('');
        }
        logger.success(`Found ${devices.length} simulator(s)`);
    }
    catch (error) {
        logger.error(error.message);
        process.exit(1);
    }
}
//# sourceMappingURL=list.js.map