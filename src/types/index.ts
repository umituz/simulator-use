export interface Device {
  name: string;
  udid: string;
  state: 'Booted' | 'Shutdown' | 'Booting' | 'Shutting Down';
  runtime: string;
  isAvailable: boolean;
}

export interface AppInfo {
  bundleIdentifier: string;
  bundlePath: string;
  displayName?: string;
  version?: string;
}

export interface ScreenshotOptions {
  path: string;
  device?: string;
  fullPage?: boolean;
}

export interface LaunchOptions {
  bundleId: string;
  device?: string;
  waitForLaunch?: boolean;
}

export interface SimctlResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}
