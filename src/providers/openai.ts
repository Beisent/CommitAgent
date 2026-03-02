import fetch from 'node-fetch';
import { LLMProvider } from './base';
import { CommitOptions } from '../types';

export class OpenAIProvider extends LLMProvider {
  async generateCommitMessage(diff: string, options: CommitOptions): Promise<string> {
    const prompt = this.buildPrompt(diff, options);
    const baseUrl = this.config.baseUrl || 'https://api.openai.com/v1';

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API 错误: ${error}`);
    }

    const data = await response.json() as any;
    return data.choices[0].message.content.trim();
  }
}
