/**
 * Error Detection & Auto-Fix Framework
 * Detects common issues and automatically fixes them
 */

import type { TestError } from '../types/testing.js';

/**
 * Error Detector
 * Detects common simulator and app issues
 */
export class ErrorDetector {
  /**
   * Detect app crash
   */
  static detectCrash(log: string): { crashed: boolean; details?: string } {
    const crashPatterns = [
      /crashed/i,
      /exception|exited/i,
      /signal 11/i,
      /killed/i,
      /abort/i
    ];

    for (const pattern of crashPatterns) {
      if (pattern.test(log)) {
        return {
          crashed: true,
          details: `Crash pattern detected: ${pattern}`
        };
      }
    }

    return { crashed: false };
  }

  /**
   * Detect app freeze
   */
  static detectFreeze(log: string, timeout: number): { frozen: boolean; details?: string } {
    // Check if no activity for longer than timeout
    const timestamps = log.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g);
    if (timestamps && timestamps.length > 1) {
      const first = new Date(timestamps[0]).getTime();
      const last = new Date(timestamps[timestamps.length - 1]).getTime();
      const duration = last - first;

      if (duration > timeout) {
        return {
          frozen: true,
          details: `No activity for ${duration}ms (timeout: ${timeout}ms)`
        };
      }
    }

    return { frozen: false };
  }

  /**
   * Detect network error
   */
  static detectNetworkError(log: string): { networkError: boolean; details?: string } {
    const networkPatterns = [
      /network/i,
      /connection/i,
      /timeout/i,
      /failed to fetch/i,
      /unable to connect/i,
      /dns/i,
      /502/i,
      /503/i,
      /504/i
    ];

    for (const pattern of networkPatterns) {
      if (pattern.test(log)) {
        return {
          networkError: true,
          details: `Network pattern detected: ${pattern}`
        };
      }
    }

    return { networkError: false };
  }

  /**
   * Detect app not responding
   */
  static async detectAppNotResponding(bundleId: string, timeout: number): Promise<{ notResponding: boolean; details?: string }> {
    // This would involve monitoring app activity
    // For now, placeholder implementation
    return { notResponding: false };
  }

  /**
   * Detect common simulator issues
   */
  static detectSimulatorIssues(log: string): { issues: string[] } {
    const issues: string[] = [];

    // Check for device not found
    if (log.includes('device not found') || log.includes('unable to find device')) {
      issues.push('Device not found - ensure device is booted');
    }

    // Check for permission issues
    if (log.includes('permission') || log.includes('unauthorized')) {
      issues.push('Permission denied - check app permissions');
    }

    // Check for memory issues
    if (log.includes('memory') || log.includes('out of memory')) {
      issues.push('Memory issue - try restarting simulator');
    }

    return { issues };
  }
}

/**
 * Auto Fixer
 * Automatically fixes common issues
 */
export class AutoFixer {
  /**
   * Attempt to fix app crash
   */
  static async fixCrash(simctl: any, bundleId: string): Promise<{ fixed: boolean; details: string }> {
    try {
      // Try terminating and relaunching
      await simctl.terminate(bundleId);
      await this.delay(2000);
      await simctl.launch(bundleId);
      await this.delay(3000);

      return {
        fixed: true,
        details: 'Terminated and relaunched app'
      };
    } catch (error: any) {
      return {
        fixed: false,
        details: `Failed to fix crash: ${error.message}`
      };
    }
  }

  /**
   * Attempt to fix freeze
   */
  static async fixFreeze(simctl: any, bundleId: string): Promise<{ fixed: boolean; details: string }> {
    try {
      // Try sending a tap event to wake up
      // This is a placeholder - actual implementation would use AppleScript
      await simctl.terminate(bundleId);
      await this.delay(1000);
      await simctl.launch(bundleId);
      await this.delay(2000);

      return {
        fixed: true,
        details: 'Relaunched app to fix freeze'
      };
    } catch (error: any) {
      return {
        fixed: false,
        details: `Failed to fix freeze: ${error.message}`
      };
    }
  }

  /**
   * Attempt to fix network error
   */
  static async fixNetworkError(): Promise<{ fixed: boolean; details: string }> {
    // Network errors in simulators are often transient
    // Just wait and retry
    await this.delay(5000);

    return {
      fixed: true,
      details: 'Waited 5s for network to recover'
    };
  }

  /**
   * Retry operation with exponential backoff
   */
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<{ success: boolean; result?: T; error?: string }> {
    let lastError: string = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        return { success: true, result };
      } catch (error: any) {
        lastError = error.message;
        const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        await this.delay(delay);

        console.log(`  🔄 Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      }
    }

    return {
      success: false,
      error: `Failed after ${maxRetries} retries. Last error: ${lastError}`
    };
  }

  /**
   * Fix simulator device issues
   */
  static async fixDeviceIssues(simctl: any, issues: string[]): Promise<{ fixed: string[]; failed: string[] }> {
    const fixed: string[] = [];
    const failed: string[] = [];

    for (const issue of issues) {
      if (issue.includes('Device not found')) {
        // Try to list devices and suggest correct names
        try {
          const devices = await simctl.listDevices();
          const deviceNames = devices.map((d: any) => d.name).join(', ');
          fixed.push(`Device not found - Available devices: ${deviceNames}`);
        } catch (error) {
          failed.push(issue);
        }
      } else if (issue.includes('Memory issue')) {
        // Suggest restarting simulator
        fixed.push('Memory issue - Restart simulator to free memory');
      } else {
        failed.push(issue);
      }
    }

    return { fixed, failed };
  }

  /**
   * Delay helper
   */
  private static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Error Recovery Manager
 * Orchestrates error detection and auto-fixing
 */
export class ErrorRecoveryManager {
  /**
   * Handle error with auto-fix attempt
   */
  static async handleError(
    error: Error,
    context: {
      bundleId?: string;
      sessionId?: string;
      simctl?: any;
    }
  ): Promise<{ resolved: boolean; resolution?: string }> {
    const errorDetails = {
      message: error.message,
      name: error.name
    };

    // Detect error type
    const crash = ErrorDetector.detectCrash(errorDetails.message);
    if (crash.crashed && context.bundleId && context.simctl) {
      const fixResult = await AutoFixer.fixCrash(context.simctl, context.bundleId);
      return {
        resolved: fixResult.fixed,
        resolution: fixResult.details
      };
    }

    const freeze = ErrorDetector.detectFreeze(errorDetails.message, 10000);
    if (freeze.frozen && context.bundleId && context.simctl) {
      const fixResult = await AutoFixer.fixFreeze(context.simctl, context.bundleId);
      return {
        resolved: fixResult.fixed,
        resolution: fixResult.details
      };
    }

    const network = ErrorDetector.detectNetworkError(errorDetails.message);
    if (network.networkError) {
      const fixResult = await AutoFixer.fixNetworkError();
      return {
        resolved: fixResult.fixed,
        resolution: fixResult.details
      };
    }

    return { resolved: false };
  }
}
