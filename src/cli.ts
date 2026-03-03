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
  .version('1.0.0');

// 主命令
program
  .command('generate', { isDefault: true })
  .description('生成并提交 commit 信息')
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

// 钩子命令 - 用于 prepare-commit-msg
program
  .command('hook')
  .description('Git 钩子模式 - 生成 commit 信息到文件')
  .argument('<commit-msg-file>', 'commit 信息文件路径')
  .option('-l, --lang <language>', '语言 (zh/en)', 'zh')
  .option('-m, --max-length <number>', '最大长度', '72')
  .option('-c, --conventional', '使用 Conventional Commits 规范', false)
  .action(async (commitMsgFile, options) => {
    try {
      const git = new GitService();
      const fs = await import('fs/promises');

      // 检查是否是 git 仓库
      if (!(await git.isGitRepository())) {
        process.exit(0); // 静默退出，不影响正常 commit
      }

      // 检查是否有暂存的更改
      if (!(await git.hasChanges())) {
        process.exit(0); // 没有更改，使用默认行为
      }

      // 检查文件是否已有内容（用户可能已经输入了 commit 信息）
      try {
        const existingContent = await fs.readFile(commitMsgFile, 'utf-8');
        const trimmedContent = existingContent.trim();
        // 如果已有非注释内容，不覆盖
        if (trimmedContent && !trimmedContent.startsWith('#')) {
          process.exit(0);
        }
      } catch (error) {
        // 文件不存在或读取失败，继续生成
      }

      // 获取 diff
      const diffData = await git.getStagedDiff();
      if (!diffData.diff) {
        process.exit(0);
      }

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

      // 写入到 commit 信息文件
      const content = `${commitMessage}

# AI 生成的 commit 信息
# 你可以编辑上面的内容，或者删除所有内容来取消使用 AI 生成的信息
# 变更的文件:
${diffData.files.map(f => `#   ${f}`).join('\n')}
`;

      await fs.writeFile(commitMsgFile, content, 'utf-8');
      process.exit(0);

    } catch (error) {
      // 钩子模式下静默失败，不影响正常 commit 流程
      console.error(chalk.yellow('⚠️  AI 生成失败，请手动输入 commit 信息'));
      process.exit(0);
    }
  });

// 安装钩子命令
program
  .command('install')
  .description('安装 Git 钩子到当前仓库')
  .action(async () => {
    try {
      const git = new GitService();
      const fs = await import('fs/promises');
      const path = await import('path');

      if (!(await git.isGitRepository())) {
        console.error(chalk.red('❌ 当前目录不是 Git 仓库'));
        process.exit(1);
      }

      const gitDir = await git.getGitDir();
      const hooksDir = path.join(gitDir, 'hooks');
      const hookFile = path.join(hooksDir, 'prepare-commit-msg');

      // 确保 hooks 目录存在
      await fs.mkdir(hooksDir, { recursive: true });

      // 钩子脚本内容
      const hookContent = `#!/bin/sh
# Commit Agent - AI 生成 commit 信息
# 自动安装于: ${new Date().toISOString()}

COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2

# 只在没有 commit source 时运行（即普通的 git commit）
# 不在 merge、squash、amend 等情况下运行
if [ -z "$COMMIT_SOURCE" ]; then
  commit-agent hook "$COMMIT_MSG_FILE"
fi
`;

      await fs.writeFile(hookFile, hookContent, { mode: 0o755 });
      console.log(chalk.green('✓ Git 钩子安装成功！'));
      console.log(chalk.gray(`  位置: ${hookFile}`));
      console.log();
      console.log(chalk.cyan('现在你可以直接使用 git commit，AI 会自动生成 commit 信息'));
      console.log(chalk.gray('提示: 你可以在编辑器中修改或删除生成的信息'));

    } catch (error) {
      console.error(chalk.red('❌ 安装失败:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// 卸载钩子命令
program
  .command('uninstall')
  .description('卸载 Git 钩子')
  .action(async () => {
    try {
      const git = new GitService();
      const fs = await import('fs/promises');
      const path = await import('path');

      if (!(await git.isGitRepository())) {
        console.error(chalk.red('❌ 当前目录不是 Git 仓库'));
        process.exit(1);
      }

      const gitDir = await git.getGitDir();
      const hookFile = path.join(gitDir, 'hooks', 'prepare-commit-msg');

      try {
        await fs.unlink(hookFile);
        console.log(chalk.green('✓ Git 钩子已卸载'));
      } catch (error) {
        console.log(chalk.yellow('⚠️  钩子文件不存在或已被删除'));
      }

    } catch (error) {
      console.error(chalk.red('❌ 卸载失败:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
