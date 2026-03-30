import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
export class Simctl {
    /**
     * Execute xcrun simctl command
     */
    static async exec(args) {
        try {
            const command = `xcrun simctl ${args.join(' ')}`;
            const { stdout, stderr } = await execAsync(command);
            return {
                success: true,
                stdout: stdout.trim(),
                stderr: stderr.trim(),
                exitCode: 0
            };
        }
        catch (error) {
            return {
                success: false,
                stdout: error.stdout || '',
                stderr: error.stderr || error.message,
                exitCode: error.code || 1
            };
        }
    }
    /**
     * List all available devices
     */
    static async listDevices() {
        const result = await this.exec(['list', 'devices', 'available']);
        if (!result.success) {
            throw new Error(`Failed to list devices: ${result.stderr}`);
        }
        const devices = [];
        const lines = result.stdout.split('\n');
        let currentRuntime = '';
        for (const line of lines) {
            // Parse runtime headers
            if (line.includes('--') && line.includes('iOS')) {
                currentRuntime = line.replace('--', '').trim();
                continue;
            }
            // Parse device lines
            const deviceMatch = line.match(/(.+?)\s+\(([A-F0-9-]+)\)\s+\((.+?)\)/);
            if (deviceMatch) {
                const [, name, udid, state] = deviceMatch;
                devices.push({
                    name: name.trim(),
                    udid,
                    state: state,
                    runtime: currentRuntime,
                    isAvailable: true
                });
            }
        }
        return devices;
    }
    /**
     * Get booted (running) device
     */
    static async getBootedDevice() {
        const devices = await this.listDevices();
        return devices.find(d => d.state === 'Booted') || null;
    }
    /**
     * Boot a device
     */
    static async bootDevice(udid) {
        const result = await this.exec(['boot', udid]);
        if (!result.success) {
            throw new Error(`Failed to boot device: ${result.stderr}`);
        }
    }
    /**
     * Shutdown a device
     */
    static async shutdownDevice(udid) {
        const result = await this.exec(['shutdown', udid]);
        if (!result.success) {
            throw new Error(`Failed to shutdown device: ${result.stderr}`);
        }
    }
    /**
     * Take screenshot
     */
    static async screenshot(path, device) {
        const target = device || 'booted';
        const result = await this.exec(['io', target, 'screenshot', path]);
        if (!result.success) {
            throw new Error(`Failed to take screenshot: ${result.stderr}`);
        }
    }
    /**
     * Launch app
     */
    static async launch(bundleId, device) {
        const target = device || 'booted';
        const result = await this.exec(['launch', target, bundleId]);
        if (!result.success) {
            throw new Error(`Failed to launch app: ${result.stderr}`);
        }
    }
    /**
     * Terminate app
     */
    static async terminate(bundleId, device) {
        const target = device || 'booted';
        const result = await this.exec(['terminate', target, bundleId]);
        if (!result.success) {
            throw new Error(`Failed to terminate app: ${result.stderr}`);
        }
    }
    /**
     * Open URL
     */
    static async openUrl(url, device) {
        const target = device || 'booted';
        const result = await this.exec(['openurl', target, url]);
        if (!result.success) {
            throw new Error(`Failed to open URL: ${result.stderr}`);
        }
    }
    /**
     * List installed apps
     */
    static async listApps(device) {
        const target = device || 'booted';
        const result = await this.exec(['listapps', target]);
        if (!result.success) {
            throw new Error(`Failed to list apps: ${result.stderr}`);
        }
        // Parse plist output (simplified)
        const apps = [];
        const bundleIdMatch = result.stdout.match(/CFBundleIdentifier = "(.+?)"/g);
        if (bundleIdMatch) {
            for (const match of bundleIdMatch) {
                const bundleId = match.match(/"(.+?)"/)?.[1];
                if (bundleId) {
                    apps.push({
                        bundleIdentifier: bundleId,
                        bundlePath: ''
                    });
                }
            }
        }
        return apps;
    }
}
//# sourceMappingURL=simctl.js.map