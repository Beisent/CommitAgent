import fetch from 'node-fetch';
import { LLMProvider } from './base';
import { CommitOptions } from '../types';

export class AnthropicProvider extends LLMProvider {
  async generateCommitMessage(diff: string, options: CommitOptions): Promise<string> {
    const prompt = this.buildPrompt(diff, options);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API 错误: ${error}`);
    }

    const data = await response.json() as any;
    return data.content[0].text.trim();
  }
}
