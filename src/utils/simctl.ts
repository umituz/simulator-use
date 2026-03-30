import { exec } from 'child_process';
import { promisify } from 'util';
import type { Device, AppInfo, SimctlResult } from '../types/index.js';

const execAsync = promisify(exec);

export class Simctl {
  /**
   * Execute xcrun simctl command
   */
  static async exec(args: string[]): Promise<SimctlResult> {
    try {
      // Escape each argument properly for shell execution
      const escapedArgs = args.map(arg => {
        if (arg.includes(' ') || arg.includes('(') || arg.includes(')') || arg.includes('"') || arg.includes("'")) {
          return `"${arg.replace(/"/g, '\\"')}"`;
        }
        return arg;
      });

      const command = `xcrun simctl ${escapedArgs.join(' ')}`;
      const { stdout, stderr } = await execAsync(command);

      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: 0
      };
    } catch (error: any) {
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
  static async listDevices(): Promise<Device[]> {
    const result = await this.exec(['list', 'devices', 'available']);
    if (!result.success) {
      throw new Error(`Failed to list devices: ${result.stderr}`);
    }

    const devices: Device[] = [];
    const lines = result.stdout.split('\n');
    let currentRuntime = '';

    for (const line of lines) {
      // Parse runtime headers
      if (line.includes('--') && line.includes('iOS')) {
        currentRuntime = line.replace('--', '').trim();
        continue;
      }

      // Parse device lines
      const deviceMatch = line.match(
        /(.+?)\s+\(([A-F0-9-]+)\)\s+\((.+?)\)/
      );

      if (deviceMatch) {
        const [, name, udid, state] = deviceMatch;
        devices.push({
          name: name.trim(),
          udid,
          state: state as Device['state'],
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
  static async getBootedDevice(): Promise<Device | null> {
    const devices = await this.listDevices();
    return devices.find(d => d.state === 'Booted') || null;
  }

  /**
   * Boot a device
   */
  static async bootDevice(udid: string): Promise<void> {
    const result = await this.exec(['boot', udid]);
    if (!result.success) {
      throw new Error(`Failed to boot device: ${result.stderr}`);
    }
  }

  /**
   * Shutdown a device
   */
  static async shutdownDevice(udid: string): Promise<void> {
    const result = await this.exec(['shutdown', udid]);
    if (!result.success) {
      throw new Error(`Failed to shutdown device: ${result.stderr}`);
    }
  }

  /**
   * Take screenshot
   */
  static async screenshot(path: string, device?: string): Promise<void> {
    const target = device || 'booted';
    const result = await this.exec(['io', target, 'screenshot', path]);
    if (!result.success) {
      throw new Error(`Failed to take screenshot: ${result.stderr}`);
    }
  }

  /**
   * Launch app
   */
  static async launch(bundleId: string, device?: string): Promise<void> {
    const target = device || 'booted';
    const result = await this.exec(['launch', target, bundleId]);
    if (!result.success) {
      throw new Error(`Failed to launch app: ${result.stderr}`);
    }
  }

  /**
   * Terminate app
   */
  static async terminate(bundleId: string, device?: string): Promise<void> {
    const target = device || 'booted';
    const result = await this.exec(['terminate', target, bundleId]);
    if (!result.success) {
      throw new Error(`Failed to terminate app: ${result.stderr}`);
    }
  }

  /**
   * Open URL
   */
  static async openUrl(url: string, device?: string): Promise<void> {
    const target = device || 'booted';
    const result = await this.exec(['openurl', target, url]);
    if (!result.success) {
      throw new Error(`Failed to open URL: ${result.stderr}`);
    }
  }

  /**
   * List installed apps
   */
  static async listApps(device?: string): Promise<AppInfo[]> {
    const target = device || 'booted';
    const result = await this.exec(['listapps', target]);
    if (!result.success) {
      throw new Error(`Failed to list apps: ${result.stderr}`);
    }

    // Parse plist output (simplified)
    const apps: AppInfo[] = [];
    const bundleIdMatch = result.stdout.match(
      /CFBundleIdentifier = "(.+?)"/g
    );

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
