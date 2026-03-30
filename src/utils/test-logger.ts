/**
 * Test Logger
 * Enhanced logging for test execution with file output
 */

import { promises as fs } from 'fs';
import path from 'path';
import { format } from 'util';

/**
 * Test Logger Class
 */
export class TestLogger {
  private sessionId: string | null = null;
  private executionLog: string[] = [];
  private errorLog: string[] = [];
  private currentStep: number = 0;

  /**
   * Initialize logger with session
   */
  initialize(sessionId: string): void {
    this.sessionId = sessionId;
    this.executionLog = [];
    this.errorLog = [];
    this.currentStep = 0;
  }

  /**
   * Log test start
   */
  logStart(testName: string, device: string): void {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] Starting test: ${testName}`;
    this.executionLog.push(message);
    console.log(`🚀 ${message}`);
    console.log(`📱 Device: ${device}`);
  }

  /**
   * Log a test step
   */
  logStep(stepNumber: number, action: string, target: string, details?: any): void {
    this.currentStep = stepNumber;
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] Step ${stepNumber}: ${action} -> ${target}`;
    this.executionLog.push(message);

    if (details) {
      this.executionLog.push(`  Details: ${JSON.stringify(details)}`);
    }

    console.log(`  ⏭️  Step ${stepNumber}: ${action} → ${target}`);
  }

  /**
   * Log success
   */
  logSuccess(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ✓ ${message}`;
    this.executionLog.push(logMessage);
    console.log(`  ✅ ${message}`);
  }

  /**
   * Log error
   */
  logError(message: string, error?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ✗ ${message}`;
    this.errorLog.push(logMessage);

    if (error) {
      this.errorLog.push(`  Error: ${error.message}`);
      if (error.stack) {
        this.errorLog.push(`  Stack: ${error.stack}`);
      }
    }

    console.log(`  ❌ ${message}`);
  }

  /**
   * Log warning
   */
  logWarning(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ⚠ ${message}`;
    this.executionLog.push(logMessage);
    console.log(`  ⚠️  ${message}`);
  }

  /**
   * Log info
   */
  logInfo(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ℹ️ ${message}`;
    this.executionLog.push(logMessage);
    console.log(`  ℹ️  ${message}`);
  }

  /**
   * Log screenshot saved
   */
  logScreenshot(screenshotPath: string): void {
    const filename = path.basename(screenshotPath);
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] 📸 Screenshot saved: ${filename}`;
    this.executionLog.push(message);
    console.log(`  📸 Screenshot: ${filename}`);
  }

  /**
   * Log validation
   */
  logValidation(expected: string, actual: string, passed: boolean): void {
    const timestamp = new Date().toISOString();
    const status = passed ? '✓' : '✗';
    const message = `[${timestamp}] ${status} Validation: ${expected}`;
    this.executionLog.push(message);
    console.log(`  ${status} Validation: ${expected}`);
    if (!passed) {
      this.executionLog.push(`    Actual: ${actual}`);
    }
  }

  /**
   * Save logs to files
   */
  async saveLogs(): Promise<void> {
    if (!this.sessionId) return;

    const sessionDir = path.join(process.cwd(), 'test-sessions', this.sessionId);
    const logsDir = path.join(sessionDir, 'logs');

    // Save execution log
    const executionLogPath = path.join(logsDir, 'execution.log');
    await fs.writeFile(executionLogPath, this.executionLog.join('\n'));

    // Save error log (if any errors)
    if (this.errorLog.length > 0) {
      const errorLogPath = path.join(logsDir, 'errors.log');
      await fs.writeFile(errorLogPath, this.errorLog.join('\n'));
    }
  }

  /**
   * Log test completion
   */
  logCompletion(status: 'passed' | 'failed', duration: number, stepCount: number): void {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] Test ${status}: ${stepCount} steps completed in ${duration}ms`;
    this.executionLog.push(message);
    console.log(`\n  📊 Test ${status}: ${stepCount} steps in ${duration}ms`);
  }

  /**
   * Get execution log
   */
  getExecutionLog(): string[] {
    return this.executionLog;
  }

  /**
   * Get error log
   */
  getErrorLog(): string[] {
    return this.errorLog;
  }

  /**
   * Get current step number
   */
  getCurrentStep(): number {
    return this.currentStep;
  }

  /**
   * Increment step counter
   */
  incrementStep(): number {
    return ++this.currentStep;
  }
}

/**
 * Singleton instance
 */
export const testLogger = new TestLogger();
