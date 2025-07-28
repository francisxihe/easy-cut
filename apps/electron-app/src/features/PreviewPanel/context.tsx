import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useVideo } from "../../contexts/VideoContext";
import { usePlayback } from "../../contexts/PlaybackContext";

// 预览面板状态类型
interface PreviewState {
  showNativeControls: boolean;
  showImageTest: boolean;
  videoFormat: string;
  isFormatSupported: boolean;
}

// 预览面板操作类型
type PreviewAction =
  | { type: "TOGGLE_NATIVE_CONTROLS" }
  | { type: "TOGGLE_IMAGE_TEST" }
  | {
      type: "SET_VIDEO_FORMAT";
      payload: { format: string; isSupported: boolean };
    }
  | { type: "RESET_STATE" };

// 预览面板上下文类型
interface PreviewContextType {
  state: PreviewState;
  // 状态更新函数
  toggleNativeControls: () => void;
  toggleImageTest: () => void;
  setVideoFormat: (format: string, isSupported: boolean) => void;
  resetState: () => void;
  // 工具函数
  checkVideoCompatibility: (url: string) => void;
  testFileUrl: () => Promise<void>;
  refreshVideo: () => void;
  openVideoInNewWindow: () => void;
  convertToMp4: () => void;
}

const initialState: PreviewState = {
  showNativeControls: false,
  showImageTest: false,
  videoFormat: "",
  isFormatSupported: true,
};

function previewReducer(
  state: PreviewState,
  action: PreviewAction
): PreviewState {
  switch (action.type) {
    case "TOGGLE_NATIVE_CONTROLS":
      return { ...state, showNativeControls: !state.showNativeControls };
    case "TOGGLE_IMAGE_TEST":
      return { ...state, showImageTest: !state.showImageTest };
    case "SET_VIDEO_FORMAT":
      return {
        ...state,
        videoFormat: action.payload.format,
        isFormatSupported: action.payload.isSupported,
      };
    case "RESET_STATE":
      return initialState;
    default:
      return state;
  }
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export const PreviewProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(previewReducer, initialState);
  const { state: videoState } = useVideo();
  const { videoRef } = usePlayback();

  // 状态更新函数
  const toggleNativeControls = () => {
    dispatch({ type: "TOGGLE_NATIVE_CONTROLS" });
  };

  const toggleImageTest = () => {
    dispatch({ type: "TOGGLE_IMAGE_TEST" });
  };

  const setVideoFormat = (format: string, isSupported: boolean) => {
    dispatch({ type: "SET_VIDEO_FORMAT", payload: { format, isSupported } });
  };

  const resetState = () => {
    dispatch({ type: "RESET_STATE" });
  };

  // 检查视频格式兼容性
  const checkVideoCompatibility = (url: string) => {
    const format = url.split(".").pop()?.toLowerCase() || "";

    const supportedFormats = ["mp4", "webm", "ogg"];
    const limitedSupportFormats = ["mov", "avi", "mkv", "m4v"];

    if (supportedFormats.includes(format)) {
      setVideoFormat(format, true);
    } else if (limitedSupportFormats.includes(format)) {
      setVideoFormat(format, false);
      console.warn(
        `视频格式 ${format.toUpperCase()} 在Web环境中支持有限，建议转换为MP4格式`
      );
    } else {
      setVideoFormat(format, false);
      console.warn(`视频格式 ${format.toUpperCase()} 可能不被支持`);
    }
  };

  // 工具函数
  const testFileUrl = async () => {
    if (videoState.previewUrl) {
      try {
        console.log("Testing file URL:", videoState.previewUrl);
        const response = await fetch(videoState.previewUrl);
        console.log("File URL response:", response.status, response.statusText);
        console.log("Content-Type:", response.headers.get("Content-Type"));
        console.log("Content-Length:", response.headers.get("Content-Length"));
      } catch (error) {
        console.error("File URL test failed:", error);
      }
    }
  };

  const refreshVideo = () => {
    if (videoRef.current && videoState.previewUrl) {
      const currentTime = videoRef.current.currentTime;
      const wasPlaying = !videoRef.current.paused;

      // 重新加载视频
      videoRef.current.load();

      // 恢复播放状态
      videoRef.current.addEventListener(
        "loadedmetadata",
        () => {
          if (videoRef.current) {
            videoRef.current.currentTime = currentTime;
            if (wasPlaying) {
              videoRef.current.play();
            }
          }
        },
        { once: true }
      );
    }
  };

  const openVideoInNewWindow = () => {
    if (videoState.previewUrl) {
      window.open(videoState.previewUrl, "_blank");
    }
  };

  const convertToMp4 = () => {
    if (videoState.selectedFileId) {
      // 这里可以集成FFmpeg转换功能
      console.log("建议转换文件格式为MP4");
      alert(
        `建议将 ${state.videoFormat.toUpperCase()} 文件转换为 MP4 格式以获得更好的兼容性。\n\n可以使用 FFmpeg 或其他视频转换工具。`
      );
    }
  };

  // 当previewUrl改变时，重新加载视频
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoState.previewUrl) return;

    // 检查格式兼容性
    checkVideoCompatibility(videoState.previewUrl);

    // 清空现有的source
    video.innerHTML = "";

    // 创建新的source元素
    const source = document.createElement("source");
    source.src = videoState.previewUrl;

    // 根据文件扩展名设置正确的MIME类型
    const format = videoState.previewUrl.split(".").pop()?.toLowerCase() || "";
    const mimeTypes: Record<string, string> = {
      mp4: "video/mp4",
      mov: "video/quicktime",
      avi: "video/x-msvideo",
      mkv: "video/x-matroska",
      webm: "video/webm",
      m4v: "video/mp4",
    };
    source.type = mimeTypes[format] || "video/mp4";

    // 添加source到video元素
    video.appendChild(source);

    // 强制重新加载
    video.load();

    console.log("Video reloaded with new source:", videoState.previewUrl);
    console.log("MIME type:", source.type);
  }, [videoState.previewUrl]);

  const contextValue: PreviewContextType = {
    state,
    // 状态更新函数
    toggleNativeControls,
    toggleImageTest,
    setVideoFormat,
    resetState,
    // 工具函数
    checkVideoCompatibility,
    testFileUrl,
    refreshVideo,
    openVideoInNewWindow,
    convertToMp4,
  };

  return (
    <PreviewContext.Provider value={contextValue}>
      {children}
    </PreviewContext.Provider>
  );
};

export const usePreview = (): PreviewContextType => {
  const context = useContext(PreviewContext);
  if (context === undefined) {
    throw new Error("usePreview must be used within a PreviewProvider");
  }
  return context;
};
