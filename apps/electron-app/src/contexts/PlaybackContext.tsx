import React, { createContext, useContext, useReducer, useRef, useEffect, useCallback } from "react";

// 播放源类型
type PlaybackSource = 'sources' | 'timeline';

// 播放状态类型
interface PlaybackState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  playbackRate: number;
  videoError: string | null;
  playbackSource: PlaybackSource; // 当前播放源
  timelinePosition: number; // 时间轴播放位置
}

// 播放操作类型
type PlaybackAction =
  | { type: "SET_CURRENT_TIME"; payload: number }
  | { type: "SET_DURATION"; payload: number }
  | { type: "SET_PLAYING"; payload: boolean }
  | { type: "SET_VOLUME"; payload: number }
  | { type: "SET_MUTED"; payload: boolean }
  | { type: "SET_PLAYBACK_RATE"; payload: number }
  | { type: "SET_VIDEO_ERROR"; payload: string | null }
  | { type: "SET_PLAYBACK_SOURCE"; payload: PlaybackSource }
  | { type: "SET_TIMELINE_POSITION"; payload: number }
  | { type: "RESET_STATE" };

// 播放上下文类型
interface PlaybackContextType {
  state: PlaybackState;
  videoRef: React.RefObject<HTMLVideoElement>;
  // 状态更新函数
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setVideoError: (error: string | null) => void;
  setPlaybackSource: (source: PlaybackSource) => void;
  setTimelinePosition: (position: number) => void;
  resetState: () => void;
  // 播放控制函数
  play: () => void;
  pause: () => void;
  handlePlayPause: () => void;
  playFromSources: () => void; // Sources播放
  playFromTimeline: (position?: number) => void; // Timeline播放
  seek: (time: number) => void;
  // 事件处理函数
  handleTimeUpdate: () => void;
  handleLoadedMetadata: () => void;
  handleVideoEnded: () => void;
  handleVideoError: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
  handleCanPlay: () => void;
  handleLoadStart: () => void;
  handleLoadedData: () => void;
  handleWaiting: () => void;
  handlePlaying: () => void;
  handlePause: () => void;
  // 工具函数
  formatTime: (time: number) => string;
}

const initialState: PlaybackState = {
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  volume: 1,
  muted: false,
  playbackRate: 1,
  videoError: null,
  playbackSource: 'sources',
  timelinePosition: 0,
};

function playbackReducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
  switch (action.type) {
    case "SET_CURRENT_TIME":
      return { ...state, currentTime: action.payload };
    case "SET_DURATION":
      return { ...state, duration: action.payload };
    case "SET_PLAYING":
      return { ...state, isPlaying: action.payload };
    case "SET_VOLUME":
      return { ...state, volume: action.payload };
    case "SET_MUTED":
      return { ...state, muted: action.payload };
    case "SET_PLAYBACK_RATE":
      return { ...state, playbackRate: action.payload };
    case "SET_VIDEO_ERROR":
      return { ...state, videoError: action.payload };
    case "SET_PLAYBACK_SOURCE":
      return { ...state, playbackSource: action.payload };
    case "SET_TIMELINE_POSITION":
      return { ...state, timelinePosition: action.payload };
    case "RESET_STATE":
      return initialState;
    default:
      return state;
  }
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export const PlaybackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(playbackReducer, initialState);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 状态更新函数
  const setCurrentTime = useCallback((time: number) => {
    dispatch({ type: "SET_CURRENT_TIME", payload: time });
  }, []);

  const setDuration = useCallback((duration: number) => {
    dispatch({ type: "SET_DURATION", payload: duration });
  }, []);

  const setPlaying = useCallback((playing: boolean) => {
    dispatch({ type: "SET_PLAYING", payload: playing });
  }, []);

  const setVolume = (volume: number) => {
    dispatch({ type: "SET_VOLUME", payload: volume });
  };

  const setMuted = (muted: boolean) => {
    dispatch({ type: "SET_MUTED", payload: muted });
  };

  const setPlaybackRate = (rate: number) => {
    dispatch({ type: "SET_PLAYBACK_RATE", payload: rate });
  };

  const setVideoError = (error: string | null) => {
    dispatch({ type: "SET_VIDEO_ERROR", payload: error });
  };

  const setPlaybackSource = (source: PlaybackSource) => {
    dispatch({ type: "SET_PLAYBACK_SOURCE", payload: source });
  };

  const setTimelinePosition = (position: number) => {
    dispatch({ type: "SET_TIMELINE_POSITION", payload: position });
  };

  const resetState = () => {
    dispatch({ type: "RESET_STATE" });
  };

  // 播放控制函数
  const play = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play();
      setPlaying(true);
    }
  }, [setPlaying]);

  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setPlaying(false);
    }
  }, [setPlaying]);

  const handlePlayPause = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, pause, play]);

  // Sources播放 - 播放当前选中的视频文件
  const playFromSources = () => {
    setPlaybackSource('sources');
    play();
  };

  // Timeline播放 - 从指定位置播放时间轴
  const playFromTimeline = (position?: number) => {
    setPlaybackSource('timeline');
    if (position !== undefined) {
      setTimelinePosition(position);
      seek(position);
    }
    play();
  };

  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, [setCurrentTime]);

  // 格式化时间显示
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // 事件处理函数
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      console.log("Video metadata loaded:", {
        duration: videoRef.current.duration,
        videoWidth: videoRef.current.videoWidth,
        videoHeight: videoRef.current.videoHeight,
        readyState: videoRef.current.readyState,
      });
    }
  };

  const handleVideoEnded = () => {
    setPlaying(false);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    const error = video.error;
    console.error("Video error:", error);
    setVideoError(error ? `视频加载错误: ${error.message}` : "未知视频错误");
    setPlaying(false);
  };

  const handleCanPlay = () => {
    console.log("Video can play");
    setVideoError(null);
  };

  const handleLoadStart = () => {
    console.log("Video load start");
    setVideoError(null);
  };

  const handleLoadedData = () => {
    console.log("Video loaded data");
  };

  const handleWaiting = () => {
    console.log("Video waiting");
  };

  const handlePlaying = () => {
    console.log("Video playing");
    setPlaying(true);
  };

  const handlePause = () => {
    console.log("Video paused");
    setPlaying(false);
  };

  // 同步视频元素的属性
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = state.volume;
      videoRef.current.muted = state.muted;
      videoRef.current.playbackRate = state.playbackRate;
    }
  }, [state.volume, state.muted, state.playbackRate]);

  const contextValue: PlaybackContextType = {
    state,
    videoRef,
    setCurrentTime,
    setDuration,
    setPlaying,
    setVolume,
    setMuted,
    setPlaybackRate,
    setVideoError,
    setPlaybackSource,
    setTimelinePosition,
    resetState,
    play,
    pause,
    handlePlayPause,
    playFromSources,
    playFromTimeline,
    seek,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleVideoEnded,
    handleVideoError,
    handleCanPlay,
    handleLoadStart,
    handleLoadedData,
    handleWaiting,
    handlePlaying,
    handlePause,
    formatTime,
  };

  return (
    <PlaybackContext.Provider value={contextValue}>
      {children}
    </PlaybackContext.Provider>
  );
};

export const usePlayback = (): PlaybackContextType => {
  const context = useContext(PlaybackContext);
  if (context === undefined) {
    throw new Error("usePlayback must be used within a PlaybackProvider");
  }
  return context;
};