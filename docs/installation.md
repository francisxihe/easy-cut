# 安装和运行指南

本指南将帮助您在不同的操作系统上安装和运行 Easy Cut。

## 📋 目录

- [系统要求](#系统要求)
- [快速安装](#快速安装)
- [详细安装步骤](#详细安装步骤)
- [FFmpeg 设置](#ffmpeg-设置)
- [常见问题](#常见问题)
- [故障排除](#故障排除)

## 系统要求

### 最低要求

- **操作系统**: Windows 10+, macOS 10.14+, Linux (Ubuntu 18.04+)
- **Node.js**: 16.0.0 或更高版本
- **内存**: 4GB RAM
- **存储**: 2GB 可用空间
- **显卡**: 支持硬件加速的显卡（推荐）

### 推荐配置

- **操作系统**: Windows 11, macOS 12+, Linux (Ubuntu 20.04+)
- **Node.js**: 18.0.0 或更高版本
- **内存**: 8GB RAM 或更多
- **存储**: 10GB 可用空间（用于临时文件）
- **显卡**: 独立显卡
- **CPU**: 多核处理器

## 快速安装

### 使用安装脚本（推荐）

```bash
# 下载并运行安装脚本
curl -fsSL https://get.easy-cut.dev | bash

# 或者使用 wget
wget -qO- https://get.easy-cut.dev | bash
```

### 手动安装

```bash
# 1. 克隆仓库
git clone https://github.com/your-username/easy-cut.git
cd easy-cut

# 2. 安装依赖
pnpm install

# 3. 运行开发脚本
./scripts/dev.sh
```

## 详细安装步骤

### 1. 安装 Node.js 和 pnpm

#### Windows

**选项 A: 使用官方安装器**

1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 LTS 版本
3. 运行安装器并按照提示安装

**选项 B: 使用 Chocolatey**

```powershell
# 安装 Chocolatey（如果未安装）
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安装 Node.js
choco install nodejs

# 安装 pnpm
npm install -g pnpm
```

#### macOS

**选项 A: 使用官方安装器**

1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 LTS 版本
3. 运行 .pkg 文件并安装

**选项 B: 使用 Homebrew**

```bash
# 安装 Homebrew（如果未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js
brew install node

# 安装 pnpm
npm install -g pnpm
```

#### Linux (Ubuntu/Debian)

```bash
# 更新包列表
sudo apt update

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 pnpm
npm install -g pnpm
```

#### Linux (CentOS/RHEL/Fedora)

```bash
# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Fedora
sudo dnf install npm nodejs

# 安装 pnpm
npm install -g pnpm
```

### 2. 克隆项目

```bash
# 使用 HTTPS
git clone https://github.com/your-username/easy-cut.git

# 或使用 SSH（需要配置 SSH 密钥）
git clone git@github.com:your-username/easy-cut.git

# 进入项目目录
cd easy-cut
```

### 3. 安装项目依赖

```bash
# 安装所有依赖
pnpm install

# 如果遇到权限问题（Linux/macOS）
sudo pnpm install
```

### 4. 验证安装

```bash
# 检查 Node.js 版本
node --version

# 检查 pnpm 版本
pnpm --version

# 检查项目依赖
pnpm list
```

## FFmpeg 设置

Easy Cut 需要 FFmpeg 来处理视频文件。您需要下载并配置 FFmpeg 二进制文件。

### 自动下载（推荐）

```bash
# 运行 FFmpeg 设置脚本
pnpm run setup:ffmpeg

# 或者手动运行
node scripts/setup-ffmpeg.js
```

### 手动安装

#### Windows

1. **下载 FFmpeg**
   - 访问 [FFmpeg 官网](https://ffmpeg.org/download.html#build-windows)
   - 下载 Windows 版本的 FFmpeg
   - 或者使用 [gyan.dev](https://www.gyan.dev/ffmpeg/builds/) 的预构建版本

2. **解压和配置**
   ```powershell
   # 解压下载的文件
   # 将 ffmpeg.exe 和 ffprobe.exe 复制到项目目录
   mkdir apps\electron-app\bin\win64
   copy ffmpeg.exe apps\electron-app\bin\win64\
   copy ffprobe.exe apps\electron-app\bin\win64\
   ```

#### macOS

1. **使用 Homebrew（推荐）**

   ```bash
   # 安装 FFmpeg
   brew install ffmpeg

   # 复制二进制文件到项目目录
   mkdir -p apps/electron-app/bin/darwin
   cp $(which ffmpeg) apps/electron-app/bin/darwin/
   cp $(which ffprobe) apps/electron-app/bin/darwin/
   ```

2. **手动下载**
   - 访问 [FFmpeg 官网](https://ffmpeg.org/download.html#build-mac)
   - 下载 macOS 版本
   - 解压并复制到 `apps/electron-app/bin/darwin/`

#### Linux

1. **使用包管理器（推荐）**

   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install ffmpeg

   # CentOS/RHEL
   sudo yum install epel-release
   sudo yum install ffmpeg ffmpeg-devel

   # Fedora
   sudo dnf install ffmpeg

   # 复制二进制文件
   mkdir -p apps/electron-app/bin/linux
   cp $(which ffmpeg) apps/electron-app/bin/linux/
   cp $(which ffprobe) apps/electron-app/bin/linux/
   ```

2. **从源码编译**

   ```bash
   # 下载源码
   git clone https://git.ffmpeg.org/ffmpeg.git ffmpeg
   cd ffmpeg

   # 配置和编译
   ./configure --enable-gpl --enable-libx264 --enable-libx265
   make -j$(nproc)
   sudo make install
   ```

### 验证 FFmpeg 安装

```bash
# 检查 FFmpeg 是否正确安装
pnpm run check:ffmpeg

# 或者手动检查
# Windows
apps\electron-app\bin\win64\ffmpeg.exe -version

# macOS/Linux
apps/electron-app/bin/darwin/ffmpeg -version
```

## 运行应用

### 开发模式

```bash
# 启动开发环境
pnpm electron:dev

# 或者使用开发脚本（包含环境检查）
./scripts/dev.sh
```

### 生产构建

```bash
# 构建应用
pnpm build

# 构建 Electron 应用
pnpm electron:build

# 构建特定平台
pnpm electron:build --win
pnpm electron:build --mac
pnpm electron:build --linux
```

## 常见问题

### Q: 安装依赖时出现权限错误

**A: 解决方案**

```bash
# 方法 1: 使用 sudo（Linux/macOS）
sudo pnpm install

# 方法 2: 修改 npm 全局目录权限
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 方法 3: 使用 nvm 管理 Node.js 版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### Q: FFmpeg 无法找到或版本不兼容

**A: 解决方案**

```bash
# 检查 FFmpeg 版本
ffmpeg -version

# 确保版本 >= 4.0
# 如果版本过低，重新安装最新版本

# 检查路径配置
echo $PATH

# 手动指定 FFmpeg 路径
export FFMPEG_PATH=/path/to/ffmpeg
export FFPROBE_PATH=/path/to/ffprobe
```

### Q: 应用启动后显示黑屏

**A: 解决方案**

1. 检查 Electron 版本兼容性
2. 清除缓存并重新安装
   ```bash
   rm -rf node_modules
   rm pnpm-lock.yaml
   pnpm install
   ```
3. 检查显卡驱动是否最新
4. 尝试禁用硬件加速
   ```bash
   pnpm electron:dev --disable-gpu
   ```

### Q: 视频处理速度很慢

**A: 优化建议**

1. 确保使用 SSD 硬盘
2. 增加内存分配
3. 使用硬件加速
4. 关闭不必要的后台程序
5. 调整视频质量设置

### Q: 导出的视频质量不佳

**A: 解决方案**

1. 检查导出设置中的质量参数
2. 确保源视频质量足够
3. 调整编码器设置
4. 使用更高的比特率

## 故障排除

### 收集调试信息

```bash
# 启用调试模式
DEBUG_MODE=1 pnpm electron:dev

# 查看详细日志
pnpm electron:dev --verbose

# 检查系统信息
node -e "console.log(process.platform, process.arch, process.version)"
```

### 常见错误代码

| 错误代码 | 描述             | 解决方案                             |
| -------- | ---------------- | ------------------------------------ |
| `ENOENT` | 文件或目录不存在 | 检查文件路径，确保 FFmpeg 已正确安装 |
| `EACCES` | 权限不足         | 使用 `sudo` 或修改文件权限           |
| `EMFILE` | 打开文件过多     | 增加系统文件描述符限制               |
| `ENOMEM` | 内存不足         | 关闭其他程序或增加内存               |

### 重置应用

如果遇到无法解决的问题，可以尝试完全重置：

```bash
# 清除所有缓存和依赖
rm -rf node_modules
rm -rf apps/electron-app/node_modules
rm -rf .turbo
rm pnpm-lock.yaml

# 重新安装
pnpm install

# 重新设置 FFmpeg
pnpm run setup:ffmpeg
```

## 📞 获取帮助

如果您在安装过程中遇到问题，可以：

1. 查看 [GitHub Issues](https://github.com/your-username/easy-cut/issues)
2. 搜索已知问题和解决方案
3. 创建新的 Issue 并提供详细信息：
   - 操作系统和版本
   - Node.js 和 pnpm 版本
   - 错误信息和日志
   - 重现步骤

4. 参与 [GitHub Discussions](https://github.com/your-username/easy-cut/discussions)
5. 查看 [Wiki](https://github.com/your-username/easy-cut/wiki) 中的更多资源

---

安装成功后，您可以查看 [用户指南](users.md) 了解如何使用 Easy Cut 的各种功能。
