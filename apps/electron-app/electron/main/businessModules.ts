import { app, dialog } from "electron";
import { join } from "path";
import fs from "fs";
import os from "os";
import { FileServer } from "./fileServer";

// 导入业务模块
import { VideoManager } from "../modules/VideoManager";
import { PluginManager } from "../modules/PluginManager";
import { PreviewServer } from "../modules/PreviewServer";

export interface BusinessModules {
  vidManager: VideoManager;
  pluginMan: PluginManager;
  server: PreviewServer;
  fileServer: FileServer;
}

export class BusinessModuleInitializer {
  private isDev: boolean;

  constructor(isDev: boolean) {
    this.isDev = isDev;
  }

  initialize(): BusinessModules {
    const appPath = app.getAppPath().replace("app.asar", "app.asar.unpacked");
    const workdir = app.getPath("userData");
    const masterDir = join(workdir, "master");

    // 确保工作目录存在
    if (!fs.existsSync(masterDir)) {
      if (!fs.existsSync(workdir)) fs.mkdirSync(workdir);
      fs.mkdirSync(masterDir);
    }

    // 启动文件服务器
    const fileServer = new FileServer();
    fileServer.start();

    // 初始化视频管理器
    const vidManager = this.initializeVideoManager(appPath, workdir);

    // 初始化插件管理器
    const pluginMan = new PluginManager();

    // 初始化预览服务器
    const server = new PreviewServer(vidManager);

    return {
      vidManager,
      pluginMan,
      server,
      fileServer,
    };
  }

  private initializeVideoManager(appPath: string, workdir: string): VideoManager {
    try {
      let ffmpegPath, ffprobePath;

      if (this.isDev) {
        // 开发环境：使用系统安装的FFmpeg
        console.log("Development mode: Using system FFmpeg");
        ffmpegPath = null; // 让fluent-ffmpeg使用系统PATH中的ffmpeg
        ffprobePath = null; // 让fluent-ffmpeg使用系统PATH中的ffprobe
      } else {
        // 生产环境：使用打包的二进制文件
        if (os.platform() === "darwin") {
          ffmpegPath = join(appPath, "bin/darwin/ffmpeg");
          ffprobePath = join(appPath, "bin/darwin/ffprobe");
        } else if (os.platform() === "win32" && os.arch() === "x64") {
          ffmpegPath = join(appPath, "bin/win64/ffmpeg.exe");
          ffprobePath = join(appPath, "bin/win64/ffprobe.exe");
        } else {
          throw new Error(
            "This platform or architecture is currently not supported."
          );
        }
      }

      const vidManager = new VideoManager(ffmpegPath, ffprobePath, workdir);

      // 设置默认渲染方案（只有在vidManager成功创建后才设置）
      vidManager.setScheme({
        size: "1280x720",
        format: ".mp4",
        codec: "libx264",
        bitrate: "1000k",
        fps: 24,
        pad: true,
      });

      return vidManager;
    } catch (err: any) {
      console.error("Error while creating ffmpeg handler:", err);
      dialog.showErrorBox("Error while creating ffmpeg handler:", err.message);
      app.exit(1);
      throw err; // 重新抛出错误以确保调用者知道初始化失败
    }
  }
}
