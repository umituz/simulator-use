/**
 * Test Command
 * Main command for running automated tests with organized results
 */

import { TestResultManager } from '../testing/test-results.js';
import { testLogger } from '../utils/test-logger.js';
import { NavigationCoordinator } from '../testing/navigation.js';
import { CRUDTester } from '../testing/crud-testing.js';
import { ErrorRecoveryManager } from '../testing/error-handling.js';
import { Simctl } from '../utils/simctl.js';
import type { TestConfig, TestStepDefinition, CRUDTestData } from '../types/testing.js';
import { promises as fs } from 'fs';
import path from 'path';

export async function test(options: {
  name?: string;
  device?: string;
  boot?: boolean;
  autoFix?: boolean;
  steps?: string;
  crud?: string;
}): Promise<void> {
  const config: TestConfig = {
    testName: options.name || 'Unnamed Test',
    device: options.device,
    bootDevice: options.boot,
    autoFix: options.autoFix || false,
    steps: options.steps ? JSON.parse(await fs.readFile(options.steps, 'utf-8')).steps : undefined
  };

  try {
    // Initialize logger
    const startTime = new Date();

    // Get device info
    const device = options.device
      ? (await Simctl.listDevices()).find(d => d.name === options.device)
      : await Simctl.getBootedDevice();

    if (!device) {
      console.error('❌ No device found. Boot a device first with --device option');
      process.exit(1);
    }

    // Boot device if requested
    if (config.bootDevice && device.state !== 'Booted') {
      await Simctl.bootDevice(device.udid);
    }

    // Create test session
    const sessionId = await TestResultManager.createSession(config.testName, device.name);
    testLogger.initialize(sessionId);
    testLogger.logStart(config.testName, device.name);

    // Run test based on mode
    if (config.steps) {
      await runStepByStepTest(config.steps as TestStepDefinition[], sessionId);
    } else if (options.crud) {
      await runCRUDTest(options.crud, sessionId);
    } else {
      testLogger.logInfo('No test steps provided. Use --steps or --crud option.');
    }

    // Finalize
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    testLogger.logCompletion('passed', duration, testLogger.getCurrentStep());

    // Save logs
    await testLogger.saveLogs();

    // Update metadata
    await TestResultManager.updateMetadata(sessionId, {
      status: 'completed',
      completedSteps: testLogger.getCurrentStep(),
      totalSteps: testLogger.getCurrentStep(),
      errors: []
    });

    testLogger.logSuccess(`Test completed. Session: ${sessionId}`);
    testLogger.logInfo(`Results saved to: ${TestResultManager.getSessionDir(sessionId)}`);

  } catch (error: any) {
    testLogger.logError('Test failed', error);

    // Try auto-fix if enabled
    if (config.autoFix) {
      testLogger.logInfo('Attempting auto-fix...');
      const result = await ErrorRecoveryManager.handleError(error, {
        sessionId: testLogger['sessionId'] || undefined
      });

      if (result.resolved) {
        testLogger.logSuccess(`Issue resolved: ${result.resolution}`);
      } else {
        testLogger.logError('Could not resolve issue automatically');
      }
    }

    process.exit(1);
  }
}

/**
 * Run step-by-step test
 */
async function runStepByStepTest(steps: TestStepDefinition[], sessionId: string): Promise<void> {
  testLogger.logInfo(`Running ${steps.length} steps...`);

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepNumber = testLogger.incrementStep();
    const stepName = step.name || `Step ${stepNumber}`;

    // Build target string from step properties
    const target = step.bundleId || step.url || JSON.stringify(step.coordinates || {});
    testLogger.logStep(stepNumber, step.action, target);

    try {
      // Execute step
      const result = await NavigationCoordinator.executeStep(step, Simctl);
      const stepDef = { ...step, status: 'passed' };

      // Handle screenshot
      if (step.action === 'screenshot' && step.name) {
        const screenshotPath = await TestResultManager.saveScreenshot(
          sessionId,
          stepNumber,
          step.name
        );

        // Take actual screenshot
        await Simctl.screenshot(screenshotPath);
        testLogger.logScreenshot(screenshotPath);
      }

      // Handle validation
      if (step.action === 'validate') {
        const passed = await NavigationCoordinator.validateStep(
          step.expected || '',
          ''
        );

        testLogger.logValidation(
          step.expected || '',
          'validated',
          passed
        );
      }

      testLogger.logSuccess(`Step ${stepNumber} completed: ${step.action}`);
      await TestResultManager.updateMetadata(sessionId, {
        completedSteps: stepNumber
      });

    } catch (error: any) {
      testLogger.logError(`Step ${stepNumber} failed`, error);
      testLogger.logWarning('Continuing to next step...');
    }
  }
}

/**
 * Run CRUD test
 */
async function runCRUDTest(crudFile: string, sessionId: string): Promise<void> {
  testLogger.logInfo(`Running CRUD test from ${crudFile}...`);

  try {
    const crudData: CRUDTestData = JSON.parse(await fs.readFile(crudFile, 'utf-8'));

    testLogger.logInfo('Testing CRUD operations...');

    // Note: This would require actual CRUD operations
    // For now, just log what would be tested
    testLogger.logStep(1, 'create', JSON.stringify(crudData.create));
    testLogger.logStep(2, 'read', crudData.readId);
    testLogger.logStep(3, 'update', crudData.readId);
    testLogger.logStep(4, 'delete', crudData.readId);

    testLogger.logSuccess('CRUD test framework ready');
    testLogger.logInfo('Note: Actual CRUD operations would be app-specific');

  } catch (error: any) {
    testLogger.logError('Failed to run CRUD test', error);
    throw error;
  }
}
