import { ipcMain, dialog, BrowserWindow } from "electron";
import { FileServer } from "./fileServer";

export class IPCHandlers {
  private vidManager: any;
  private pluginMan: any;
  private server: any;
  private fileServer: FileServer;
  private getMainWindow: () => BrowserWindow | null;

  constructor(
    vidManager: any,
    pluginMan: any,
    server: any,
    fileServer: FileServer,
    getMainWindow: () => BrowserWindow | null
  ) {
    this.vidManager = vidManager;
    this.pluginMan = pluginMan;
    this.server = server;
    this.fileServer = fileServer;
    this.getMainWindow = getMainWindow;
  }

  registerHandlers(): void {
    this.registerVideoHandlers();
    this.registerPluginHandlers();
    this.registerPreviewHandlers();
    this.registerDialogHandlers();
    this.registerWindowHandlers();
    this.registerProjectHandlers();
  }

  private registerVideoHandlers(): void {
    // IPC 处理程序 - 视频管理
    ipcMain.handle("video:getMeta", async (_, filePath: string) => {
      return new Promise((resolve, reject) => {
        this.vidManager.getMeta(filePath, (err: any, meta: any) => {
          if (!err) {
            resolve(meta);
          } else {
            reject(err);
          }
        });
      });
    });

    ipcMain.handle("video:setScheme", (_, scheme) => {
      this.vidManager.scheme = scheme;
    });

    ipcMain.handle("video:setWorkFiles", (_, workFiles) => {
      this.vidManager.workFiles = workFiles;
    });

    ipcMain.handle("video:setOutput", (_, output) => {
      this.vidManager.masterOutput = output;
    });

    ipcMain.handle("video:render", async (event) => {
      return new Promise((resolve, reject) => {
        const callback: any = {
          progress: (p: any) => {
            event.sender.send("video:renderProgress", p);
          },
        };

        this.vidManager.masterFiles = [];
        this.vidManager
          .renderAll(0, callback)
          .then(() => {
            return this.vidManager.stitchMaster(callback);
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
        return this.fileServer.generateFileUrl(filePath);
      } catch (error) {
        console.error("获取文件URL错误:", error);
        throw error;
      }
    });
  }

  private registerPluginHandlers(): void {
    // IPC 处理程序 - 插件管理
    ipcMain.handle("plugin:showList", () => {
      this.pluginMan.listWindow.show();
    });

    ipcMain.handle("plugin:open", (_, pluginName) => {
      this.pluginMan.openPlugin(pluginName);
    });

    ipcMain.handle("plugin:addFromPackage", (_, packagePath) => {
      this.pluginMan.addPluginFromPackage(packagePath);
    });
  }

  private registerPreviewHandlers(): void {
    // IPC 处理程序 - 预览服务器
    ipcMain.handle("preview:setSettings", (_, settings) => {
      this.server.settings = settings;
    });
  }

  private registerDialogHandlers(): void {
    // IPC 处理程序 - 文件操作
    ipcMain.handle("dialog:showOpenDialog", async (_, options) => {
      const mainWindow = this.getMainWindow();
      if (!mainWindow) {
        throw new Error("Main window not available");
      }
      const result = await dialog.showOpenDialog(mainWindow, options);
      return result;
    });

    ipcMain.handle("dialog:showSaveDialog", async (_, options) => {
      const mainWindow = this.getMainWindow();
      if (!mainWindow) {
        throw new Error("Main window not available");
      }
      const result = await dialog.showSaveDialog(mainWindow, options);
      return result;
    });

    ipcMain.handle("dialog:showErrorBox", (_, title, content) => {
      dialog.showErrorBox(title, content);
    });
  }

  private registerWindowHandlers(): void {
    // IPC 处理程序 - 窗口间通信
    ipcMain.handle("window:sendToMain", (_, message) => {
      const mainWindow = this.getMainWindow();
      mainWindow?.webContents.send("window:relay", message);
    });
  }

  private registerProjectHandlers(): void {
    // IPC 处理程序 - 项目管理
    ipcMain.handle("project:create", async (_, projectData) => {
      try {
        // 这里可以实现项目文件的创建逻辑
        // 暂时返回成功状态
        console.log("创建项目:", projectData);
        return { success: true, path: projectData.path };
      } catch (error) {
        console.error("创建项目失败:", error);
        throw error;
      }
    });

    ipcMain.handle("project:load", async (_, projectPath) => {
      try {
        // 这里可以实现项目文件的加载逻辑
        console.log("加载项目:", projectPath);
        return { success: true, data: {} };
      } catch (error) {
        console.error("加载项目失败:", error);
        throw error;
      }
    });

    ipcMain.handle("project:save", async (_, projectPath, projectData) => {
      try {
        // 这里可以实现项目文件的保存逻辑
        console.log("保存项目:", projectPath, projectData);
        return { success: true };
      } catch (error) {
        console.error("保存项目失败:", error);
        throw error;
      }
    });

    ipcMain.handle("project:getRecent", async () => {
      try {
        // 这里可以实现获取最近项目的逻辑
        // 暂时返回空数组
        return [];
      } catch (error) {
        console.error("获取最近项目失败:", error);
        return [];
      }
    });

    ipcMain.handle("project:removeFromRecent", async (_, projectId) => {
      try {
        // 这里可以实现从最近项目中移除的逻辑
        console.log("从最近项目中移除:", projectId);
        return { success: true };
      } catch (error) {
        console.error("移除最近项目失败:", error);
        throw error;
      }
    });
  }
}