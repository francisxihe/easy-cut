import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useVideo } from "../../contexts/VideoContext";


// 时间轴片段接口
export interface TimelineClip {
  id: string;
  name: string;
  sourceFileId: string; // 关联的视频文件ID
  startTime: number; // 在时间轴上的开始时间
  duration: number; // 片段时长
  trimStart: number; // 裁剪开始时间
  trimEnd: number; // 裁剪结束时间
  visible: boolean; // 是否可见
}

// 时间轴轨道接口
export interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'audio';
  clips: TimelineClip[];
  height: number; // 轨道高度
  visible: boolean; // 是否可见
  muted: boolean; // 是否静音
}

// 时间轴完整状态（包含数据和UI状态）
export interface TimelineState {
  // 数据状态
  tracks: TimelineTrack[];
  duration: number; // 时间轴总时长
  
  // UI状态
  position: number; // 播放头位置
  zoom: number; // 缩放级别 (0.1 - 10)
  selectedClipIds: string[]; // 选中的片段ID列表
  isPlaying: boolean; // 是否正在播放
  snapToGrid: boolean; // 是否吸附到网格
  gridSize: number; // 网格大小（秒）
}

type TimelineAction =
  // 数据操作
  | { type: "ADD_TRACK"; payload: { name: string; type: 'video' | 'audio' } }
  | { type: "REMOVE_TRACK"; payload: string }
  | { type: "UPDATE_TRACK"; payload: { trackId: string; updates: Partial<TimelineTrack> } }
  | { type: "ADD_CLIP"; payload: { trackId: string; clip: TimelineClip } }
  | { type: "REMOVE_CLIP"; payload: string }
  | { type: "UPDATE_CLIP"; payload: { clipId: string; updates: Partial<TimelineClip> } }
  | { type: "MOVE_CLIP"; payload: { clipId: string; trackId: string; startTime: number } }
  | { type: "CALCULATE_DURATION" }
  | { type: "RESET_TIMELINE" }
  // UI操作
  | { type: "SELECT_CLIPS"; payload: string[] }
  | { type: "SET_POSITION"; payload: number }
  | { type: "SET_ZOOM"; payload: number }
  | { type: "SET_PLAYING"; payload: boolean }
  | { type: "SET_SNAP_TO_GRID"; payload: boolean }
  | { type: "SET_GRID_SIZE"; payload: number }
  | { type: "RESET_UI" };

const initialState: TimelineState = {
  // 数据状态
  tracks: [
    {
      id: 'video-track-1',
      name: '视频轨道 1',
      type: 'video',
      clips: [],
      height: 60,
      visible: true,
      muted: false,
    },
  ],
  duration: 0,
  
  // UI状态
  position: 0,
  zoom: 1,
  selectedClipIds: [],
  isPlaying: false,
  snapToGrid: true,
  gridSize: 1, // 1秒网格
};

function timelineReducer(state: TimelineState, action: TimelineAction): TimelineState {
  switch (action.type) {
    // 数据操作
    case "ADD_TRACK": {
      const newTrack: TimelineTrack = {
        id: `${action.payload.type}-track-${Date.now()}`,
        name: action.payload.name,
        type: action.payload.type,
        clips: [],
        height: 60,
        visible: true,
        muted: false,
      };
      return {
        ...state,
        tracks: [...state.tracks, newTrack],
      };
    }

    case "REMOVE_TRACK": {
      return {
        ...state,
        tracks: state.tracks.filter(track => track.id !== action.payload),
      };
    }

    case "UPDATE_TRACK": {
      return {
        ...state,
        tracks: state.tracks.map(track =>
          track.id === action.payload.trackId
            ? { ...track, ...action.payload.updates }
            : track
        ),
      };
    }

    case "ADD_CLIP": {
      return {
        ...state,
        tracks: state.tracks.map(track =>
          track.id === action.payload.trackId
            ? { ...track, clips: [...track.clips, {
                ...action.payload.clip,
                id: action.payload.clip.id || `clip-${Date.now()}`,
                name: action.payload.clip.name || 'Untitled',
                sourceFileId: action.payload.clip.sourceFileId || '',
                duration: action.payload.clip.duration || 0,
                trimStart: action.payload.clip.trimStart || 0,
                trimEnd: action.payload.clip.trimEnd || 0,
                visible: action.payload.clip.visible !== undefined ? action.payload.clip.visible : true
              }] }
            : track
        ),
      };
    }

    case "REMOVE_CLIP": {
      return {
        ...state,
        tracks: state.tracks.map(track => ({
          ...track,
          clips: track.clips.filter(clip => clip.id !== action.payload),
        })),
        selectedClipIds: state.selectedClipIds.filter(id => id !== action.payload),
      };
    }

    case "UPDATE_CLIP": {
      return {
        ...state,
        tracks: state.tracks.map(track => ({
          ...track,
          clips: track.clips.map(clip =>
            clip.id === action.payload.clipId
              ? { ...clip, ...action.payload.updates }
              : clip
          ),
        })),
      };
    }

    case "MOVE_CLIP": {
      const { clipId, trackId, startTime } = action.payload;
      let clipToMove: TimelineClip | null = null;
      
      // 从原轨道移除片段
      const tracksWithoutClip = state.tracks.map(track => ({
        ...track,
        clips: track.clips.filter(clip => {
          if (clip.id === clipId) {
            clipToMove = clip;
            return false;
          }
          return true;
        }),
      }));
      
      if (!clipToMove) return state;
      
      // 添加到新轨道
      return {
        ...state,
        tracks: tracksWithoutClip.map(track =>
          track.id === trackId
            ? {
                ...track,
                clips: [...track.clips, { ...clipToMove!, startTime }],
              }
            : track
        ),
      };
    }

    case "CALCULATE_DURATION": {
      const maxEndTime = state.tracks.reduce((max, track) => {
        const trackMaxEnd = track.clips.reduce((trackMax, clip) => {
          return Math.max(trackMax, clip.startTime + clip.duration);
        }, 0);
        return Math.max(max, trackMaxEnd);
      }, 0);
      
      return {
        ...state,
        duration: maxEndTime,
      };
    }

    case "RESET_TIMELINE": {
      return {
        ...state,
        tracks: initialState.tracks,
        duration: 0,
        selectedClipIds: [],
        position: 0,
      };
    }

    // UI操作
    case "SELECT_CLIPS": {
      return {
        ...state,
        selectedClipIds: action.payload,
      };
    }

    case "SET_POSITION": {
      return {
        ...state,
        position: Math.max(0, Math.min(action.payload, state.duration)),
      };
    }

    case "SET_ZOOM": {
      return {
        ...state,
        zoom: Math.max(0.1, Math.min(10, action.payload)),
      };
    }

    case "SET_PLAYING": {
      return {
        ...state,
        isPlaying: action.payload,
      };
    }

    case "SET_SNAP_TO_GRID": {
      return {
        ...state,
        snapToGrid: action.payload,
      };
    }

    case "SET_GRID_SIZE": {
      return {
        ...state,
        gridSize: Math.max(0.1, action.payload),
      };
    }

    case "RESET_UI": {
      return {
        ...state,
        position: 0,
        selectedClipIds: [],
        isPlaying: false,
        zoom: 1,
        snapToGrid: true,
        gridSize: 1,
      };
    }

    default:
      return state;
  }
}

interface TimelineContextType {
  state: TimelineState;
  dispatch: React.Dispatch<TimelineAction>;

  // 轨道管理
  addTrack: (name: string, type: 'video' | 'audio') => void;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<TimelineTrack>) => void;
  getTrackById: (trackId: string) => TimelineTrack | null;

  // 片段管理
  addClipFromFile: (fileId: string, trackId: string, startTime?: number) => void;
  removeClip: (clipId: string) => void;
  updateClip: (clipId: string, updates: Partial<TimelineClip>) => void;
  moveClip: (clipId: string, trackId: string, startTime: number) => void;
  getClipById: (clipId: string) => TimelineClip | null;

  // 选择操作
  selectClips: (clipIds: string[]) => void;
  selectClip: (clipId: string) => void;
  clearSelection: () => void;
  getSelectedClips: () => TimelineClip[];

  // 播放控制
  setPosition: (position: number) => void;
  setPlaying: (playing: boolean) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;

  // 视图控制
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToWindow: () => void;

  // 网格控制
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;

  // 工具方法
  resetTimeline: () => void;
  resetUI: () => void;

  // 事件回调（供外部监听）
  onClipAdded?: (clip: TimelineClip) => void;
  onClipRemoved?: (clipId: string) => void;
  onTrackAdded?: (track: TimelineTrack) => void;
  onTrackRemoved?: (trackId: string) => void;
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

export function TimelineProvider({ 
  children,
  onClipAdded,
  onClipRemoved,
  onTrackAdded,
  onTrackRemoved 
}: { 
  children: ReactNode;
  onClipAdded?: (clip: TimelineClip) => void;
  onClipRemoved?: (clipId: string) => void;
  onTrackAdded?: (track: TimelineTrack) => void;
  onTrackRemoved?: (trackId: string) => void;
}) {
  const [state, dispatch] = useReducer(timelineReducer, initialState);
  const { state: videoState } = useVideo();

  // 自动计算时间轴总时长
  useEffect(() => {
    dispatch({ type: "CALCULATE_DURATION" });
  }, [state.tracks]);

  // 轨道管理
  const addTrack = (name: string, type: 'video' | 'audio') => {
    dispatch({ type: "ADD_TRACK", payload: { name, type } });
    // 触发事件回调
    if (onTrackAdded) {
      const newTrack: TimelineTrack = {
        id: `${type}-track-${Date.now()}`,
        name,
        type,
        clips: [],
        height: 60,
        visible: true,
        muted: false,
      };
      onTrackAdded(newTrack);
    }
  };

  const removeTrack = (trackId: string) => {
    dispatch({ type: "REMOVE_TRACK", payload: trackId });
    onTrackRemoved?.(trackId);
  };

  const updateTrack = (trackId: string, updates: Partial<TimelineTrack>) => {
    dispatch({ type: "UPDATE_TRACK", payload: { trackId, updates } });
  };

  const getTrackById = (trackId: string): TimelineTrack | null => {
    return state.tracks.find(track => track.id === trackId) || null;
  };

  // 片段管理
  const addClipFromFile = (fileId: string, trackId: string, startTime = 0) => {
    const videoFile = videoState.workFiles.find(file => file.id === fileId);
    if (!videoFile) {
      console.error('找不到指定的视频文件:', fileId);
      return;
    }

    const newClip: TimelineClip = {
      id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: videoFile.file.split('/').pop() || 'Unknown',
      sourceFileId: videoFile.id,
      startTime,
      duration: videoFile.properties.duration || 0,
      trimStart: 0,
      trimEnd: videoFile.properties.duration || 0,
      visible: true,
    };
    
    dispatch({ type: "ADD_CLIP", payload: { trackId, clip: newClip } });
    onClipAdded?.(newClip);
  };

  const removeClip = (clipId: string) => {
    dispatch({ type: "REMOVE_CLIP", payload: clipId });
    onClipRemoved?.(clipId);
  };

  const updateClip = (clipId: string, updates: Partial<TimelineClip>) => {
    dispatch({ type: "UPDATE_CLIP", payload: { clipId, updates } });
  };

  const moveClip = (clipId: string, trackId: string, startTime: number) => {
    dispatch({ type: "MOVE_CLIP", payload: { clipId, trackId, startTime } });
  };

  const getClipById = (clipId: string): TimelineClip | null => {
    for (const track of state.tracks) {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip) return clip;
    }
    return null;
  };

  // 选择操作
  const selectClips = (clipIds: string[]) => {
    dispatch({ type: "SELECT_CLIPS", payload: clipIds });
  };

  const selectClip = (clipId: string) => {
    dispatch({ type: "SELECT_CLIPS", payload: [clipId] });
  };

  const clearSelection = () => {
    dispatch({ type: "SELECT_CLIPS", payload: [] });
  };

  const getSelectedClips = (): TimelineClip[] => {
    return state.selectedClipIds.map(id => getClipById(id)).filter(Boolean) as TimelineClip[];
  };

  // 播放控制
  const setPosition = useCallback((position: number) => {
    dispatch({ type: "SET_POSITION", payload: position });
  }, [dispatch]);

  const setPlaying = useCallback((playing: boolean) => {
    dispatch({ type: "SET_PLAYING", payload: playing });
  }, [dispatch]);

  const play = useCallback(() => {
    dispatch({ type: "SET_PLAYING", payload: true });
  }, [dispatch]);

  const pause = useCallback(() => {
    dispatch({ type: "SET_PLAYING", payload: false });
  }, [dispatch]);

  const stop = useCallback(() => {
    dispatch({ type: "SET_PLAYING", payload: false });
    dispatch({ type: "SET_POSITION", payload: 0 });
  }, [dispatch]);

  // 视图控制
  const setZoom = (zoom: number) => {
    dispatch({ type: "SET_ZOOM", payload: zoom });
  };

  const zoomIn = () => {
    dispatch({ type: "SET_ZOOM", payload: state.zoom * 1.2 });
  };

  const zoomOut = () => {
    dispatch({ type: "SET_ZOOM", payload: state.zoom / 1.2 });
  };

  const fitToWindow = () => {
    // 根据时间轴总时长和窗口宽度计算合适的缩放级别
    // 这里简化处理，实际应该根据容器宽度计算
    dispatch({ type: "SET_ZOOM", payload: 1 });
  };

  // 网格控制
  const setSnapToGrid = (snap: boolean) => {
    dispatch({ type: "SET_SNAP_TO_GRID", payload: snap });
  };

  const setGridSize = (size: number) => {
    dispatch({ type: "SET_GRID_SIZE", payload: size });
  };

  // 工具方法
  const resetTimeline = () => {
    dispatch({ type: "RESET_TIMELINE" });
  };

  const resetUI = () => {
    dispatch({ type: "RESET_UI" });
  };

  const value: TimelineContextType = {
    state,
    dispatch,
    addTrack,
    removeTrack,
    updateTrack,
    getTrackById,
    addClipFromFile,
    removeClip,
    updateClip,
    moveClip,
    getClipById,
    selectClips,
    selectClip,
    clearSelection,
    getSelectedClips,
    setPosition,
    setPlaying,
    play,
    pause,
    stop,
    setZoom,
    zoomIn,
    zoomOut,
    fitToWindow,
    setSnapToGrid,
    setGridSize,
    resetTimeline,
    resetUI,
    onClipAdded,
    onClipRemoved,
    onTrackAdded,
    onTrackRemoved,
  };

  return (
    <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>
  );
}

export function useTimeline() {
  const context = useContext(TimelineContext);
  if (context === undefined) {
    throw new Error("useTimeline must be used within a TimelineProvider");
  }
  return context;
}