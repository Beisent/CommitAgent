import fetch from 'node-fetch';
import { LLMProvider } from './base';
import { CommitOptions } from '../types';

export class DeepSeekProvider extends LLMProvider {
  async generateCommitMessage(diff: string, options: CommitOptions): Promise<string> {
    const prompt = this.buildPrompt(diff, options);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'deepseek-chat',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API 错误: ${error}`);
    }

    const data = await response.json() as any;
    return data.choices[0].message.content.trim();
  }
}
