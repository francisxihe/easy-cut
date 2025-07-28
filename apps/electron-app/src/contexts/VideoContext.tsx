import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";

// 类型定义
export interface VideoFile {
  id: string;
  file: string;
  originalFile?: string; // 原始文件路径
  isProcessed?: boolean; // 是否已预处理
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  properties: {
    duration?: number;
    seek?: number;
    filters?: Array<{
      filter: string;
      options?: any;
    }>;
    advanced?: {
      inputs?: string[];
      complex?: boolean;
      complexFilter?: string;
    };
  };
}



export interface RenderScheme {
  size: string;
  format: string;
  codec: string;
  bitrate: number;
  fps: number;
  pad: boolean;
}

export interface VideoState {
  // 项目文件
  workFiles: VideoFile[];

  // 渲染设置
  scheme: RenderScheme;

  // 输出设置
  outputPath: string;

  // 渲染状态
  isRendering: boolean;
  renderProgress: number;
  renderError: string | null;

  // 选中的文件
  selectedFileId: string | null;

  // 预览状态
  previewUrl: string | null;
}

type VideoAction =
  | { type: "ADD_VIDEO_FILE"; payload: VideoFile }
  | { type: "REMOVE_VIDEO_FILE"; payload: string }
  | {
      type: "UPDATE_VIDEO_FILE";
      payload: { id: string; properties: Partial<VideoFile["properties"]> };
    }
  | {
      type: "UPDATE_VIDEO_FILE_STATUS";
      payload: { id: string; updates: Partial<Pick<VideoFile, 'isProcessed' | 'processingStatus' | 'file' | 'originalFile'>> };
    }
  | { type: "SET_WORK_FILES"; payload: VideoFile[] }
  | { type: "SELECT_FILE"; payload: string | null }
  | { type: "SET_SCHEME"; payload: Partial<RenderScheme> }
  | { type: "SET_OUTPUT_PATH"; payload: string }
  | {
      type: "SET_RENDER_STATE";
      payload: {
        isRendering: boolean;
        progress?: number;
        error?: string | null;
      };
    }
  | { type: "SET_PREVIEW_URL"; payload: string | null }
  | { type: "RESET_PROJECT" };

const initialState: VideoState = {
  workFiles: [],
  scheme: {
    size: "1280x720",
    format: ".mp4",
    codec: "libx264",
    bitrate: 1000,
    fps: 24,
    pad: true,
  },
  outputPath: "",
  isRendering: false,
  renderProgress: 0,
  renderError: null,
  selectedFileId: null,
  previewUrl: null,
};

function videoReducer(state: VideoState, action: VideoAction): VideoState {
  switch (action.type) {
    case "ADD_VIDEO_FILE":
      return {
        ...state,
        workFiles: [...state.workFiles, action.payload],
      };

    case "REMOVE_VIDEO_FILE":
      return {
        ...state,
        workFiles: state.workFiles.filter((file) => file.id !== action.payload),
        selectedFileId:
          state.selectedFileId === action.payload ? null : state.selectedFileId,
      };

    case "UPDATE_VIDEO_FILE":
      return {
        ...state,
        workFiles: state.workFiles.map((file) =>
          file.id === action.payload.id
            ? {
                ...file,
                properties: {
                  ...file.properties,
                  ...action.payload.properties,
                },
              }
            : file
        ),
      };

    case "UPDATE_VIDEO_FILE_STATUS":
      return {
        ...state,
        workFiles: state.workFiles.map((file) =>
          file.id === action.payload.id
            ? {
                ...file,
                ...action.payload.updates,
              }
            : file
        ),
      };

    case "SET_WORK_FILES":
      return {
        ...state,
        workFiles: action.payload,
      };

    case "SELECT_FILE":
      return {
        ...state,
        selectedFileId: action.payload,
      };

    case "SET_SCHEME":
      return {
        ...state,
        scheme: { ...state.scheme, ...action.payload },
      };

    case "SET_OUTPUT_PATH":
      return {
        ...state,
        outputPath: action.payload,
      };

    case "SET_RENDER_STATE":
      return {
        ...state,
        isRendering: action.payload.isRendering,
        renderProgress: action.payload.progress ?? state.renderProgress,
        renderError:
          action.payload.error !== undefined
            ? action.payload.error
            : state.renderError,
      };

    case "SET_PREVIEW_URL":
      return {
        ...state,
        previewUrl: action.payload,
      };

    case "RESET_PROJECT":
      return {
        ...initialState,
        scheme: state.scheme, // 保留渲染设置
      };

    default:
      return state;
  }
}

interface VideoContextType {
  state: VideoState;
  dispatch: React.Dispatch<VideoAction>;

  // 便捷方法
  addVideoFile: (file: string) => Promise<void>;
  removeVideoFile: (id: string) => void;
  updateVideoFile: (
    id: string,
    properties: Partial<VideoFile["properties"]>
  ) => void;
  updateVideoFileStatus: (
    id: string,
    updates: Partial<Pick<VideoFile, 'isProcessed' | 'processingStatus' | 'file' | 'originalFile'>>
  ) => void;
  selectFile: (id: string | null) => void;
  updateScheme: (scheme: Partial<RenderScheme>) => void;
  setOutputPath: (path: string) => void;
  startRender: () => Promise<void>;
  resetProject: () => void;

  // 视频预处理方法
  preprocessVideoFile: (fileId: string) => Promise<void>;
  
  // 预览方法
  previewFile: (fileId: string, onPreviewStart?: () => void) => Promise<void>;
  clearPreview: () => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export function VideoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(videoReducer, initialState);

  // 监听渲染事件
  useEffect(() => {
    if (typeof window !== "undefined" && window.electronAPI) {
      window.electronAPI.video.onRenderProgress((progress: any) => {
        dispatch({
          type: "SET_RENDER_STATE",
          payload: { isRendering: true, progress: progress.percent },
        });
      });

      window.electronAPI.video.onRenderDone(() => {
        dispatch({
          type: "SET_RENDER_STATE",
          payload: { isRendering: false, progress: 100, error: null },
        });
      });

      window.electronAPI.video.onRenderError((error: string) => {
        dispatch({
          type: "SET_RENDER_STATE",
          payload: { isRendering: false, error },
        });
      });
    }
  }, []);

  // 同步状态到 Electron
  useEffect(() => {
    if (typeof window !== "undefined" && window.electronAPI) {
      window.electronAPI.video.setWorkFiles(state.workFiles);
    }
  }, [state.workFiles]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.electronAPI) {
      window.electronAPI.video.setScheme(state.scheme);
    }
  }, [state.scheme]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.electronAPI &&
      state.outputPath
    ) {
      window.electronAPI.video.setOutput(state.outputPath);
    }
  }, [state.outputPath]);

  // 便捷方法
  const addVideoFile = async (file: string) => {
    try {
      const meta = await window.electronAPI.video.getMeta(file);
      const videoFile: VideoFile = {
        id: Date.now().toString(),
        file,
        originalFile: file,
        isProcessed: false,
        processingStatus: 'pending',
        properties: {
          duration: meta.format?.duration,
        },
      };
      dispatch({ type: "ADD_VIDEO_FILE", payload: videoFile });
      
      // 自动开始预处理，直接传递videoFile对象
      setTimeout(() => {
        preprocessVideoFileWithData(videoFile);
      }, 100);
    } catch (error) {
      console.error("获取视频元数据失败:", error);
    }
  };

  const removeVideoFile = (id: string) => {
    dispatch({ type: "REMOVE_VIDEO_FILE", payload: id });
  };

  const updateVideoFile = (
    id: string,
    properties: Partial<VideoFile["properties"]>
  ) => {
    dispatch({ type: "UPDATE_VIDEO_FILE", payload: { id, properties } });
  };

  const updateVideoFileStatus = (
    id: string,
    updates: Partial<Pick<VideoFile, 'isProcessed' | 'processingStatus' | 'file' | 'originalFile'>>
  ) => {
    dispatch({ type: "UPDATE_VIDEO_FILE_STATUS", payload: { id, updates } });
  };

  const selectFile = (id: string | null) => {
    dispatch({ type: "SELECT_FILE", payload: id });
  };

  // 内部预处理方法，直接接受videoFile对象
  const preprocessVideoFileWithData = async (videoFile: VideoFile) => {
    if (!videoFile || !videoFile.originalFile) {
      console.error('视频文件数据无效:', videoFile?.id);
      return;
    }

    try {
      // 更新状态为处理中
      updateVideoFileStatus(videoFile.id, { processingStatus: 'processing' });
      
      // 检查文件格式是否需要转换
      const fileExtension = videoFile.originalFile.split('.').pop()?.toLowerCase();
      const needsConversion = !['mp4', 'webm'].includes(fileExtension || '');
      
      if (needsConversion) {
         // TODO: 集成FFmpeg进行视频预处理
         // 暂时模拟预处理过程
         console.log('需要预处理视频格式:', fileExtension);
         
         // 模拟异步处理
         await new Promise(resolve => setTimeout(resolve, 1000));
         
         // 暂时使用原文件，实际应该是转换后的文件路径
         updateVideoFileStatus(videoFile.id, {
           isProcessed: true,
           processingStatus: 'completed'
         });
         
         console.log('视频预处理完成（模拟）');
       } else {
        // 不需要转换，直接标记为已处理
        updateVideoFileStatus(videoFile.id, {
          isProcessed: true,
          processingStatus: 'completed'
        });
        
        console.log('视频格式已兼容，无需预处理');
      }
    } catch (error) {
      console.error('视频预处理失败:', error);
      updateVideoFileStatus(videoFile.id, { processingStatus: 'failed' });
    }
  };

  // 视频预处理方法（公开接口）
  const preprocessVideoFile = async (fileId: string) => {
    const videoFile = state.workFiles.find(f => f.id === fileId);
    if (!videoFile) {
      console.error('找不到要预处理的视频文件:', fileId);
      return;
    }
    await preprocessVideoFileWithData(videoFile);
  };

  const updateScheme = (scheme: Partial<RenderScheme>) => {
    dispatch({ type: "SET_SCHEME", payload: scheme });
  };

  const setOutputPath = (path: string) => {
    dispatch({ type: "SET_OUTPUT_PATH", payload: path });
  };

  const startRender = async () => {
    if (state.workFiles.length === 0) {
      throw new Error("没有视频文件可以渲染");
    }

    dispatch({
      type: "SET_RENDER_STATE",
      payload: { isRendering: true, progress: 0, error: null },
    });

    try {
      await window.electronAPI.video.render();
    } catch (error) {
      dispatch({
        type: "SET_RENDER_STATE",
        payload: { isRendering: false, error: String(error) },
      });
      throw error;
    }
  };

  const resetProject = () => {
    dispatch({ type: "RESET_PROJECT" });
  };

  // 预览方法
  const previewFile = async (fileId: string, onPreviewStart?: () => void) => {
    const file = state.workFiles.find((f) => f.id === fileId);
    if (file && window.electronAPI) {
      try {
        // 直接使用文件路径作为预览URL
        const fileUrl = `file://${file.file}`;
        dispatch({ type: "SET_PREVIEW_URL", payload: fileUrl });
        dispatch({ type: "SELECT_FILE", payload: fileId });
        
        // 触发Sources播放回调
        if (onPreviewStart) {
          onPreviewStart();
        }
      } catch (error) {
        console.error("获取文件URL失败:", error);
      }
    }
  };

  const clearPreview = () => {
    dispatch({ type: "SET_PREVIEW_URL", payload: null });
  };

  const value: VideoContextType = {
    state,
    dispatch,
    addVideoFile,
    removeVideoFile,
    updateVideoFile,
    updateVideoFileStatus,
    preprocessVideoFile,
    selectFile,
    updateScheme,
    startRender,
    setOutputPath,
    resetProject,
    previewFile,
    clearPreview,
  };

  return (
    <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
  );
}

export function useVideo() {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
}
