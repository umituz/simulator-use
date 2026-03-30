/**
 * Navigation Framework
 * Step-by-step navigation and element interaction helpers
 */

import type { TestStep, TestStepDefinition } from '../types/testing.js';

/**
 * Navigator Class
 * Handles step-by-step navigation and element interaction
 */
export class Navigator {
  private steps: TestStep[] = [];
  private currentStepIndex = 0;

  /**
   * Load steps from definition
   */
  loadSteps(stepDefinitions: TestStepDefinition[]): void {
    this.steps = stepDefinitions.map((def, index) => ({
      stepNumber: index + 1,
      action: def.action,
      target: def.bundleId || def.url || JSON.stringify(def.coordinates || {}),
      expected: def.expected,
      status: 'pending',
      timestamp: new Date()
    }));
    this.currentStepIndex = 0;
  }

  /**
   * Get current step
   */
  getCurrentStep(): TestStep | null {
    if (this.currentStepIndex >= this.steps.length) return null;
    return this.steps[this.currentStepIndex];
  }

  /**
   * Move to next step
   */
  nextStep(): TestStep | null {
    this.currentStepIndex++;
    return this.getCurrentStep();
  }

  /**
   * Get all steps
   */
  getAllSteps(): TestStep[] {
    return this.steps;
  }

  /**
   * Get step by number
   */
  getStep(number: number): TestStep | null {
    return this.steps.find(s => s.stepNumber === number) || null;
  }

  /**
   * Mark step as passed
   */
  markStepPassed(stepNumber: number, actual?: string): void {
    const step = this.getStep(stepNumber);
    if (step) {
      step.status = 'passed';
      if (actual) step.actual = actual;
    }
  }

  /**
   * Mark step as failed
   */
  markStepFailed(stepNumber: number, error: string): void {
    const step = this.getStep(stepNumber);
    if (step) {
      step.status = 'failed';
      step.actual = `Error: ${error}`;
    }
  }

  /**
   * Mark step as in progress
   */
  markStepInProgress(stepNumber: number): void {
    const step = this.getStep(stepNumber);
    if (step) {
      step.status = 'in_progress';
    }
  }

  /**
   * Get progress
   */
  getProgress(): { completed: number; total: number; percentage: number } {
    const total = this.steps.length;
    const completed = this.steps.filter(s => s.status === 'passed').length;
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  /**
   * Reset navigation
   */
  reset(): void {
    this.steps.forEach(s => {
      s.status = 'pending';
    });
    this.currentStepIndex = 0;
  }
}

/**
 * Navigation Coordinator
 * Orchestrates navigation steps with simctl commands
 */
export class NavigationCoordinator {
  /**
   * Execute navigation step
   */
  static async executeStep(
    step: TestStepDefinition,
    simctl: any
  ): Promise<{ success: boolean; output: string; error?: string }> {
    try {
      switch (step.action) {
        case 'boot':
          if (step.bundleId) {
            await simctl.bootDevice(step.bundleId);
            return { success: true, output: `Booted ${step.bundleId}` };
          }
          break;

        case 'launch':
          if (step.bundleId) {
            await simctl.launch(step.bundleId);
            if (step.wait) {
              await this.delay(step.wait);
            }
            return { success: true, output: `Launched ${step.bundleId}` };
          }
          break;

        case 'terminate':
          if (step.bundleId) {
            await simctl.terminate(step.bundleId);
            return { success: true, output: `Terminated ${step.bundleId}` };
          }
          break;

        case 'screenshot':
          // Screenshot will be handled by caller
          return { success: true, output: 'Screenshot ready' };

        case 'openurl':
          if (step.url) {
            await simctl.openUrl(step.url);
            if (step.wait) {
              await this.delay(step.wait);
            }
            return { success: true, output: `Opened ${step.url}` };
          }
          break;

        case 'wait':
          if (step.wait) {
            await this.delay(step.wait);
            return { success: true, output: `Waited ${step.wait}ms` };
          }
          break;

        case 'tap':
          if (step.coordinates) {
            await simctl.tap(step.coordinates.x, step.coordinates.y);
            if (step.wait) {
              await this.delay(step.wait);
            }
            return { success: true, output: `Tapped at ${step.coordinates.x}, ${step.coordinates.y}` };
          }
          break;

        case 'swipe':
          if (step.coordinates && step.direction) {
            const { x, y } = step.coordinates;
            let x2 = x, y2 = y;

            // Calculate swipe end coordinates based on direction
            const distance = step.distance || 200;
            switch (step.direction) {
              case 'up':
                y2 = y - distance;
                break;
              case 'down':
                y2 = y + distance;
                break;
              case 'left':
                x2 = x - distance;
                break;
              case 'right':
                x2 = x + distance;
                break;
            }

            await simctl.swipe(x, y, x2, y2);
            if (step.wait) {
              await this.delay(step.wait);
            }
            return { success: true, output: `Swiped ${step.direction} from (${x}, ${y}) to (${x2}, ${y2})` };
          }
          break;

        case 'validate':
          // Validation will be handled by caller
          return { success: true, output: 'Validation ready' };

        default:
          return { success: false, output: '', error: `Unknown action: ${step.action}` };
      }

      return { success: false, output: '', error: 'Invalid step definition' };
    } catch (error: any) {
      return { success: false, output: '', error: error.message };
    }
  }

  /**
   * Delay helper
   */
  private static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate step result
   */
  static async validateStep(expected: string, actual: string): Promise<boolean> {
    // Simple validation for now - can be enhanced
    if (expected === 'screen_changed') {
      return true; // Assume success
    }
    return actual === expected;
  }
}

/**
 * Element Detection (Placeholder for Phase 2)
 */
export class ElementDetector {
  // Element detection will be implemented when we add tap/swipe support
  static async findElements(selector: string): Promise<any[]> {
    // Placeholder - will use OCR or image recognition in Phase 2
    return [];
  }
}
