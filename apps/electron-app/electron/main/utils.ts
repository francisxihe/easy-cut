import { app } from "electron";

/**
 * 检测是否为开发环境
 * 使用多种方式检测开发环境
 */
export function isDevelopment(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    !!process.env.ELECTRON_RENDERER_URL ||
    !app.isPackaged
  );
}

/**
 * 获取应用路径，处理打包后的路径
 */
export function getAppPath(): string {
  return app.getAppPath().replace("app.asar", "app.asar.unpacked");
}

/**
 * 获取用户数据目录
 */
export function getUserDataPath(): string {
  return app.getPath("userData");
}