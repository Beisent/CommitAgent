# Git 钩子使用指南

## 什么是 Git 钩子模式？

Git 钩子模式允许 Commit Agent 集成到你的 Git 工作流中。当你执行 `git commit` 时，AI 会自动分析你的代码变更并生成 commit 信息，然后在编辑器中打开让你确认或修改。

## 安装钩子

在你的 Git 仓库中运行：

```bash
commit-agent install
```

这会在 `.git/hooks/` 目录下创建 `prepare-commit-msg` 钩子。

## 使用流程

1. **正常的 Git 工作流**
   ```bash
   git add .
   git commit
   ```

2. **AI 自动生成**
   - 钩子会自动触发
   - AI 分析你的代码变更
   - 生成符合规范的 commit 信息

3. **编辑器打开**
   - 你会看到 AI 生成的 commit 信息
   - 可以直接保存使用
   - 可以修改后保存
   - 可以删除全部内容，输入自己的信息
   - 可以关闭编辑器取消提交

## 示例

假设你修改了一些文件：

```bash
$ git add src/api.ts src/utils.ts
$ git commit
```

编辑器会打开，显示类似内容：

```
feat: 添加用户认证 API 和工具函数

实现了用户登录、注册接口，并添加了 token 验证工具函数

# AI 生成的 commit 信息
# 你可以编辑上面的内容，或者删除所有内容来取消使用 AI 生成的信息
# 变更的文件:
#   src/api.ts
#   src/utils.ts
```

## 配置选项

钩子会使用你的 `.env` 配置文件中的设置：

- `LLM_PROVIDER`: AI 提供商
- `LLM_MODEL`: 使用的模型
- `COMMIT_LANG`: commit 信息语言（zh/en）
- `COMMIT_MAX_LENGTH`: 最大长度
- `COMMIT_CONVENTIONAL`: 是否使用 Conventional Commits

## 何时不会触发

钩子在以下情况下不会运行，避免干扰正常流程：

- `git commit --amend` (修改上次提交)
- `git merge` (合并提交)
- `git revert` (回滚提交)
- `git commit -m "message"` (已提供信息时会被覆盖，建议不使用 -m)
- 没有暂存的文件

## 卸载钩子

如果不想使用钩子模式：

```bash
commit-agent uninstall
```

## 故障排除

### 钩子没有触发

1. 检查钩子文件是否存在：
   ```bash
   ls -la .git/hooks/prepare-commit-msg
   ```

2. 检查文件权限（Linux/Mac）：
   ```bash
   chmod +x .git/hooks/prepare-commit-msg
   ```

3. 重新安装：
   ```bash
   commit-agent uninstall
   commit-agent install
   ```

### AI 生成失败

如果 AI 生成失败，钩子会静默退出，你可以正常输入 commit 信息，不会影响提交流程。

检查配置：
- `.env` 文件是否存在
- API Key 是否正确
- 网络连接是否正常

## 与其他工具配合

### Commitizen

如果你使用 Commitizen，可以选择：
- 使用 Commit Agent 钩子（自动生成）
- 使用 Commitizen（交互式选择）
- 两者都安装，根据需要选择使用

### Husky

如果使用 Husky 管理钩子，可以在 Husky 的 `prepare-commit-msg` 中调用：

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

commit-agent hook "$1"
```

## 最佳实践

1. **先安装钩子，再开始工作**
   - 在克隆仓库后立即安装
   - 团队成员都安装，保持一致性

2. **审查 AI 生成的信息**
   - AI 生成的信息通常很好，但不是完美的
   - 根据实际情况调整
   - 确保信息准确描述了变更

3. **配置合适的语言和规范**
   - 团队统一使用中文或英文
   - 启用 Conventional Commits 保持规范

4. **小步提交**
   - 每次提交包含单一功能或修复
   - AI 更容易生成准确的描述
