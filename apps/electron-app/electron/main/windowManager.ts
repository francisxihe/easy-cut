import { BrowserWindow } from "electron";
import { join } from "path";

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private isDev: boolean;

  constructor(isDev: boolean) {
    this.isDev = isDev;
  }

  createMainWindow(): BrowserWindow {
    this.mainWindow = new BrowserWindow({
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
      isPackaged: require("electron").app.isPackaged,
      isDev: this.isDev,
    });

    if (this.isDev) {
      const devUrl = "http://localhost:8200";
      console.log("开发模式：加载", devUrl);
      this.mainWindow.loadURL(devUrl);
      this.mainWindow.webContents.openDevTools();
    } else {
      console.log("生产模式：加载本地文件");
      this.mainWindow.loadFile(join(__dirname, "../dist/index.html"));
    }

    return this.mainWindow;
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  setMainWindow(window: BrowserWindow | null): void {
    this.mainWindow = window;
  }
}