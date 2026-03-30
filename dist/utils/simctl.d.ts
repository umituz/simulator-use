import type { Device, AppInfo, SimctlResult } from '../types/index.js';
export declare class Simctl {
    /**
     * Execute xcrun simctl command
     */
    static exec(args: string[]): Promise<SimctlResult>;
    /**
     * List all available devices
     */
    static listDevices(): Promise<Device[]>;
    /**
     * Get booted (running) device
     */
    static getBootedDevice(): Promise<Device | null>;
    /**
     * Boot a device
     */
    static bootDevice(udid: string): Promise<void>;
    /**
     * Shutdown a device
     */
    static shutdownDevice(udid: string): Promise<void>;
    /**
     * Take screenshot
     */
    static screenshot(path: string, device?: string): Promise<void>;
    /**
     * Launch app
     */
    static launch(bundleId: string, device?: string): Promise<void>;
    /**
     * Terminate app
     */
    static terminate(bundleId: string, device?: string): Promise<void>;
    /**
     * Open URL
     */
    static openUrl(url: string, device?: string): Promise<void>;
    /**
     * List installed apps
     */
    static listApps(device?: string): Promise<AppInfo[]>;
}
//# sourceMappingURL=simctl.d.ts.map