// Easy Cut 共享工具和常量
const constants = {
  APP_NAME: "Easy Cut",
  VERSION: "1.0.0",
  SUPPORTED_FORMATS: ["mp4", "avi", "mov", "mkv", "wmv"],
  DEFAULT_QUALITY: "high",
};

const utils = {
  // 格式化时间显示
  formatTime: (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  },

  // 验证视频文件格式
  isValidVideoFormat: (filename) => {
    const extension = filename.split(".").pop().toLowerCase();
    return constants.SUPPORTED_FORMATS.includes(extension);
  },

  // 获取文件大小的人类可读格式
  formatFileSize: (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },
};

module.exports = {
  constants,
  utils,
};
