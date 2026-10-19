import { execa } from 'execa';
import type { Device, AppInfo, SimctlResult } from '../types/index.js';

export class Simctl {
  /**
   * Execute xcrun simctl command.
   * Arguments are passed as an array without a shell, so spaces, quotes
   * and shell metacharacters in device names, paths and URLs are safe.
   */
  static async exec(args: string[]): Promise<SimctlResult> {
    const result = await execa('xcrun', ['simctl', ...args], { reject: false });

    return {
      success: !result.failed,
      stdout: (result.stdout ?? '').trim(),
      stderr: (result.stderr || result.originalMessage || result.message || '').trim(),
      exitCode: result.exitCode ?? 1
    };
  }

  /**
   * List all available devices
   */
  static async listDevices(): Promise<Device[]> {
    const result = await this.exec(['list', 'devices', 'available', '--json']);
    if (!result.success) {
      throw new Error(`Failed to list devices: ${result.stderr}`);
    }

    const parsed = JSON.parse(result.stdout) as {
      devices: Record<string, Array<{
        name: string;
        udid: string;
        state: string;
        isAvailable: boolean;
      }>>;
    };

    const devices: Device[] = [];

    for (const [runtime, runtimeDevices] of Object.entries(parsed.devices)) {
      for (const device of runtimeDevices) {
        devices.push({
          name: device.name,
          udid: device.udid,
          state: device.state as Device['state'],
          runtime: Simctl.formatRuntimeName(runtime),
          isAvailable: device.isAvailable
        });
      }
    }

    return devices;
  }

  /**
   * Turn "com.apple.CoreSimulator.SimRuntime.iOS-26-5" into "iOS 26.5"
   */
  private static formatRuntimeName(runtime: string): string {
    const clean = runtime.replace(/\s*--\s*$/, '').trim();
    const match = clean.match(/^com\.apple\.CoreSimulator\.SimRuntime\.(\w+)-(.+)$/);
    if (match) {
      return `${match[1]} ${match[2].split('-').join('.')}`;
    }
    return clean;
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
   * Open URL. Retries a few times because simctl regularly times out
   * while SpringBoard is still settling right after boot.
   */
  static async openUrl(url: string, device?: string): Promise<void> {
    const target = device || 'booted';
    const attempts = 3;
    let lastError = '';

    for (let attempt = 1; attempt <= attempts; attempt++) {
      const result = await this.exec(['openurl', target, url]);
      if (result.success) {
        return;
      }
      lastError = result.stderr;
      if (attempt < attempts) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    throw new Error(`Failed to open URL: ${lastError}`);
  }

  /**
   * Tap at coordinates
   */
  static async tap(x: number, y: number, device?: string): Promise<void> {
    const target = device || 'booted';
    const result = await this.exec(['io', target, 'tap', x.toString(), y.toString()]);
    if (!result.success) {
      throw new Error(`Failed to tap: ${result.stderr}`);
    }
  }

  /**
   * Swipe from coordinates to coordinates
   */
  static async swipe(x1: number, y1: number, x2: number, y2: number, device?: string): Promise<void> {
    const target = device || 'booted';
    const result = await this.exec(['io', target, 'swipe', x1.toString(), y1.toString(), x2.toString(), y2.toString()]);
    if (!result.success) {
      throw new Error(`Failed to swipe: ${result.stderr}`);
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
