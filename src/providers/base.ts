import { LLMConfig, CommitOptions } from '../types';

export abstract class LLMProvider {
  protected config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  abstract generateCommitMessage(diff: string, options: CommitOptions): Promise<string>;

  protected buildPrompt(diff: string, options: CommitOptions): string {
    const lang = options.lang === 'zh' ? '中文' : '英文';
    const conventional = options.conventional ? '使用 Conventional Commits 规范（如 feat:, fix:, docs: 等）' : '';

    return `你是一个专业的 Git Commit 信息生成助手。请根据以下 git diff 内容生成一条简洁、清晰的 commit 信息。

要求：
1. 使用${lang}
2. ${conventional}
3. 简洁明了，不超过 ${options.maxLength || 72} 个字符
4. 准确描述代码变更的内容和目的
5. 只返回 commit 信息本身，不要有其他解释

Git Diff:
\`\`\`
${diff}
\`\`\`

请生成 commit 信息：`;
  }
}
