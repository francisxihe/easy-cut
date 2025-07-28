import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { useVideo } from "../../contexts/VideoContext";
import type { VideoFile } from "../../contexts/VideoContext";
import { usePlayback } from "../../contexts/PlaybackContext";

// 源文件面板状态接口
export interface SourcesPanelState {
  // 数据状态
  files: VideoFile[];
  selectedFileId: string | null;
  
  // UI状态
  sortBy: 'name' | 'duration' | 'dateAdded';
  sortOrder: 'asc' | 'desc';
  filterText: string;
  viewMode: 'list' | 'grid';
  showFileDetails: boolean;
}

type SourcesPanelAction =
  // 数据操作
  | { type: "SET_FILES"; payload: VideoFile[] }
  | { type: "ADD_FILE"; payload: VideoFile }
  | { type: "REMOVE_FILE"; payload: string }
  | { type: "UPDATE_FILE"; payload: { fileId: string; updates: Partial<VideoFile> } }
  | { type: "SELECT_FILE"; payload: string | null }
  // UI操作
  | { type: "SET_SORT"; payload: { sortBy: 'name' | 'duration' | 'dateAdded'; sortOrder: 'asc' | 'desc' } }
  | { type: "SET_FILTER"; payload: string }
  | { type: "SET_VIEW_MODE"; payload: 'list' | 'grid' }
  | { type: "TOGGLE_FILE_DETAILS" }
  | { type: "RESET_UI" };

const initialState: SourcesPanelState = {
  // 数据状态
  files: [],
  selectedFileId: null,
  
  // UI状态
  sortBy: 'dateAdded',
  sortOrder: 'desc',
  filterText: '',
  viewMode: 'list',
  showFileDetails: true,
};

function sourcesPanelReducer(state: SourcesPanelState, action: SourcesPanelAction): SourcesPanelState {
  switch (action.type) {
    case "SET_FILES":
      return {
        ...state,
        files: action.payload,
      };

    case "ADD_FILE":
      return {
        ...state,
        files: [...state.files, action.payload],
      };

    case "REMOVE_FILE":
      return {
        ...state,
        files: state.files.filter(file => file.id !== action.payload),
        selectedFileId: state.selectedFileId === action.payload ? null : state.selectedFileId,
      };

    case "UPDATE_FILE":
      return {
        ...state,
        files: state.files.map(file =>
          file.id === action.payload.fileId
            ? { ...file, ...action.payload.updates }
            : file
        ),
      };

    case "SELECT_FILE":
      return {
        ...state,
        selectedFileId: action.payload,
      };

    case "SET_SORT":
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder,
      };

    case "SET_FILTER":
      return {
        ...state,
        filterText: action.payload,
      };

    case "SET_VIEW_MODE":
      return {
        ...state,
        viewMode: action.payload,
      };

    case "TOGGLE_FILE_DETAILS":
      return {
        ...state,
        showFileDetails: !state.showFileDetails,
      };

    case "RESET_UI":
      return {
        ...state,
        sortBy: 'dateAdded',
        sortOrder: 'desc',
        filterText: '',
        viewMode: 'list',
        showFileDetails: true,
      };

    default:
      return state;
  }
}

interface SourcesPanelContextType {
  state: SourcesPanelState;
  dispatch: React.Dispatch<SourcesPanelAction>;

  // 文件管理
  addFile: (file: VideoFile) => void;
  removeFile: (fileId: string) => void;
  updateFile: (fileId: string, updates: Partial<VideoFile>) => void;
  selectFile: (fileId: string | null) => void;
  getFileById: (fileId: string) => VideoFile | null;
  getSelectedFile: () => VideoFile | null;

  // 文件操作
  previewFile: (fileId: string) => void;
  duplicateFile: (fileId: string) => void;

  // 排序和过滤
  setSorting: (sortBy: 'name' | 'duration' | 'dateAdded', sortOrder: 'asc' | 'desc') => void;
  setFilter: (filterText: string) => void;
  getFilteredAndSortedFiles: () => VideoFile[];

  // 视图控制
  setViewMode: (mode: 'list' | 'grid') => void;
  toggleFileDetails: () => void;

  // 工具方法
  resetUI: () => void;
  clearSelection: () => void;

  // 事件回调（供外部监听）
  onFileAdded?: (file: VideoFile) => void;
  onFileRemoved?: (fileId: string) => void;
  onFileSelected?: (file: VideoFile | null) => void;
}

const SourcesPanelContext = createContext<SourcesPanelContextType | undefined>(undefined);

export function SourcesPanelProvider({ 
  children,
  onFileAdded,
  onFileRemoved,
  onFileSelected 
}: { 
  children: ReactNode;
  onFileAdded?: (file: VideoFile) => void;
  onFileRemoved?: (fileId: string) => void;
  onFileSelected?: (file: VideoFile | null) => void;
}) {
  const [state, dispatch] = useReducer(sourcesPanelReducer, initialState);
  const { state: videoState, removeVideoFile, selectFile: videoSelectFile, previewFile: videoPreviewFile } = useVideo();
  const { playFromSources } = usePlayback();

  // 同步VideoContext中的文件数据
  useEffect(() => {
    dispatch({ type: "SET_FILES", payload: videoState.workFiles });
  }, [videoState.workFiles]);

  // 同步选中的文件
  useEffect(() => {
    dispatch({ type: "SELECT_FILE", payload: videoState.selectedFileId });
  }, [videoState.selectedFileId]);

  // 文件管理
  const addFile = (file: VideoFile) => {
    dispatch({ type: "ADD_FILE", payload: file });
    onFileAdded?.(file);
  };

  const removeFile = (fileId: string) => {
    removeVideoFile(fileId); // 调用VideoContext的方法
    onFileRemoved?.(fileId);
  };

  const updateFile = (fileId: string, updates: Partial<VideoFile>) => {
    dispatch({ type: "UPDATE_FILE", payload: { fileId, updates } });
  };

  const selectFile = (fileId: string | null) => {
    if (fileId) {
      videoSelectFile(fileId); // 调用VideoContext的方法
    }
    const selectedFile = fileId ? getFileById(fileId) : null;
    onFileSelected?.(selectedFile);
  };

  const getFileById = (fileId: string): VideoFile | null => {
    return state.files.find(file => file.id === fileId) || null;
  };

  const getSelectedFile = (): VideoFile | null => {
    return state.selectedFileId ? getFileById(state.selectedFileId) : null;
  };

  // 文件操作
  const previewFile = (fileId: string) => {
    videoPreviewFile(fileId, () => {
      // 从Sources触发播放时，调用playFromSources
      playFromSources();
    }); // 调用VideoContext的方法
  };

  const duplicateFile = (fileId: string) => {
    const originalFile = getFileById(fileId);
    if (originalFile) {
      const duplicatedFile: VideoFile = {
        ...originalFile,
        id: `${originalFile.id}-copy-${Date.now()}`,
        file: originalFile.file, // 保持相同的文件路径
      };
      addFile(duplicatedFile);
    }
  };

  // 排序和过滤
  const setSorting = (sortBy: 'name' | 'duration' | 'dateAdded', sortOrder: 'asc' | 'desc') => {
    dispatch({ type: "SET_SORT", payload: { sortBy, sortOrder } });
  };

  const setFilter = (filterText: string) => {
    dispatch({ type: "SET_FILTER", payload: filterText });
  };

  const getFilteredAndSortedFiles = (): VideoFile[] => {
    let filteredFiles = state.files;

    // 应用过滤
    if (state.filterText) {
      const filterLower = state.filterText.toLowerCase();
      filteredFiles = filteredFiles.filter(file =>
        file.file.toLowerCase().includes(filterLower)
      );
    }

    // 应用排序
    filteredFiles.sort((a, b) => {
      let comparison = 0;
      
      switch (state.sortBy) {
        case 'name':
          comparison = a.file.localeCompare(b.file);
          break;
        case 'duration':
          comparison = (a.properties.duration || 0) - (b.properties.duration || 0);
          break;
        case 'dateAdded':
          // 假设ID包含时间戳，或者可以添加dateAdded字段
          comparison = a.id.localeCompare(b.id);
          break;
      }
      
      return state.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filteredFiles;
  };

  // 视图控制
  const setViewMode = (mode: 'list' | 'grid') => {
    dispatch({ type: "SET_VIEW_MODE", payload: mode });
  };

  const toggleFileDetails = () => {
    dispatch({ type: "TOGGLE_FILE_DETAILS" });
  };

  // 工具方法
  const resetUI = () => {
    dispatch({ type: "RESET_UI" });
  };

  const clearSelection = () => {
    selectFile(null);
  };

  const value: SourcesPanelContextType = {
    state,
    dispatch,
    
    // 文件管理
    addFile,
    removeFile,
    updateFile,
    selectFile,
    getFileById,
    getSelectedFile,
    
    // 文件操作
    previewFile,
    duplicateFile,
    
    // 排序和过滤
    setSorting,
    setFilter,
    getFilteredAndSortedFiles,
    
    // 视图控制
    setViewMode,
    toggleFileDetails,
    
    // 工具方法
    resetUI,
    clearSelection,
    
    // 事件回调
    onFileAdded,
    onFileRemoved,
    onFileSelected,
  };

  return (
    <SourcesPanelContext.Provider value={value}>
      {children}
    </SourcesPanelContext.Provider>
  );
}

export function useSourcesPanel() {
  const context = useContext(SourcesPanelContext);
  if (context === undefined) {
    throw new Error("useSourcesPanel must be used within a SourcesPanelProvider");
  }
  return context;
}