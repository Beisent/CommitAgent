import fetch from 'node-fetch';
import { LLMProvider } from './base';
import { CommitOptions } from '../types';

export class GeminiProvider extends LLMProvider {
  async generateCommitMessage(diff: string, options: CommitOptions): Promise<string> {
    const prompt = this.buildPrompt(diff, options);
    const model = this.config.model || 'gemini-pro';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API 错误: ${error}`);
    }

    const data = await response.json() as any;
    return data.candidates[0].content.parts[0].text.trim();
  }
}
