/**
 * Testing Framework Types
 */

/**
 * Test Session Information
 */
export interface TestSession {
  sessionId: string;
  startTime: Date;
  testName: string;
  baseDir: string;
  screenshots: string[];
  logs: string[];
  metadata: TestMetadata;
}

/**
 * Test Metadata
 */
export interface TestMetadata {
  deviceName: string;
  deviceUDID: string;
  iosVersion: string;
  status: 'created' | 'running' | 'completed' | 'failed';
  totalSteps: number;
  completedSteps: number;
  errors: TestError[];
}

/**
 * Test Error
 */
export interface TestError {
  step: string;
  error: string;
  timestamp: Date;
  resolved: boolean;
}

/**
 * Test Step
 */
export interface TestStep {
  stepNumber: number;
  action: string;
  target: string;
  expected?: string;
  actual?: string;
  status: 'pending' | 'in_progress' | 'passed' | 'failed' | 'skipped';
  timestamp: Date;
  duration?: number;
  screenshot?: string;
}

/**
 * Test Result
 */
export interface TestResult {
  sessionId: string;
  testName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: 'passed' | 'failed';
  steps: TestStep[];
  screenshots: string[];
  logs: string[];
  errors: TestError[];
}

/**
 * Test Configuration
 */
export interface TestConfig {
  testName: string;
  device?: string;
  bootDevice?: boolean;
  autoFix?: boolean;
  steps?: TestStepDefinition[];
}

/**
 * Test Step Definition
 */
export interface TestStepDefinition {
  action: 'boot' | 'shutdown' | 'launch' | 'terminate' | 'screenshot' | 'openurl' | 'tap' | 'swipe' | 'wait' | 'validate';
  bundleId?: string;
  url?: string;
  coordinates?: { x: number; y: number };
  wait?: number;
  name?: string;
  expected?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

/**
 * CRUD Test Data
 */
export interface CRUDTestData {
  create: any;
  readId: string;
  update: any;
  expectedRead: any;
  expectedUpdate?: any;
}
