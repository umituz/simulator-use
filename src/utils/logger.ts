import chalk from 'chalk';

export const logger = {
  success: (message: string) => {
    console.log(chalk.green('✅'), message);
  },

  error: (message: string) => {
    console.error(chalk.red('❌'), message);
  },

  warn: (message: string) => {
    console.warn(chalk.yellow('⚠️'), message);
  },

  info: (message: string) => {
    console.log(chalk.blue('ℹ️'), message);
  },

  device: (device: string) => {
    console.log(chalk.cyan('📱'), device);
  },

  command: (command: string) => {
    console.log(chalk.gray('$'), command);
  },

  header: (message: string) => {
    console.log(chalk.bold.white('\n' + message));
  },

  list: (items: string[]) => {
    items.forEach((item, index) => {
      console.log(chalk.gray(`  ${index + 1}.`), chalk.white(item));
    });
  }
};
