import * as dotenv from 'dotenv';
import { LLMConfig } from './types';

dotenv.config();

export function loadConfig(): LLMConfig {
  const provider = (process.env.LLM_PROVIDER || 'openai') as LLMConfig['provider'];

  const config: LLMConfig = {
    provider,
    apiKey: '',
  };

  switch (provider) {
    case 'openai':
      config.apiKey = process.env.OPENAI_API_KEY || '';
      config.model = process.env.OPENAI_MODEL || 'gpt-4';
      config.baseUrl = process.env.OPENAI_BASE_URL;
      break;

    case 'anthropic':
      config.apiKey = process.env.ANTHROPIC_API_KEY || '';
      config.model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
      break;

    case 'azure':
      config.apiKey = process.env.AZURE_API_KEY || '';
      config.endpoint = process.env.AZURE_ENDPOINT;
      config.deployment = process.env.AZURE_DEPLOYMENT;
      break;

    case 'gemini':
      config.apiKey = process.env.GEMINI_API_KEY || '';
      config.model = process.env.GEMINI_MODEL || 'gemini-pro';
      break;

    case 'deepseek':
      config.apiKey = process.env.DEEPSEEK_API_KEY || '';
      config.model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
      break;
  }

  if (!config.apiKey) {
    throw new Error(`未配置 ${provider.toUpperCase()} 的 API Key`);
  }

  return config;
}
