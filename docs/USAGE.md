# Commit Agent 使用指南

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置你的 API Key：

```bash
cp .env.example .env
```

编辑 `.env` 文件，选择一个 LLM 提供商并配置相应的 API Key：

```env
# 选择提供商
LLM_PROVIDER=openai

# 配置对应的 API Key
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4
```

### 3. 构建项目

```bash
npm run build
```

### 4. 全局安装（可选）

```bash
npm link
```

## 使用方法

### 方式一：Git 钩子模式（推荐）

安装 Git 钩子后，每次提交时自动生成 commit 信息：

```bash
# 安装钩子
commit-agent install

# 正常使用 git
git add .
git commit
# 编辑器会打开，显示 AI 生成的 commit 信息
# 你可以直接保存、修改或删除

# 卸载钩子
commit-agent uninstall
```

详细说明请查看 [Git 钩子使用指南](./HOOK_GUIDE.md)

### 方式二：命令行模式

```bash
# 在你的 git 项目中
git add .
commit-agent
```

### 命令选项

```bash
# 使用英文生成 commit 信息
commit-agent --lang en

# 使用 Conventional Commits 规范
commit-agent --conventional

# 限制最大长度
commit-agent --max-length 50

# 跳过确认直接提交
commit-agent --no-confirm

# 组合使用
commit-agent --lang zh --conventional --max-length 60
```

## 支持的 LLM 提供商

### OpenAI

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-xxx
OPENAI_MODEL=gpt-4
OPENAI_BASE_URL=https://api.openai.com/v1  # 可选，支持自定义端点
```

### Anthropic Claude

```env
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-xxx
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### Azure OpenAI

```env
LLM_PROVIDER=azure
AZURE_API_KEY=xxx
AZURE_ENDPOINT=https://your-resource.openai.azure.com
AZURE_DEPLOYMENT=your-deployment-name
```

### Google Gemini

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=xxx
GEMINI_MODEL=gemini-pro
```

### DeepSeek

```env
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-xxx
DEEPSEEK_MODEL=deepseek-chat
```

## 开发模式

```bash
# 使用 tsx 直接运行（无需构建）
npm run dev

# 或者
tsx src/cli.ts --lang zh
```

## 工作流程

1. 使用 `git add` 暂存你的更改
2. 运行 `commit-agent`
3. AI 会分析你的代码变更并生成 commit 信息
4. 确认后自动提交

## 示例

```bash
# 场景 1: 添加新功能
$ git add src/feature.ts
$ commit-agent --conventional
# 生成: feat: 添加用户认证功能

# 场景 2: 修复 bug
$ git add src/bugfix.ts
$ commit-agent --lang en
# 生成: fix: resolve null pointer exception in user service

# 场景 3: 更新文档
$ git add README.md
$ commit-agent
# 生成: docs: 更新安装说明
```

## 常见问题

### Q: 如何切换不同的 LLM 提供商？

A: 修改 `.env` 文件中的 `LLM_PROVIDER` 和对应的 API Key。

### Q: 生成的 commit 信息不满意怎么办？

A: 在确认提示时选择 "No"，然后可以手动编辑或重新运行。

### Q: 支持自定义 prompt 吗？

A: 当前版本使用内置 prompt，后续版本会支持自定义。

### Q: 可以在 CI/CD 中使用吗？

A: 可以，使用 `--no-confirm` 选项跳过交互式确认。

## License

MIT
