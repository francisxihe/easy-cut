# Easy Cut Electron 应用

基于 Electron + React + Vite 的现代化视频编辑工具。

## 🚀 快速开始

### 开发环境启动

```bash
pnpm run electron:dev
```

这个命令会：

- 启动 Vite 开发服务器 (http://localhost:8200)
- 自动编译 Electron 主进程和预加载脚本
- 启动 Electron 应用并加载 React 界面
- 开启热重载和开发者工具

### 构建生产版本

```bash
pnpm run electron:build
```

## 📁 项目结构

```
apps/electron-app/
├── src/                    # React 应用源码
│   ├── App.tsx            # 主应用组件
│   ├── main.tsx           # React 入口
│   └── components/        # React 组件
├── electron/              # Electron 主进程
│   ├── main.ts           # 主进程入口
│   └── preload.ts        # 预加载脚本
├── public/               # 静态资源
├── dist-electron/        # Electron 编译输出
├── vite.config.ts        # Vite 配置
├── package.json          # 项目配置
└── index.html           # HTML 模板
```

## 🛠️ 技术栈

- **Electron** - 桌面应用框架
- **React 18** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 现代化构建工具
- **vite-plugin-electron** - Electron 集成插件

## 📝 脚本说明

- `pnpm run dev` - 仅启动 Vite 开发服务器
- `pnpm run electron:dev` - 启动完整的 Electron 开发环境
- `pnpm run build` - 构建 React 应用
- `pnpm run electron:build` - 构建完整的 Electron 应用

## 🔧 配置说明

### 环境要求

- Node.js 18+
- pnpm 包管理器

### 代理配置

如果您使用代理，启动脚本会自动处理本地开发环境的代理问题。

### 开发者工具

开发模式下会自动打开 Chrome DevTools 用于调试。

## ✅ 已解决的问题

1. **白屏问题** - 修复了 Electron 加载本地资源失败的问题
2. **代理冲突** - 解决了系统代理导致的本地连接问题
3. **环境检测** - 优化了开发/生产环境的自动检测
4. **热重载** - 确保开发时的实时更新功能正常工作

## 🎯 下一步开发

项目现在已经有了稳定的基础架构，可以开始开发具体的视频编辑功能：

1. 添加视频文件导入功能
2. 实现时间轴编辑器
3. 集成 FFmpeg 视频处理
4. 添加预览播放器
5. 实现导出功能

---

_最后更新：2025年7月1日_
