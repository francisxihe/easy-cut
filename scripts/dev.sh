#!/bin/bash

# Easy Cut 开发脚本
echo "🚀 启动 Easy Cut 开发环境..."

# 检查 pnpm 是否安装
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm 未安装。请先安装 pnpm: npm install -g pnpm"
    exit 1
fi

# 检查 Node.js 版本
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js 版本过低。需要 Node.js >= 16.0.0"
    exit 1
fi

# 检查 FFmpeg 二进制文件
FFMPEG_DIR="apps/electron-app/bin"
if [ "$(uname)" == "Darwin" ]; then
    PLATFORM_DIR="$FFMPEG_DIR/darwin"
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ] || [ "$(expr substr $(uname -s) 1 10)" == "MINGW64_NT" ]; then
    PLATFORM_DIR="$FFMPEG_DIR/win64"
else
    echo "⚠️  未知平台，请手动配置 FFmpeg 二进制文件"
    PLATFORM_DIR="$FFMPEG_DIR/linux"
fi

if [ ! -f "$PLATFORM_DIR/ffmpeg" ] && [ ! -f "$PLATFORM_DIR/ffmpeg.exe" ]; then
    echo "⚠️  未找到 FFmpeg 二进制文件"
    echo "请将 ffmpeg 和 ffprobe 可执行文件放置在: $PLATFORM_DIR/"
    echo "你可以从 https://ffmpeg.org/download.html 下载"
fi

# 安装依赖
echo "📦 安装依赖..."
pnpm install

# 启动开发服务器
echo "🎬 启动 Electron 应用..."
pnpm electron:dev 