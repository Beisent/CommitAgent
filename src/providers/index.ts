import { LLMConfig } from '../types';
import { LLMProvider } from './base';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { DeepSeekProvider } from './deepseek';
import { GeminiProvider } from './gemini';

export function createProvider(config: LLMConfig): LLMProvider {
  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'anthropic':
      return new AnthropicProvider(config);
    case 'deepseek':
      return new DeepSeekProvider(config);
    case 'gemini':
      return new GeminiProvider(config);
    case 'azure':
      // Azure 使用 OpenAI 兼容接口
      return new OpenAIProvider({
        ...config,
        baseUrl: config.endpoint
      });
    default:
      throw new Error(`不支持的 LLM 提供商: ${config.provider}`);
  }
}

export { LLMProvider } from './base';
