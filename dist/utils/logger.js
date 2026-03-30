import chalk from 'chalk';
export const logger = {
    success: (message) => {
        console.log(chalk.green('✅'), message);
    },
    error: (message) => {
        console.error(chalk.red('❌'), message);
    },
    warn: (message) => {
        console.warn(chalk.yellow('⚠️'), message);
    },
    info: (message) => {
        console.log(chalk.blue('ℹ️'), message);
    },
    device: (device) => {
        console.log(chalk.cyan('📱'), device);
    },
    command: (command) => {
        console.log(chalk.gray('$'), command);
    },
    header: (message) => {
        console.log(chalk.bold.white('\n' + message));
    },
    list: (items) => {
        items.forEach((item, index) => {
            console.log(chalk.gray(`  ${index + 1}.`), chalk.white(item));
        });
    }
};
//# sourceMappingURL=logger.js.map