# Commit Agent

使用 AI 自动生成高质量 Git Commit 信息的 CLI 工具。

## 功能特性

- 🤖 支持多个 LLM 提供商（OpenAI、Anthropic、Azure、Gemini、DeepSeek）
- 📝 自动分析 git diff 生成符合规范的 commit 信息
- 🪝 支持 Git 钩子集成，无缝融入工作流
- ⚙️ 灵活的配置选项
- 🌍 支持中文和英文 commit 信息
- ✅ 用户可审查和修改 AI 生成的信息

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

### 方式一：Git 钩子（推荐）

安装 Git 钩子后，每次 `git commit` 时会自动生成 commit 信息：

```bash
# 安装钩子到当前仓库
commit-agent install

# 现在可以直接使用 git commit
git add .
git commit
# 编辑器会打开，显示 AI 生成的 commit 信息
# 你可以直接保存使用，或修改后保存，或删除全部内容取消使用

# 卸载钩子
commit-agent uninstall
```

### 方式二：命令行直接使用

在 git 仓库中运行：

```bash
# 生成并提交 commit 信息
commit-agent

# 指定语言
commit-agent --lang zh

# 使用 Conventional Commits 规范
commit-agent --conventional

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
