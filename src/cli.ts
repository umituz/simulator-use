import { Command } from 'commander';
import * as listCmd from './commands/list.js';
import * as bootCmd from './commands/boot.js';
import * as shutdownCmd from './commands/shutdown.js';
import * as screenshotCmd from './commands/screenshot.js';
import * as launchCmd from './commands/launch.js';
import * as terminateCmd from './commands/terminate.js';
import * as openurlCmd from './commands/openurl.js';
import * as statusCmd from './commands/status.js';

export function createCLI(): Command {
  const program = new Command();

  program
    .name('simulator-use')
    .description('Browser-use for iOS simulators - Control iOS simulators from terminal')
    .version('0.1.0');

  // List command
  program
    .command('list')
    .description('List all available iOS simulators')
    .action(listCmd.list);

  // Boot command
  program
    .command('boot <device>')
    .description('Boot an iOS simulator')
    .action(bootCmd.boot);

  // Shutdown command
  program
    .command('shutdown <device>')
    .description('Shutdown an iOS simulator')
    .action(shutdownCmd.shutdown);

  // Screenshot command
  program
    .command('screenshot <path>')
    .description('Take a screenshot of the booted simulator')
    .action(screenshotCmd.screenshot);

  // Launch command
  program
    .command('launch <bundleId>')
    .description('Launch an app on the simulator')
    .action(launchCmd.launch);

  // Terminate command
  program
    .command('terminate <bundleId>')
    .description('Terminate a running app')
    .action(terminateCmd.terminate);

  // Open URL command
  program
    .command('openurl <url>')
    .description('Open a URL in Safari')
    .action(openurlCmd.openUrl);

  // Status command
  program
    .command('status')
    .description('Show current simulator status')
    .action(statusCmd.status);

  return program;
}
