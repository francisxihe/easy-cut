export interface ElectronAPI {
  // 视频管理 API
  video: {
    getMeta: (filePath: string) => Promise<any>;
    setScheme: (scheme: any) => Promise<void>;
    setWorkFiles: (workFiles: any[]) => Promise<void>;
    setOutput: (output: string) => Promise<void>;
    render: () => Promise<void>;

    // 监听渲染进度
    onRenderProgress: (callback: (progress: any) => void) => void;
    onRenderDone: (callback: () => void) => void;
    onRenderError: (callback: (error: string) => void) => void;
  };

  // 插件管理 API
  plugin: {
    showList: () => Promise<void>;
    open: (pluginName: string) => Promise<void>;
    addFromPackage: (packagePath: string) => Promise<void>;
  };

  // 预览服务器 API
  preview: {
    setSettings: (settings: any) => Promise<void>;
  };

  // 文件对话框 API
  dialog: {
    showOpenDialog: (options: any) => Promise<any>;
    showSaveDialog: (options: any) => Promise<any>;
    showErrorBox: (title: string, content: string) => Promise<void>;
  };

  // 窗口通信 API
  window: {
    sendToMain: (message: any) => Promise<void>;
    onRelay: (callback: (message: any) => void) => void;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    nodeAPI?: {
      process: {
        platform: string;
        env: any;
      };
    };
  }
}
