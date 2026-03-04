import { LLMConfig, CommitOptions } from '../types';

export abstract class LLMProvider {
  protected config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  abstract generateCommitMessage(diff: string, options: CommitOptions): Promise<string>;

  protected buildPrompt(diff: string, options: CommitOptions): string {
    const lang = options.lang === 'zh' ? '中文' : 'English';
    const maxLength = options.maxLength || 72;

    // 动态构建规范要求
    const conventionalSection = options.conventional
      ? `### 规范要求 (Conventional Commits)
使用 <type>(<scope>): <description> 格式。可选 type 包含：
- feat: 新功能
- fix: 修复 Bug
- docs: 文档变更
- style: 代码格式（不影响逻辑）
- refactor: 代码重构
- perf: 性能优化
- test: 测试相关
- chore: 构建过程或辅助工具的变动`
      : '### 风格要求：简洁明了，直接描述变更的核心目的。';

    return `
### 角色
你是一位拥有 10 年经验的资深软件工程师，擅长编写清晰、规范且具有高度可读性的 Git Commit 信息。

### 任务
请根据提供的 [Git Diff] 内容，撰写一条提交信息。

### 约束
1. **语言**：必须使用 ${lang}。
2. **长度**：首行标题严禁超过 ${maxLength} 个字符。
3. **内容**：
   - 重点描述“为什么要改”而不只是“改了什么”。
   - 避免模糊词汇（如 "update some files", "fix bugs"）。
4. **格式**：
   - **只返回 Commit 信息原文**。
   - 严禁包含任何解释、前导词（如 "Commit message:"）或 Markdown 代码块标识符。
${conventionalSection}

### [Git Diff]
\`\`\`diff
${diff}
\`\`\`

### 输出
(直接开始编写提交信息，无需任何开头)`.trim();
  }
}
