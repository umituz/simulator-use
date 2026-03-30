/**
 * Test Result Management
 * Handles test session creation, folder organization, and file management
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { TestSession, TestMetadata } from '../types/testing.js';

/**
 * Test Result Manager
 */
export class TestResultManager {
  /**
   * Create a new test session
   */
  static async createSession(testName: string, deviceName: string): Promise<string> {
    const sessionId = this.generateSessionId(testName);
    const baseDir = this.getSessionDir(sessionId);

    // Create directory structure
    await fs.mkdir(baseDir, { recursive: true });
    await fs.mkdir(path.join(baseDir, 'screenshots'), { recursive: true });
    await fs.mkdir(path.join(baseDir, 'logs'), { recursive: true });

    // Create metadata
    const metadata: TestMetadata = {
      deviceName,
      deviceUDID: '',
      iosVersion: '',
      status: 'created',
      totalSteps: 0,
      completedSteps: 0,
      errors: []
    };

    await fs.writeFile(
      path.join(baseDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    return sessionId;
  }

  /**
   * Get session directory
   */
  static getSessionDir(sessionId: string): string {
    const sessionsDir = path.join(process.cwd(), 'test-sessions');
    return path.join(sessionsDir, sessionId);
  }

  /**
   * Generate unique session ID
   */
  static generateSessionId(testName: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_');
    const safeName = testName.replace(/\s+/g, '-').toLowerCase();
    return `${timestamp}_${safeName}`;
  }

  /**
   * Save screenshot to test session
   */
  static async saveScreenshot(sessionId: string, stepNumber: number, name: string): Promise<string> {
    const sessionDir = this.getSessionDir(sessionId);
    const filename = `${stepNumber.toString().padStart(2, '0')}_${name}.png`;
    const screenshotPath = path.join(sessionDir, 'screenshots', filename);
    return screenshotPath;
  }

  /**
   * Update session metadata
   */
  static async updateMetadata(sessionId: string, updates: Partial<TestMetadata>): Promise<void> {
    const sessionDir = this.getSessionDir(sessionId);
    const metadataPath = path.join(sessionDir, 'metadata.json');

    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8')) as TestMetadata;
    const updated = { ...metadata, ...updates };

    await fs.writeFile(metadataPath, JSON.stringify(updated, null, 2));
  }

  /**
   * Get session metadata
   */
  static async getMetadata(sessionId: string): Promise<TestMetadata> {
    const sessionDir = this.getSessionDir(sessionId);
    const metadataPath = path.join(sessionDir, 'metadata.json');
    const content = await fs.readFile(metadataPath, 'utf-8');
    return JSON.parse(content) as TestMetadata;
  }

  /**
   * List all test sessions
   */
  static async listSessions(): Promise<string[]> {
    const sessionsDir = path.join(process.cwd(), 'test-sessions');

    try {
      const dirs = await fs.readdir(sessionsDir);
      return dirs.filter(d => !d.startsWith('.'));
    } catch {
      return [];
    }
  }

  /**
   * Delete a test session
   */
  static async deleteSession(sessionId: string): Promise<void> {
    const sessionDir = this.getSessionDir(sessionId);
    await fs.rm(sessionDir, { recursive: true, force: true });
  }
}
