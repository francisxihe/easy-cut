# 开发者文档

本文档面向第三方开发者，介绍如何为 Easy Cut 创建插件，以及如何参与项目开发。

## 📋 目录

- [插件开发](#插件开发)
- [项目开发](#项目开发)
- [API 参考](#api-参考)
- [最佳实践](#最佳实践)

## 插件开发

### 创建插件

创建插件非常简单，只需要使用以下目录结构：

```
my-awesome-plugin/
├── index.html          # 插件界面
└── config.json         # 插件配置
```

### 配置文件

`config.json` 文件需要包含以下内容：

```json
{
  "name": "MyAwesomePlugin",
  "file": "index.html",
  "type": "plugin",
  "height": 250,
  "width": 800,
  "description": "这是一个很棒的插件",
  "version": "1.0.0",
  "author": "Your Name"
}
```

#### 配置字段说明

| 字段          | 类型   | 必需 | 说明                                           |
| ------------- | ------ | ---- | ---------------------------------------------- |
| `name`        | string | ✅   | 插件名称，不能包含特殊字符，用作 JavaScript 键 |
| `file`        | string | ✅   | 插件的 HTML 文件名                             |
| `type`        | string | ❌   | 插件类型，当前未使用但为将来保留               |
| `height`      | number | ✅   | 插件窗口高度（像素）                           |
| `width`       | number | ✅   | 插件窗口宽度（像素）                           |
| `description` | string | ❌   | 插件描述                                       |
| `version`     | string | ❌   | 插件版本                                       |
| `author`      | string | ❌   | 插件作者                                       |

### 插件界面开发

`index.html` 文件是插件的主界面，可以使用标准的 HTML、CSS 和 JavaScript。

#### 基本模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>我的插件</title>
    <style>
      body {
        font-family:
          -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
        margin: 0;
        padding: 20px;
        background: #f5f5f5;
      }
      .container {
        max-width: 100%;
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      button {
        background: #007aff;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
      }
      button:hover {
        background: #0056cc;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>我的插件</h2>
      <p>这里是插件的内容</p>
      <button onclick="applyEffect()">应用效果</button>
    </div>

    <script>
      function applyEffect() {
        // 插件逻辑
        console.log("应用效果");

        // 与 Easy Cut 通信
        if (window.electronAPI) {
          window.electronAPI.applyFilter({
            type: "custom",
            name: "my-effect",
            params: {
              // 效果参数
            },
          });
        }
      }
    </script>
  </body>
</html>
```

### 与 Easy Cut 通信

插件可以通过 `window.electronAPI` 对象与 Easy Cut 主应用程序通信：

```javascript
// 应用滤镜
window.electronAPI.applyFilter({
  type: "filter",
  name: "blur",
  params: {
    sigma: 5,
  },
});

// 获取当前选中的片段信息
window.electronAPI.getCurrentClip().then((clip) => {
  console.log("当前片段:", clip);
});

// 显示通知
window.electronAPI.showNotification("操作完成！");
```

### 插件示例

#### 简单的模糊效果插件

```html
<!DOCTYPE html>
<html>
  <head>
    <title>模糊效果插件</title>
    <style>
      body {
        font-family: sans-serif;
        padding: 20px;
      }
      .control {
        margin: 10px 0;
      }
      label {
        display: inline-block;
        width: 100px;
      }
      input[type="range"] {
        width: 200px;
      }
    </style>
  </head>
  <body>
    <h3>模糊效果</h3>

    <div class="control">
      <label>模糊强度:</label>
      <input type="range" id="blurAmount" min="0" max="20" value="5" />
      <span id="blurValue">5</span>
    </div>

    <button onclick="applyBlur()">应用模糊</button>
    <button onclick="previewBlur()">预览</button>

    <script>
      const blurSlider = document.getElementById("blurAmount");
      const blurValue = document.getElementById("blurValue");

      blurSlider.addEventListener("input", () => {
        blurValue.textContent = blurSlider.value;
      });

      function applyBlur() {
        const sigma = parseInt(blurSlider.value);
        window.electronAPI.applyFilter({
          type: "filter",
          name: "gblur",
          params: {
            sigma: sigma,
          },
        });
      }

      function previewBlur() {
        const sigma = parseInt(blurSlider.value);
        window.electronAPI.previewFilter({
          type: "filter",
          name: "gblur",
          params: {
            sigma: sigma,
          },
        });
      }
    </script>
  </body>
</html>
```

对应的 `config.json`：

```json
{
  "name": "BlurEffect",
  "file": "index.html",
  "type": "plugin",
  "height": 200,
  "width": 400,
  "description": "为视频添加模糊效果",
  "version": "1.0.0",
  "author": "Easy Cut Team"
}
```

## 项目开发

### 开发环境设置

1. **克隆仓库**

   ```bash
   git clone https://github.com/your-username/easy-cut.git
   cd easy-cut
   ```

2. **安装依赖**

   ```bash
   pnpm install
   ```

3. **设置 FFmpeg**
   - 下载 FFmpeg 二进制文件
   - 放置在 `apps/electron-app/bin/darwin/` (macOS) 或 `apps/electron-app/bin/win64/` (Windows)

4. **启动开发环境**
   ```bash
   pnpm electron:dev
   ```

### 项目结构

```
easy-cut/
├── apps/
│   └── electron-app/              # 主 Electron 应用
│       ├── index.js               # 主进程入口
│       ├── html/                  # 渲染进程页面
│       ├── plugins.js             # 插件管理
│       ├── videoManager.js        # 视频处理
│       └── previewServer.js       # 预览服务器
├── packages/
│   └── shared/                    # 共享工具包
├── docs/                          # 文档
└── scripts/                       # 构建脚本
```

### 核心模块

#### 主进程 (Main Process)

- `index.js` - 应用程序入口，窗口管理
- `videoManager.js` - FFmpeg 视频处理逻辑
- `previewServer.js` - HTTP 预览服务器
- `plugins.js` - 插件系统管理

#### 渲染进程 (Renderer Process)

- `html/index.html` - 主界面
- `html/ui/ui.js` - 用户界面逻辑
- `html/timelineManager.js` - 时间轴管理
- `html/managers.js` - 各种管理器

### 添加新功能

1. **添加新的滤镜**

   ```javascript
   // 在 videoManager.js 中添加
   addCustomFilter(filterName, filterParams) {
       // 实现滤镜逻辑
   }
   ```

2. **添加新的 UI 组件**

   ```html
   <!-- 在 html/ui/ 目录下添加新的 HTML 文件 -->
   ```

3. **扩展 API**
   ```javascript
   // 在主进程中添加 IPC 处理
   ipcMain.handle("new-api-call", async (event, data) => {
     // 处理逻辑
   });
   ```

## API 参考

### 插件 API

#### `window.electronAPI.applyFilter(filterConfig)`

应用滤镜到当前选中的片段。

**参数:**

- `filterConfig` (Object): 滤镜配置
  - `type` (string): 滤镜类型
  - `name` (string): 滤镜名称
  - `params` (Object): 滤镜参数

**示例:**

```javascript
window.electronAPI.applyFilter({
  type: "filter",
  name: "scale",
  params: {
    width: 1920,
    height: 1080,
  },
});
```

#### `window.electronAPI.getCurrentClip()`

获取当前选中的片段信息。

**返回:** Promise<Object>

**示例:**

```javascript
const clip = await window.electronAPI.getCurrentClip();
console.log(clip.duration, clip.filename);
```

#### `window.electronAPI.showNotification(message)`

显示系统通知。

**参数:**

- `message` (string): 通知消息

### 内部 API

#### FFmpeg 滤镜

Easy Cut 支持所有 FFmpeg 滤镜。常用的包括：

- `scale` - 缩放视频
- `crop` - 裁剪视频
- `rotate` - 旋转视频
- `blur` - 模糊效果
- `drawtext` - 添加文字
- `overlay` - 叠加图层

详细列表请参考 [FFmpeg 滤镜文档](https://ffmpeg.org/ffmpeg-filters.html)。

## 最佳实践

### 插件开发

1. **性能优化**
   - 避免在插件中进行重量级计算
   - 使用防抖技术处理用户输入
   - 及时清理事件监听器

2. **用户体验**
   - 提供实时预览功能
   - 显示进度指示器
   - 提供撤销/重做功能

3. **错误处理**
   - 验证用户输入
   - 提供友好的错误消息
   - 记录调试信息

### 代码规范

1. **JavaScript**
   - 使用 ES6+ 语法
   - 遵循 ESLint 规则
   - 添加适当的注释

2. **HTML/CSS**
   - 语义化 HTML 结构
   - 响应式设计
   - 无障碍访问支持

3. **提交规范**
   - 使用语义化提交消息
   - 小而频繁的提交
   - 详细的 PR 描述

### 测试

1. **单元测试**

   ```bash
   pnpm test
   ```

2. **集成测试**

   ```bash
   pnpm test:integration
   ```

3. **手动测试**
   - 测试不同的视频格式
   - 验证跨平台兼容性
   - 检查内存泄漏

## 🚀 发布插件

1. **准备发布**
   - 完善文档
   - 添加示例
   - 测试兼容性

2. **发布渠道**
   - GitHub Releases
   - npm 包
   - 插件市场（计划中）

3. **版本管理**
   - 遵循语义化版本
   - 维护更新日志
   - 向后兼容

---

如果您在开发过程中遇到问题，欢迎：

- 查看 [GitHub Issues](https://github.com/your-username/easy-cut/issues)
- 参与 [Discussions](https://github.com/your-username/easy-cut/discussions)
- 提交 Pull Request
