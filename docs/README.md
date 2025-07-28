# Easy Cut - FFmpeg Video Editor

> 一个基于 JavaScript 和 FFmpeg 的简单视频编辑器

![主界面截图](https://i.imgur.com/ZKp3CaW.png)

## 📖 文档导航

- [用户指南](users.md) - 面向最终用户的使用指南
- [开发者文档](developers.md) - 第三方插件开发指南
- [贡献者指南](contributors.md) - 为项目贡献代码的指南
- [安装和运行](installation.md) - 安装和运行指南

## ✨ 主要特性

### 🎬 基于 FFmpeg 核心

本应用程序使用 FFmpeg——一个广泛使用的转码和视频处理软件套件，通过 fluent-ffmpeg 库进行调用。FFmpeg 也是开源的，自 2000 年以来一直在积极开发和改进。

### 🎨 简洁的编辑器

Easy Cut 为您提供简单的控件来完成最基本的编辑任务，如在时间轴中排列片段、剪切、拆分和定位。对于更高级的任务，如镜像图像或添加色调，提供了滤镜编辑器。

### 🔧 强大的滤镜系统

Easy Cut 使您能够使用 FFmpeg 支持的任何滤镜，这意味着您可以访问庞大的强大效果库，从为片段添加文本到高级视频稳定。

### 🔌 可扩展性

Easy Cut 现在支持第三方插件，从用户的角度来看，它们的功能就像内置的滤镜和文本编辑器一样。这使得开发者可以制作任何类型的编辑器，并轻松将其添加到 Easy Cut 中。

### 📖 完全开源

项目的源代码在 GitHub 上可用，它只使用开源库，如 fluent-ffmpeg、CHAP Links 等等。

### 👀 实时预览

通过项目的架构，很难实现电影的工作预览。当前的预览功能使您能够快速轻松地看到所选片段的外观，但是，它仍然有限。我们正在努力改进这个功能。

### 🌐 基于 HTML 的美观界面

用户界面使用 HTML 编写，应用程序使用 JavaScript——网络的语言。它运行在 Electron 中，这是让 Web 应用程序像本机应用程序一样运行的标准。

## 🚀 快速开始

### 前置要求

- Node.js >= 16.0.0
- pnpm >= 8.0.0
- FFmpeg 二进制文件

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/easy-cut.git
cd easy-cut

# 安装依赖
pnpm install

# 启动开发环境
pnpm electron:dev
```

### FFmpeg 设置

你需要提供自己的 ffmpeg 二进制文件用于运行和构建。从 FFmpeg 发行版下载 `ffmpeg` **和** `ffprobe` 可执行文件。两个可执行文件都是必需的。

将这些文件放置在 `apps/electron-app/bin/` 中与你的架构匹配的文件夹中：

- macOS: `apps/electron-app/bin/darwin/`
- Windows: `apps/electron-app/bin/win64/`

## 📁 项目结构

```
easy-cut/
├── apps/
│   └── electron-app/          # 主 Electron 应用
├── packages/
│   └── shared/                # 共享工具包
├── docs/                      # 文档
├── scripts/
│   └── dev.sh                 # 开发脚本
├── turbo.json                 # Turborepo 配置
├── pnpm-workspace.yaml        # pnpm workspace 配置
└── package.json               # 根 package.json
```

## 🤝 贡献

欢迎提交 Pull Request 和 Issue！请查看 [贡献者指南](contributors.md) 了解更多信息。

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](../LICENSE) 文件了解详情。

## 🔗 相关链接

- [GitHub 仓库](https://github.com/your-username/easy-cut)
- [问题反馈](https://github.com/your-username/easy-cut/issues)
- [发布页面](https://github.com/your-username/easy-cut/releases)
