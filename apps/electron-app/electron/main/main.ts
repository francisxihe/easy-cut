import { app, BrowserWindow, protocol } from "electron";
import { join } from "path";

// 导入模块
import { WindowManager } from "./windowManager";
import { BusinessModuleInitializer, BusinessModules } from "./businessModules";
import { IPCHandlers } from "./ipcHandlers";
import { isDevelopment } from "./utils";

// 全局变量
let windowManager: WindowManager;
let businessModules: BusinessModules;
let ipcHandlers: IPCHandlers;
const isDev = isDevelopment();

// 初始化所有模块
function initializeModules(): void {
  // 初始化窗口管理器
  windowManager = new WindowManager(isDev);
  
  // 初始化业务模块
  const initializer = new BusinessModuleInitializer(isDev);
  businessModules = initializer.initialize();
  
  // 初始化IPC处理器
  ipcHandlers = new IPCHandlers(
    businessModules.vidManager,
    businessModules.pluginMan,
    businessModules.server,
    businessModules.fileServer,
    () => windowManager.getMainWindow()
  );
  
  // 注册IPC处理器
  ipcHandlers.registerHandlers();
}

function createWindow(): void {
  const mainWindow = windowManager.createMainWindow();
  
  // 设置插件管理器的主窗口引用
  if (businessModules.pluginMan) {
    businessModules.pluginMan.mainWindow = mainWindow;
    businessModules.pluginMan.createListWindow();
  }
}

app.whenReady().then(() => {
  // 注册自定义协议来处理本地文件
  protocol.registerFileProtocol('app-file', (request, callback) => {
    const filePath = request.url.replace('app-file://', '');
    callback({ path: filePath });
  });

  initializeModules();
  createWindow();
});

app.on("window-all-closed", () => {
  // 关闭文件服务器
  if (businessModules?.fileServer) {
    businessModules.fileServer.stop();
  }
  
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  // 关闭文件服务器
  if (businessModules?.fileServer) {
    businessModules.fileServer.stop();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
