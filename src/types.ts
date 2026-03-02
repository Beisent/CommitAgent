export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'azure' | 'gemini' | 'deepseek';
  apiKey: string;
  model?: string;
  baseUrl?: string;
  endpoint?: string;
  deployment?: string;
}

export interface CommitOptions {
  lang?: 'zh' | 'en';
  maxLength?: number;
  conventional?: boolean;
}

export interface GitDiff {
  files: string[];
  additions: number;
  deletions: number;
  diff: string;
}
