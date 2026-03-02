# Commit Agent

使用 AI 自动生成高质量 Git Commit 信息的 CLI 工具。

## 功能特性

- 🤖 支持多个 LLM 提供商（OpenAI、Anthropic、Azure、Gemini、DeepSeek）
- 📝 自动分析 git diff 生成符合规范的 commit 信息
- ⚙️ 灵活的配置选项
- 🌍 支持中文和英文 commit 信息

## 安装

```bash
npm install
npm run build
npm link
```

## 配置

1. 复制 `.env.example` 为 `.env`
2. 配置你的 API Key 和提供商

```bash
cp .env.example .env
```

## 使用

在 git 仓库中运行：

```bash
# 生成 commit 信息
commit-agent

# 指定语言
commit-agent --lang zh

# 查看帮助
commit-agent --help
```

## 支持的 LLM 提供商

- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Azure OpenAI
- Google Gemini
- DeepSeek

## License

MIT
