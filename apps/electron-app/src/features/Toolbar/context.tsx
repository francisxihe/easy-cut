import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { useVideo } from '../../contexts/VideoContext';

// 工具栏状态类型
interface ToolbarState {
  isDialogOpen: boolean;
  dialogType: 'save' | 'load' | null;
  lastAction: string | null;
}

// 工具栏操作类型
type ToolbarAction =
  | { type: 'OPEN_DIALOG'; payload: { dialogType: 'save' | 'load' } }
  | { type: 'CLOSE_DIALOG' }
  | { type: 'SET_LAST_ACTION'; payload: string }
  | { type: 'RESET' };

// 工具栏上下文类型
interface ToolbarContextType {
  state: ToolbarState;
  dispatch: React.Dispatch<ToolbarAction>;
  actions: {
    handleAddSource: () => Promise<void>;
    handleRender: () => Promise<void>;
    handleSave: () => Promise<void>;
    handleLoad: () => Promise<void>;
    handleShowPlugins: () => Promise<void>;
    openDialog: (dialogType: 'save' | 'load') => void;
    closeDialog: () => void;
    setLastAction: (action: string) => void;
    reset: () => void;
  };
}

// 初始状态
const initialState: ToolbarState = {
  isDialogOpen: false,
  dialogType: null,
  lastAction: null,
};

// Reducer
const toolbarReducer = (state: ToolbarState, action: ToolbarAction): ToolbarState => {
  switch (action.type) {
    case 'OPEN_DIALOG':
      return {
        ...state,
        isDialogOpen: true,
        dialogType: action.payload.dialogType,
      };
    case 'CLOSE_DIALOG':
      return {
        ...state,
        isDialogOpen: false,
        dialogType: null,
      };
    case 'SET_LAST_ACTION':
      return {
        ...state,
        lastAction: action.payload,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

// 创建上下文
const ToolbarContext = createContext<ToolbarContextType | undefined>(undefined);

// Provider 组件
export const ToolbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(toolbarReducer, initialState);
  const { addVideoFile, startRender } = useVideo();

  // 添加源文件
  const handleAddSource = async () => {
    try {
      dispatch({ type: 'SET_LAST_ACTION', payload: 'addSource' });
      const result = await window.electronAPI.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          {
            name: '视频文件',
            extensions: ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv'],
          },
          { name: '所有文件', extensions: ['*'] },
        ],
      });

      if (!result.canceled && result.filePaths.length > 0) {
        await addVideoFile(result.filePaths[0]);
      }
    } catch (error) {
      console.error('添加视频文件失败:', error);
    }
  };

  // 渲染视频
  const handleRender = async () => {
    try {
      dispatch({ type: 'SET_LAST_ACTION', payload: 'render' });
      await startRender();
    } catch (error) {
      console.error('渲染失败:', error);
      alert(`渲染失败: ${error}`);
    }
  };

  // 保存项目
  const handleSave = async () => {
    try {
      dispatch({ type: 'SET_LAST_ACTION', payload: 'save' });
      const result = await window.electronAPI.dialog.showSaveDialog({
        filters: [
          { name: 'Easy Cut 项目', extensions: ['ecp'] },
          { name: 'JSON 文件', extensions: ['json'] },
        ],
      });

      if (!result.canceled && result.filePath) {
        // TODO: 实现项目保存逻辑
        console.log('保存项目到:', result.filePath);
      }
    } catch (error) {
      console.error('保存项目失败:', error);
    }
  };

  // 加载项目
  const handleLoad = async () => {
    try {
      dispatch({ type: 'SET_LAST_ACTION', payload: 'load' });
      const result = await window.electronAPI.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Easy Cut 项目', extensions: ['ecp'] },
          { name: 'JSON 文件', extensions: ['json'] },
        ],
      });

      if (!result.canceled && result.filePaths.length > 0) {
        // TODO: 实现项目加载逻辑
        console.log('加载项目:', result.filePaths[0]);
      }
    } catch (error) {
      console.error('加载项目失败:', error);
    }
  };

  // 显示插件管理
  const handleShowPlugins = async () => {
    try {
      dispatch({ type: 'SET_LAST_ACTION', payload: 'plugins' });
      await window.electronAPI.plugin.showList();
    } catch (error) {
      console.error('显示插件列表失败:', error);
    }
  };

  // 打开对话框
  const openDialog = (dialogType: 'save' | 'load') => {
    dispatch({ type: 'OPEN_DIALOG', payload: { dialogType } });
  };

  // 关闭对话框
  const closeDialog = () => {
    dispatch({ type: 'CLOSE_DIALOG' });
  };

  // 设置最后操作
  const setLastAction = (action: string) => {
    dispatch({ type: 'SET_LAST_ACTION', payload: action });
  };

  // 重置状态
  const reset = () => {
    dispatch({ type: 'RESET' });
  };

  const contextValue: ToolbarContextType = {
    state,
    dispatch,
    actions: {
      handleAddSource,
      handleRender,
      handleSave,
      handleLoad,
      handleShowPlugins,
      openDialog,
      closeDialog,
      setLastAction,
      reset,
    },
  };

  return (
    <ToolbarContext.Provider value={contextValue}>
      {children}
    </ToolbarContext.Provider>
  );
};

// Hook
export const useToolbar = (): ToolbarContextType => {
  const context = useContext(ToolbarContext);
  if (context === undefined) {
    throw new Error('useToolbar must be used within a ToolbarProvider');
  }
  return context;
};