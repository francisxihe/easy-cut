import { contextBridge, ipcRenderer } from "electron";

// 暴露安全的 API 到渲染进程
contextBridge.exposeInMainWorld("electronAPI", {
  // 视频管理 API
  video: {
    getMeta: (filePath: string) =>
      ipcRenderer.invoke("video:getMeta", filePath),
    setScheme: (scheme: any) => ipcRenderer.invoke("video:setScheme", scheme),
    setWorkFiles: (workFiles: any[]) =>
      ipcRenderer.invoke("video:setWorkFiles", workFiles),
    setOutput: (output: string) =>
      ipcRenderer.invoke("video:setOutput", output),
    render: () => ipcRenderer.invoke("video:render"),
    getFileUrl: (filePath: string) =>
      ipcRenderer.invoke("video:getFileUrl", filePath),

    // 监听渲染进度
    onRenderProgress: (callback: (progress: any) => void) => {
      ipcRenderer.on("video:renderProgress", (_, progress) =>
        callback(progress)
      );
    },
    onRenderDone: (callback: () => void) => {
      ipcRenderer.on("video:renderDone", () => callback());
    },
    onRenderError: (callback: (error: string) => void) => {
      ipcRenderer.on("video:renderError", (_, error) => callback(error));
    },
  },

  // 插件管理 API
  plugin: {
    showList: () => ipcRenderer.invoke("plugin:showList"),
    open: (pluginName: string) => ipcRenderer.invoke("plugin:open", pluginName),
    addFromPackage: (packagePath: string) =>
      ipcRenderer.invoke("plugin:addFromPackage", packagePath),
  },

  // 预览服务器 API
  preview: {
    setSettings: (settings: any) =>
      ipcRenderer.invoke("preview:setSettings", settings),
  },

  // 文件对话框 API
  dialog: {
    showOpenDialog: (options: any) =>
      ipcRenderer.invoke("dialog:showOpenDialog", options),
    showSaveDialog: (options: any) =>
      ipcRenderer.invoke("dialog:showSaveDialog", options),
    showErrorBox: (title: string, content: string) =>
      ipcRenderer.invoke("dialog:showErrorBox", title, content),
  },

  // 窗口通信 API
  window: {
    sendToMain: (message: any) =>
      ipcRenderer.invoke("window:sendToMain", message),
    onRelay: (callback: (message: any) => void) => {
      ipcRenderer.on("window:relay", (_, message) => callback(message));
    },
  },

  // 项目管理 API
  project: {
    create: (projectData: { name: string; path: string }) =>
      ipcRenderer.invoke("project:create", projectData),
    load: (projectPath: string) =>
      ipcRenderer.invoke("project:load", projectPath),
    save: (projectPath: string, projectData: any) =>
      ipcRenderer.invoke("project:save", projectPath, projectData),
    getRecent: () => ipcRenderer.invoke("project:getRecent"),
    removeFromRecent: (projectId: string) =>
      ipcRenderer.invoke("project:removeFromRecent", projectId),
  },
});

// Expose Node.js APIs for development
if (process.env.NODE_ENV === "development") {
  contextBridge.exposeInMainWorld("nodeAPI", {
    process: {
      platform: process.platform,
      env: process.env,
    },
  });
}
