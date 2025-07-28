import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { useVideo } from '../../contexts/VideoContext';

// 检查器面板状态类型
interface InspectorState {
  activeTab: 'properties' | 'filters' | 'effects';
  isEditing: boolean;
  editingProperty: string | null;
  tempValues: Record<string, any>;
  expandedSections: Set<string>;
}

// 检查器面板操作类型
type InspectorAction =
  | { type: 'SET_ACTIVE_TAB'; payload: 'properties' | 'filters' | 'effects' }
  | { type: 'START_EDITING'; payload: string }
  | { type: 'STOP_EDITING' }
  | { type: 'SET_TEMP_VALUE'; payload: { property: string; value: any } }
  | { type: 'CLEAR_TEMP_VALUES' }
  | { type: 'TOGGLE_SECTION'; payload: string }
  | { type: 'EXPAND_SECTION'; payload: string }
  | { type: 'COLLAPSE_SECTION'; payload: string }
  | { type: 'RESET' };

// 检查器面板上下文类型
interface InspectorContextType {
  state: InspectorState;
  dispatch: React.Dispatch<InspectorAction>;
  actions: {
    setActiveTab: (tab: 'properties' | 'filters' | 'effects') => void;
    startEditing: (property: string) => void;
    stopEditing: () => void;
    setTempValue: (property: string, value: any) => void;
    clearTempValues: () => void;
    toggleSection: (section: string) => void;
    expandSection: (section: string) => void;
    collapseSection: (section: string) => void;
    handlePropertyChange: (property: string, value: any) => void;
    handleFilterAdd: () => void;
    handleFilterRemove: (index: number) => void;
    reset: () => void;
  };
  utils: {
    formatDuration: (seconds: number) => string;
    validateProperty: (property: string, value: any) => boolean;
    getPropertyDisplayName: (property: string) => string;
  };
}

// 初始状态
const initialState: InspectorState = {
  activeTab: 'properties',
  isEditing: false,
  editingProperty: null,
  tempValues: {},
  expandedSections: new Set(['fileInfo', 'timeSettings']),
};

// Reducer
const inspectorReducer = (state: InspectorState, action: InspectorAction): InspectorState => {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        activeTab: action.payload,
      };
    case 'START_EDITING':
      return {
        ...state,
        isEditing: true,
        editingProperty: action.payload,
      };
    case 'STOP_EDITING':
      return {
        ...state,
        isEditing: false,
        editingProperty: null,
      };
    case 'SET_TEMP_VALUE':
      return {
        ...state,
        tempValues: {
          ...state.tempValues,
          [action.payload.property]: action.payload.value,
        },
      };
    case 'CLEAR_TEMP_VALUES':
      return {
        ...state,
        tempValues: {},
      };
    case 'TOGGLE_SECTION': {
      const newExpandedSections = new Set(state.expandedSections);
      if (newExpandedSections.has(action.payload)) {
        newExpandedSections.delete(action.payload);
      } else {
        newExpandedSections.add(action.payload);
      }
      return {
        ...state,
        expandedSections: newExpandedSections,
      };
    }
    case 'EXPAND_SECTION':
      return {
        ...state,
        expandedSections: new Set([...state.expandedSections, action.payload]),
      };
    case 'COLLAPSE_SECTION': {
      const newExpandedSections = new Set(state.expandedSections);
      newExpandedSections.delete(action.payload);
      return {
        ...state,
        expandedSections: newExpandedSections,
      };
    }
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

// 创建上下文
const InspectorContext = createContext<InspectorContextType | undefined>(undefined);

// Provider 组件
export const InspectorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(inspectorReducer, initialState);
  const { state: videoState, updateVideoFile } = useVideo();

  // 设置活动标签
  const setActiveTab = (tab: 'properties' | 'filters' | 'effects') => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };

  // 开始编辑
  const startEditing = (property: string) => {
    dispatch({ type: 'START_EDITING', payload: property });
  };

  // 停止编辑
  const stopEditing = () => {
    dispatch({ type: 'STOP_EDITING' });
  };

  // 设置临时值
  const setTempValue = (property: string, value: any) => {
    dispatch({ type: 'SET_TEMP_VALUE', payload: { property, value } });
  };

  // 清除临时值
  const clearTempValues = () => {
    dispatch({ type: 'CLEAR_TEMP_VALUES' });
  };

  // 切换区域展开/折叠
  const toggleSection = (section: string) => {
    dispatch({ type: 'TOGGLE_SECTION', payload: section });
  };

  // 展开区域
  const expandSection = (section: string) => {
    dispatch({ type: 'EXPAND_SECTION', payload: section });
  };

  // 折叠区域
  const collapseSection = (section: string) => {
    dispatch({ type: 'COLLAPSE_SECTION', payload: section });
  };

  // 处理属性变更
  const handlePropertyChange = (property: string, value: any) => {
    const selectedFile = videoState.workFiles.find(
      (file) => file.id === videoState.selectedFileId
    );
    
    if (selectedFile) {
      updateVideoFile(selectedFile.id, { [property]: value });
    }
  };

  // 添加滤镜
  const handleFilterAdd = async () => {
    try {
      await window.electronAPI.plugin.open('filter');
    } catch (error) {
      console.error('打开滤镜插件失败:', error);
    }
  };

  // 移除滤镜
  const handleFilterRemove = (index: number) => {
    const selectedFile = videoState.workFiles.find(
      (file) => file.id === videoState.selectedFileId
    );
    
    if (selectedFile && selectedFile.properties.filters) {
      const newFilters = selectedFile.properties.filters.filter((_, i) => i !== index);
      handlePropertyChange('filters', newFilters);
    }
  };

  // 重置状态
  const reset = () => {
    dispatch({ type: 'RESET' });
  };

  // 格式化时长
  const formatDuration = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return 'N/A';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }
  };

  // 验证属性值
  const validateProperty = (property: string, value: any): boolean => {
    switch (property) {
      case 'seek':
      case 'duration':
        return typeof value === 'number' && value >= 0;
      case 'filters':
        return Array.isArray(value);
      default:
        return true;
    }
  };

  // 获取属性显示名称
  const getPropertyDisplayName = (property: string): string => {
    const displayNames: Record<string, string> = {
      seek: '开始时间',
      duration: '持续时间',
      filters: '滤镜',
      effects: '特效',
    };
    return displayNames[property] || property;
  };

  const contextValue: InspectorContextType = {
    state,
    dispatch,
    actions: {
      setActiveTab,
      startEditing,
      stopEditing,
      setTempValue,
      clearTempValues,
      toggleSection,
      expandSection,
      collapseSection,
      handlePropertyChange,
      handleFilterAdd,
      handleFilterRemove,
      reset,
    },
    utils: {
      formatDuration,
      validateProperty,
      getPropertyDisplayName,
    },
  };

  return (
    <InspectorContext.Provider value={contextValue}>
      {children}
    </InspectorContext.Provider>
  );
};

// Hook
export const useInspector = (): InspectorContextType => {
  const context = useContext(InspectorContext);
  if (context === undefined) {
    throw new Error('useInspector must be used within an InspectorProvider');
  }
  return context;
};