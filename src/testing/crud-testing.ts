/**
 * CRUD Testing Framework
 * Testing Create, Read, Update, Delete operations
 */

import type { TestResult, TestError, CRUDTestData } from '../types/testing.js';

/**
 * CRUD Tester
 * Tests CRUD operations with validation
 */
export class CRUDTester {
  private errors: TestError[] = [];

  /**
   * Test Create operation
   */
  static async testCreate(
    data: any,
    expected: any,
    createFn: (data: any) => Promise<any>
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      const result = await createFn(data);

      // Validate
      if (expected) {
        const passed = this.validateResult(result, expected);
        if (!passed) {
          return {
            success: false,
            error: `Create validation failed. Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(result)}`
          };
        }
      }

      return { success: true, result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Test Read operation
   */
  static async testRead(
    id: string,
    expected: any,
    readFn: (id: string) => Promise<any>
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      const result = await readFn(id);

      // Validate
      if (expected) {
        const passed = this.validateResult(result, expected);
        if (!passed) {
          return {
            success: false,
            error: `Read validation failed. Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(result)}`
          };
        }
      }

      return { success: true, result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Test Update operation
   */
  static async testUpdate(
    id: string,
    data: any,
    expected: any,
    updateFn: (id: string, data: any) => Promise<any>
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    try {
      const result = await updateFn(id, data);

      // Validate
      if (expected) {
        const passed = this.validateResult(result, expected);
        if (!passed) {
          return {
            success: false,
            error: `Update validation failed. Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(result)}`
          };
        }
      }

      return { success: true, result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Test Delete operation
   */
  static async testDelete(
    id: string,
    deleteFn: (id: string) => Promise<void>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await deleteFn(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Run full CRUD test suite
   */
  static async testCRUDSuite(
    testData: CRUDTestData,
    operations: {
      createFn: (data: any) => Promise<any>;
      readFn: (id: string) => Promise<any>;
      updateFn: (id: string, data: any) => Promise<any>;
      deleteFn: (id: string) => Promise<void>;
    }
  ): Promise<TestResult> {
    const startTime = new Date();
    const errors: TestError[] = [];
    const steps: any[] = [];

    // Create
    const createResult = await this.testCreate(testData.create, testData.expectedRead, operations.createFn);
    steps.push({
      action: 'create',
      target: JSON.stringify(testData.create),
      status: createResult.success ? 'passed' : 'failed'
    });
    if (!createResult.success) {
      errors.push({
        step: 'create',
        error: createResult.error || 'Unknown error',
        timestamp: new Date(),
        resolved: false
      });
    }

    // Read
    const readResult = await this.testRead(testData.readId, testData.expectedRead, operations.readFn);
    steps.push({
      action: 'read',
      target: testData.readId,
      status: readResult.success ? 'passed' : 'failed'
    });
    if (!readResult.success) {
      errors.push({
        step: 'read',
        error: readResult.error || 'Unknown error',
        timestamp: new Date(),
        resolved: false
      });
    }

    // Update
    const updateResult = await this.testUpdate(testData.readId, testData.update, testData.expectedUpdate, operations.updateFn);
    steps.push({
      action: 'update',
      target: `${testData.readId} with ${JSON.stringify(testData.update)}`,
      status: updateResult.success ? 'passed' : 'failed'
    });
    if (!updateResult.success) {
      errors.push({
        step: 'update',
        error: updateResult.error || 'Unknown error',
        timestamp: new Date(),
        resolved: false
      });
    }

    // Delete
    const deleteResult = await this.testDelete(testData.readId, operations.deleteFn);
    steps.push({
      action: 'delete',
      target: testData.readId,
      status: deleteResult.success ? 'passed' : 'failed'
    });
    if (!deleteResult.success) {
      errors.push({
        step: 'delete',
        error: deleteResult.error || 'Unknown error',
        timestamp: new Date(),
        resolved: false
      });
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    return {
      sessionId: 'crud-suite',
      testName: 'CRUD Test Suite',
      startTime,
      endTime,
      duration,
      status: errors.length === 0 ? 'passed' : 'failed',
      steps: [],
      screenshots: [],
      logs: [],
      errors
    };
  }

  /**
   * Validate result against expected
   */
  private static validateResult(result: any, expected: any): boolean {
    if (typeof expected === 'object' && typeof result === 'object') {
      return JSON.stringify(result) === JSON.stringify(expected);
    }
    return result === expected;
  }
}

/**
 * Assertion Helper
 */
export class Assertions {
  static assertEquals(actual: any, expected: any, message: string): void {
    const passed = actual === expected;
    if (!passed) {
      throw new Error(`${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
    }
  }

  static assertTrue(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(message);
    }
  }

  static assertContains(haystack: any, needle: any, message: string): void {
    const haystackStr = JSON.stringify(haystack);
    const needleStr = JSON.stringify(needle);
    if (!haystackStr.includes(needleStr)) {
      throw new Error(`${message}\nNeedle not found in haystack`);
    }
  }

  static async assertVisible(element: any): Promise<void> {
    // Placeholder for Phase 2 when we add element detection
    // For now, just log the assertion
    console.log(`  🔍 Checking visibility of element: ${JSON.stringify(element)}`);
  }
}
