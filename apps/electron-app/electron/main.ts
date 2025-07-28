import { app, BrowserWindow, ipcMain, dialog, protocol } from "electron";
import { join, extname } from "path";
import { pathToFileURL } from "url";
import os from "os";
import fs from "fs";
import http from "http";

// 导入业务模块
const VideoManager = require("../videoManager.js");
const PluginManager = require("../plugins.js");
const PreviewServer = require("../previewServer.js");

// 使用多种方式检测开发环境
const isDev =
  process.env.NODE_ENV === "development" ||
  process.env.ELECTRON_RENDERER_URL ||
  !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
let vidManager: any;
let pluginMan: any;
let server: any;
let fileServer: http.Server | null = null;
const FILE_SERVER_PORT = 8765;

// 获取文件MIME类型
function getMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    '.webm': 'video/webm',
    '.flv': 'video/x-flv',
    '.wmv': 'video/x-ms-wmv',
    '.m4v': 'video/mp4',
    '.3gp': 'video/3gpp',
    '.ogv': 'video/ogg',
  };
  return mimeMap[ext] || 'video/mp4'; // 默认为mp4而不是octet-stream
}

// 初始化业务模块
function initializeBusinessModules() {
  const appPath = app.getAppPath().replace("app.asar", "app.asar.unpacked");
  const workdir = app.getPath("userData");
  const masterDir = join(workdir, "master");

  // 确保工作目录存在
  if (!fs.existsSync(masterDir)) {
    if (!fs.existsSync(workdir)) fs.mkdirSync(workdir);
    fs.mkdirSync(masterDir);
  }

  // 启动文件服务器
  startFileServer();

  // 初始化视频管理器
  try {
    if (os.platform() === "darwin") {
      vidManager = new VideoManager(
        join(appPath, "bin/darwin/ffmpeg"),
        join(appPath, "bin/darwin/ffprobe"),
        workdir,
      );
    } else if (os.platform() === "win32" && os.arch() === "x64") {
      vidManager = new VideoManager(
        join(appPath, "bin/win64/ffmpeg.exe"),
        join(appPath, "bin/win64/ffprobe.exe"),
        workdir,
      );
    } else {
      throw new Error(
        "This platform or architecture is currently not supported.",
      );
    }
  } catch (err: any) {
    dialog.showErrorBox("Error while creating ffmpeg handler:", err.message);
    app.exit(1);
  }

  // 设置默认渲染方案
  vidManager.scheme = {
    size: "1280x720",
    format: ".mp4",
    codec: "libx264",
    bitrate: 1000,
    fps: 24,
    pad: true,
  };

  // 初始化插件管理器
  pluginMan = new PluginManager();

  // 初始化预览服务器
  server = new PreviewServer(vidManager);
}

// 启动文件服务器
function startFileServer() {
  fileServer = http.createServer((req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    // 解析请求URL，提取文件路径
    const url = new URL(req.url!, `http://localhost:${FILE_SERVER_PORT}`);
    let filePath = decodeURIComponent(url.pathname.substring(1)); // 移除开头的 '/'
    
    // 在Unix-like系统上，确保路径以斜杠开头
    if (process.platform !== 'win32' && !filePath.startsWith('/')) {
      filePath = '/' + filePath;
    }
    
    console.log("File server request:", filePath);

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      });
      res.end('File not found');
      return;
    }

    const stat = fs.statSync(filePath);
    const mimeType = getMimeType(filePath);
    
    // 支持范围请求（用于视频流）
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = (end - start) + 1;
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mimeType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      });
      
      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stat.size,
        'Content-Type': mimeType,
        'Access-Control-Allow-Origin': '*',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache',
      });
      
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    }
  });

  fileServer.listen(FILE_SERVER_PORT, () => {
    console.log(`File server started on port ${FILE_SERVER_PORT}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, "preload.js"),
      webSecurity: false, // 允许加载本地文件
      experimentalFeatures: true, // 启用实验性功能
      allowRunningInsecureContent: true,
      backgroundThrottling: false, // 禁用后台节流
      offscreen: false, // 确保不是离屏渲染
    },
  });

  console.log("环境检测:", {
    NODE_ENV: process.env.NODE_ENV,
    ELECTRON_RENDERER_URL: process.env.ELECTRON_RENDERER_URL,
    isPackaged: app.isPackaged,
    isDev: isDev,
  });

  if (isDev) {
    const devUrl = "http://localhost:8200";
    console.log("开发模式：加载", devUrl);
    mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools();
  } else {
    console.log("生产模式：加载本地文件");
    mainWindow.loadFile(join(__dirname, "../dist/index.html"));
  }

  // 设置插件管理器的主窗口引用
  if (pluginMan) {
    pluginMan.mainWindow = mainWindow;
    pluginMan.createListWindow();
  }
}

app.whenReady().then(() => {
  // 注册自定义协议来处理本地文件
  protocol.registerFileProtocol('app-file', (request, callback) => {
    const filePath = request.url.replace('app-file://', '');
    callback({ path: filePath });
  });

  initializeBusinessModules();
  createWindow();
});

app.on("window-all-closed", () => {
  // 关闭文件服务器
  if (fileServer) {
    fileServer.close();
    fileServer = null;
  }
  
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  // 关闭文件服务器
  if (fileServer) {
    fileServer.close();
    fileServer = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC 处理程序 - 视频管理
ipcMain.handle("video:getMeta", async (_, filePath: string) => {
  return new Promise((resolve, reject) => {
    vidManager.getMeta(filePath, (err: any, meta: any) => {
      if (!err) {
        resolve(meta);
      } else {
        reject(err);
      }
    });
  });
});

ipcMain.handle("video:setScheme", (_, scheme) => {
  vidManager.scheme = scheme;
});

ipcMain.handle("video:setWorkFiles", (_, workFiles) => {
  vidManager.workFiles = workFiles;
});

ipcMain.handle("video:setOutput", (_, output) => {
  vidManager.masterOutput = output;
});

ipcMain.handle("video:render", async (event) => {
  return new Promise((resolve, reject) => {
    const callback: any = {
      progress: (p: any) => {
        event.sender.send("video:renderProgress", p);
      },
    };

    vidManager.masterFiles = [];
    vidManager
      .renderAll(0, callback)
      .then(() => {
        return vidManager.stitchMaster(callback);
      })
      .then(() => {
        event.sender.send("video:renderDone");
        resolve(true);
      })
      .catch((err: any) => {
        event.sender.send("video:renderError", err.message);
        reject(err);
      });
  });
});

// IPC 处理程序 - 获取文件URL
ipcMain.handle("video:getFileUrl", async (_, filePath: string) => {
  try {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }
    
    // 返回HTTP服务器URL，对路径进行正确编码
    // 移除开头的斜杠以避免双斜杠问题
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const encodedPath = encodeURIComponent(cleanPath).replace(/%2F/g, '/');
    const url = `http://localhost:${FILE_SERVER_PORT}/${encodedPath}`;
    console.log("Generated file URL:", url);
    return url;
  } catch (error) {
    console.error("获取文件URL错误:", error);
    throw error;
  }
});

// IPC 处理程序 - 插件管理
ipcMain.handle("plugin:showList", () => {
  pluginMan.listWindow.show();
});

ipcMain.handle("plugin:open", (_, pluginName) => {
  pluginMan.openPlugin(pluginName);
});

ipcMain.handle("plugin:addFromPackage", (_, packagePath) => {
  pluginMan.addPluginFromPackage(packagePath);
});

// IPC 处理程序 - 预览服务器
ipcMain.handle("preview:setSettings", (_, settings) => {
  server.settings = settings;
});

// IPC 处理程序 - 文件操作
ipcMain.handle("dialog:showOpenDialog", async (_, options) => {
  const result = await dialog.showOpenDialog(mainWindow!, options);
  return result;
});

ipcMain.handle("dialog:showSaveDialog", async (_, options) => {
  const result = await dialog.showSaveDialog(mainWindow!, options);
  return result;
});

ipcMain.handle("dialog:showErrorBox", (_, title, content) => {
  dialog.showErrorBox(title, content);
});

// IPC 处理程序 - 窗口间通信
ipcMain.handle("window:sendToMain", (_, message) => {
  mainWindow?.webContents.send("window:relay", message);
});
