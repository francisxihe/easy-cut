# 贡献者指南

感谢您对 Easy Cut 项目的关注！我们欢迎所有形式的贡献，无论是代码、文档、bug 报告还是功能建议。

## 📋 目录

- [如何贡献](#如何贡献)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [测试指南](#测试指南)

## 如何贡献

### 🐛 报告 Bug

如果您发现了 bug，请：

1. 检查 [Issues](https://github.com/your-username/easy-cut/issues) 中是否已有相关报告
2. 如果没有，请创建新的 Issue，包含：
   - 清晰的标题和描述
   - 重现步骤
   - 期望的行为
   - 实际的行为
   - 系统信息（操作系统、Node.js 版本等）
   - 截图或视频（如果适用）

### 💡 功能建议

我们欢迎新功能的建议！请：

1. 检查是否已有类似的建议
2. 创建 Feature Request Issue，包含：
   - 功能描述
   - 使用场景
   - 可能的实现方案
   - 是否愿意参与开发

### 🔧 代码贡献

#### 准备工作

1. **Fork 仓库**

   ```bash
   # 在 GitHub 上 Fork 仓库，然后克隆
   git clone https://github.com/YOUR_USERNAME/easy-cut.git
   cd easy-cut
   ```

2. **设置开发环境**

   ```bash
   # 安装依赖
   pnpm install

   # 设置 FFmpeg（必需）
   # macOS: 将 ffmpeg 和 ffprobe 放在 apps/electron-app/bin/darwin/
   # Windows: 将 ffmpeg.exe 和 ffprobe.exe 放在 apps/electron-app/bin/win64/
   ```

3. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

#### 开发流程

1. **本地开发**

   ```bash
   # 启动开发环境
   pnpm electron:dev

   # 在另一个终端运行测试
   pnpm test
   ```

2. **代码检查**

   ```bash
   # 运行 linter
   pnpm lint

   # 自动修复格式问题
   pnpm lint:fix
   ```

3. **构建测试**

   ```bash
   # 构建项目
   pnpm build

   # 构建 Electron 应用
   pnpm electron:build
   ```

#### 提交更改

1. **提交代码**

   ```bash
   git add .
   git commit -m "feat: add new video filter"
   ```

2. **推送分支**

   ```bash
   git push origin feature/your-feature-name
   ```

3. **创建 Pull Request**
   - 在 GitHub 上创建 PR
   - 填写 PR 模板
   - 等待 Code Review

## 开发流程

### 分支策略

- `master` - 主分支，包含稳定的代码
- `develop` - 开发分支，包含最新的功能
- `feature/*` - 功能分支
- `fix/*` - 修复分支
- `hotfix/*` - 紧急修复分支

### 工作流程

1. 从 `develop` 分支创建功能分支
2. 在功能分支上开发
3. 完成后创建 PR 到 `develop`
4. Code Review 通过后合并
5. 定期从 `develop` 合并到 `master`

## 代码规范

### JavaScript

```javascript
// ✅ 好的示例
const videoManager = {
  async processVideo(inputPath, outputPath, filters = []) {
    try {
      const result = await this.applyFilters(inputPath, filters);
      await this.saveVideo(result, outputPath);
      return { success: true, path: outputPath };
    } catch (error) {
      console.error("视频处理失败:", error);
      throw new Error(`视频处理失败: ${error.message}`);
    }
  },

  applyFilters(inputPath, filters) {
    return filters.reduce((command, filter) => {
      return command.videoFilter(filter.name, filter.params);
    }, ffmpeg(inputPath));
  },
};

// ❌ 不好的示例
function processVideo(input, output, filters) {
  var result = applyFilters(input, filters);
  saveVideo(result, output);
  return output;
}
```

### HTML

```html
<!-- ✅ 好的示例 -->
<div class="video-controls">
  <button
    type="button"
    class="btn btn-primary"
    aria-label="播放视频"
    onclick="playVideo()"
  >
    <i class="icon-play" aria-hidden="true"></i>
    播放
  </button>
</div>

<!-- ❌ 不好的示例 -->
<div>
  <button onclick="playVideo()">播放</button>
</div>
```

### CSS

```css
/* ✅ 好的示例 */
.video-timeline {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.video-timeline__track {
  flex: 1;
  height: 4px;
  background-color: var(--color-gray-300);
  border-radius: 2px;
  position: relative;
}

/* ❌ 不好的示例 */
.timeline {
  padding: 10px;
  background: #f0f0f0;
}
.track {
  height: 4px;
  background: #ccc;
}
```

### 命名规范

- **文件名**: kebab-case (`video-manager.js`)
- **变量/函数**: camelCase (`videoManager`, `processVideo`)
- **常量**: UPPER_SNAKE_CASE (`MAX_VIDEO_SIZE`)
- **类名**: PascalCase (`VideoProcessor`)
- **CSS类**: BEM 或 kebab-case (`.video-timeline`, `.btn-primary`)

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 提交格式

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 提交类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式修改
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 示例

```bash
# 新功能
git commit -m "feat(video): add blur filter support"

# Bug 修复
git commit -m "fix(timeline): resolve clip positioning issue"

# 文档更新
git commit -m "docs: update plugin development guide"

# 重构
git commit -m "refactor(ui): simplify timeline component structure"

# 性能优化
git commit -m "perf(render): optimize video encoding process"
```

## 测试指南

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test video-manager.test.js

# 运行测试并查看覆盖率
pnpm test:coverage

# 监听模式运行测试
pnpm test:watch
```

### 编写测试

#### 单元测试示例

```javascript
// tests/video-manager.test.js
import { describe, it, expect, beforeEach } from "vitest";
import { VideoManager } from "../src/video-manager.js";

describe("VideoManager", () => {
  let videoManager;

  beforeEach(() => {
    videoManager = new VideoManager();
  });

  it("应该正确处理视频滤镜", async () => {
    const filters = [{ name: "scale", params: { width: 1920, height: 1080 } }];

    const result = await videoManager.applyFilters("input.mp4", filters);

    expect(result).toBeDefined();
    expect(result.filters).toHaveLength(1);
  });

  it("应该处理无效的滤镜参数", () => {
    expect(() => {
      videoManager.validateFilter({ name: "", params: null });
    }).toThrow("滤镜名称不能为空");
  });
});
```

#### 集成测试示例

```javascript
// tests/integration/plugin-system.test.js
import { describe, it, expect } from "vitest";
import { PluginManager } from "../src/plugin-manager.js";

describe("Plugin System Integration", () => {
  it("应该能够加载和执行插件", async () => {
    const pluginManager = new PluginManager();

    await pluginManager.loadPlugin("./test-fixtures/blur-plugin");
    const plugins = pluginManager.getLoadedPlugins();

    expect(plugins).toHaveLength(1);
    expect(plugins[0].name).toBe("BlurEffect");
  });
});
```

### 测试覆盖率要求

- 新功能的测试覆盖率应达到 80% 以上
- 核心模块的测试覆盖率应达到 90% 以上
- 所有公共 API 都应有对应的测试

## 📝 Pull Request 指南

### PR 标题

使用与提交信息相同的格式：

```
feat(video): add support for WebM format
fix(ui): resolve timeline scrolling issue
```

### PR 描述模板

```markdown
## 变更类型

- [ ] Bug 修复
- [ ] 新功能
- [ ] 重构
- [ ] 文档更新
- [ ] 性能优化

## 变更描述

简要描述此 PR 的变更内容...

## 相关 Issue

Closes #123

## 测试

- [ ] 已添加单元测试
- [ ] 已添加集成测试
- [ ] 已在本地测试
- [ ] 已在不同平台测试

## 截图/视频

如果涉及 UI 变更，请提供截图或视频

## 检查清单

- [ ] 代码遵循项目规范
- [ ] 已更新相关文档
- [ ] 测试覆盖率达标
- [ ] 无 linting 错误
```

### Code Review 流程

1. **自检**: 提交前自己 review 一遍代码
2. **自动检查**: CI 会自动运行测试和 linting
3. **人工 Review**: 至少需要一个维护者的 approval
4. **修改**: 根据 review 意见修改代码
5. **合并**: Review 通过后由维护者合并

## 🎯 贡献领域

我们特别欢迎以下领域的贡献：

### 核心功能

- 视频处理性能优化
- 新的滤镜效果
- 音频处理功能
- 导入/导出格式支持

### 用户界面

- UI/UX 改进
- 响应式设计
- 无障碍访问支持
- 国际化支持

### 插件系统

- 插件 API 扩展
- 示例插件
- 插件文档
- 插件市场

### 文档

- 用户指南完善
- API 文档
- 视频教程
- 翻译工作

### 测试

- 单元测试
- 集成测试
- 端到端测试
- 性能测试

## 🏆 贡献者认可

我们会在以下地方认可贡献者：

- README.md 中的贡献者列表
- 发布说明中的感谢
- 社交媒体宣传
- 贡献者专属徽章

## 📞 联系我们

如果您有任何问题，可以通过以下方式联系：

- 创建 [GitHub Issue](https://github.com/your-username/easy-cut/issues)
- 参与 [GitHub Discussions](https://github.com/your-username/easy-cut/discussions)
- 发送邮件到 [maintainers@easy-cut.dev](mailto:maintainers@easy-cut.dev)

---

再次感谢您对 Easy Cut 的贡献！每一个 PR、每一个 Issue、每一个建议都让这个项目变得更好。🚀
