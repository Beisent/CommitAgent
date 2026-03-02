#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { GitService } from './git';
import { loadConfig } from './config';
import { createProvider } from './providers';
import { CommitOptions } from './types';

const program = new Command();

program
  .name('commit-agent')
  .description('使用 AI 自动生成 Git Commit 信息')
  .version('1.0.0')
  .option('-l, --lang <language>', '语言 (zh/en)', 'zh')
  .option('-m, --max-length <number>', '最大长度', '72')
  .option('-c, --conventional', '使用 Conventional Commits 规范', false)
  .option('--no-confirm', '跳过确认直接提交', false)
  .action(async (options) => {
    try {
      const git = new GitService();

      // 检查是否是 git 仓库
      if (!(await git.isGitRepository())) {
        console.error(chalk.red('❌ 当前目录不是 Git 仓库'));
        process.exit(1);
      }

      // 检查是否有暂存的更改
      if (!(await git.hasChanges())) {
        console.error(chalk.yellow('⚠️  没有暂存的更改，请先使用 git add 添加文件'));
        process.exit(1);
      }

      // 获取 diff
      const spinner = ora('正在分析代码变更...').start();
      const diffData = await git.getStagedDiff();

      if (!diffData.diff) {
        spinner.fail('没有找到代码变更');
        process.exit(1);
      }

      spinner.text = '正在生成 commit 信息...';

      // 加载配置
      const config = loadConfig();
      const provider = createProvider(config);

      // 生成 commit 信息
      const commitOptions: CommitOptions = {
        lang: options.lang as 'zh' | 'en',
        maxLength: parseInt(options.maxLength),
        conventional: options.conventional
      };

      const commitMessage = await provider.generateCommitMessage(
        diffData.diff,
        commitOptions
      );

      spinner.succeed('Commit 信息生成成功！');

      console.log('\n' + chalk.cyan('生成的 Commit 信息:'));
      console.log(chalk.white('─'.repeat(50)));
      console.log(chalk.green(commitMessage));
      console.log(chalk.white('─'.repeat(50)) + '\n');

      console.log(chalk.gray('变更的文件:'));
      diffData.files.forEach(file => {
        console.log(chalk.gray(`  • ${file}`));
      });
      console.log();

      // 确认提交
      if (options.confirm !== false) {
        const { shouldCommit } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'shouldCommit',
            message: '是否使用此信息提交？',
            default: true
          }
        ]);

        if (!shouldCommit) {
          console.log(chalk.yellow('已取消提交'));
          process.exit(0);
        }
      }

      // 执行提交
      await git.commit(commitMessage);
      console.log(chalk.green('✓ 提交成功！'));

    } catch (error) {
      console.error(chalk.red('❌ 错误:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
