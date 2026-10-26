/**
 * HID Input Backend
 *
 * Xcode 26 removed `simctl io <device> tap|swipe`, so on modern toolchains
 * there is no headless touch injection through simctl. This backend drives
 * the Simulator.app window instead: it reads the device screen rectangle
 * from the accessibility tree, maps device points to screen points and
 * sends real mouse events with cliclick. It needs Simulator.app running
 * with a visible device window, cliclick on the PATH (`brew install
 * cliclick`) and Accessibility permission for the calling terminal app.
 */

import { execa } from 'execa';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import path from 'path';

interface ScreenRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PixelSize {
  width: number;
  height: number;
}

export class HID {
  private static rectCache: ScreenRect | null = null;
  private static pixelsCache: PixelSize | null = null;

  /**
   * Tap at device point (x, y). Coordinates are logical points,
   * the same space `simctl io tap` used to accept.
   */
  static async tap(x: number, y: number, device?: string): Promise<void> {
    const { screen, msDelay } = await this.prepare();
    const point = await this.toScreenPoint(x, y, screen);
    await this.cliclick(`c:${point.x},${point.y}`);
    await this.sleep(msDelay);
  }

  /**
   * Drag from one device point to another.
   */
  static async swipe(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    device?: string
  ): Promise<void> {
    const { screen, msDelay } = await this.prepare();
    const from = await this.toScreenPoint(x1, y1, screen);
    const to = await this.toScreenPoint(x2, y2, screen);
    await this.cliclick(
      `dd:${from.x},${from.y}`,
      'w:120',
      `dm:${to.x},${to.y}`,
      'w:120',
      `du:${to.x},${to.y}`
    );
    await this.sleep(msDelay);
  }

  /**
   * Type text into whatever currently has keyboard focus.
   * Combine with a tap on a text field first.
   */
  static async typeText(text: string): Promise<void> {
    await this.requireCliclick();
    await this.activateSimulator();
    await this.cliclick(`t:${text}`);
    await this.sleep(200);
  }

  /**
   * Bring Simulator to the front and locate the device screen inside
   * its window. Clicks are global, so the window must be frontmost.
   */
  private static async prepare(): Promise<{ screen: ScreenRect; msDelay: number }> {
    await this.requireCliclick();
    await this.activateSimulator();
    const screen = await this.deviceScreenRect();
    return { screen, msDelay: 150 };
  }

  private static async activateSimulator(): Promise<void> {
    await execa('osascript', ['-e', 'tell application "Simulator" to activate']);
    await this.sleep(400);
  }

  /**
   * Device screen rectangle in screen points, read from the
   * accessibility tree of the front Simulator window.
   */
  private static async deviceScreenRect(): Promise<ScreenRect> {
    if (this.rectCache) {
      return this.rectCache;
    }

    const script = `
tell application "System Events" to tell process "Simulator"
  set out to ""
  repeat with e in UI elements of window 1
    try
      if role of e is "AXGroup" then
        set p to position of e
        set s to size of e
        set out to ((item 1 of p) as string) & "," & ((item 2 of p) as string) & "," & ((item 1 of s) as string) & "," & ((item 2 of s) as string)
        exit repeat
      end if
    end try
  end repeat
  return out
end tell`;

    const result = await execa('osascript', ['-e', script], { reject: false });
    const parts = result.stdout?.trim().split(',').map(Number);

    if (!parts || parts.length !== 4 || parts.some(Number.isNaN)) {
      throw new Error(
        'Could not locate the device screen in the Simulator window. ' +
          'Make sure Simulator.app is running with a visible device window, ' +
          'and that your terminal app has Accessibility permission ' +
          '(System Settings > Privacy & Security > Accessibility).'
      );
    }

    this.rectCache = { x: parts[0], y: parts[1], w: parts[2], h: parts[3] };
    return this.rectCache;
  }

  /**
   * Device screen size in pixels, from the PNG header of a temp
   * screenshot. Used to map logical points onto the window rectangle.
   */
  private static async devicePixels(device?: string): Promise<PixelSize> {
    if (this.pixelsCache) {
      return this.pixelsCache;
    }

    const target = device || 'booted';
    const shot = path.join(tmpdir(), `simulator-use-hid-${process.pid}.png`);
    const shotResult = await execa(
      'xcrun',
      ['simctl', 'io', target, 'screenshot', shot],
      { reject: false }
    );
    if (shotResult.failed) {
      throw new Error(`Failed to screenshot device for coordinate mapping: ${shotResult.stderr}`);
    }

    const buffer = await fs.readFile(shot);
    await fs.rm(shot, { force: true });
    this.pixelsCache = { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    return this.pixelsCache;
  }

  /**
   * Logical points-per-pixel scale of the device (3x iPhones, 2x
   * iPads/SE-class devices). Override with SIMULATOR_USE_SCALE.
   */
  private static async deviceScale(device?: string): Promise<number> {
    const override = Number(process.env.SIMULATOR_USE_SCALE);
    if (override > 0) {
      return override;
    }

    if (device && /iPad|Watch|TV|-SE-|16e/i.test(device)) {
      return 2;
    }
    return 3;
  }

  private static async toScreenPoint(x: number, y: number, screen: ScreenRect): Promise<{ x: number; y: number }> {
    const pixels = await this.devicePixels();
    const scale = await this.deviceScale();
    const logicalWidth = pixels.width / scale;
    const logicalHeight = pixels.height / scale;

    const ratioX = Math.min(Math.max(x / logicalWidth, 0), 1);
    const ratioY = Math.min(Math.max(y / logicalHeight, 0), 1);

    return {
      x: Math.round(screen.x + ratioX * screen.w),
      y: Math.round(screen.y + ratioY * screen.h)
    };
  }

  private static async requireCliclick(): Promise<void> {
    const result = await execa('cliclick', ['-V'], { reject: false });
    if (result.failed) {
      throw new Error(
        'cliclick is required for tap/swipe on this Xcode (simctl io tap was removed). ' +
          'Install it with: brew install cliclick'
      );
    }
  }

  private static async cliclick(...actions: string[]): Promise<void> {
    const result = await execa('cliclick', actions, { reject: false });
    if (result.failed) {
      throw new Error(`cliclick failed: ${result.stderr || result.stdout}`);
    }
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
