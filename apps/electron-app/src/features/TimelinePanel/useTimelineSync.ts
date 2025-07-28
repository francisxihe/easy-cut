import { useEffect } from 'react';
import { useVideo } from '../../contexts/VideoContext';
import { useTimeline } from './context';

/**
 * 用于同步VideoContext和TimelineContext的Hook
 * 当VideoContext中的workFiles发生变化时，自动更新时间轴
 */
export function useTimelineSync() {
  const { state: videoState } = useVideo();
  const { state: timelineState, removeClip, getClipById, resetTimeline } = useTimeline();

  // 同步视频文件到时间轴（仅处理删除的文件）
  useEffect(() => {
    // 获取当前视频文件的ID
    const currentVideoFileIds = new Set(videoState.workFiles.map(file => file.id));

    // 移除已删除的视频文件对应的片段
    timelineState.tracks.forEach(track => {
      track.clips.forEach(clip => {
        if (!currentVideoFileIds.has(clip.sourceFileId)) {
          removeClip(clip.id);
        }
      });
    });
  }, [videoState.workFiles, timelineState.tracks, removeClip]);

  // 当视频项目重置时，重置时间轴
  useEffect(() => {
    if (videoState.workFiles.length === 0 && timelineState.tracks.some(track => track.clips.length > 0)) {
      // 只有当时间轴有片段但视频文件为空时才重置
      // 这避免了初始化时的不必要重置
      resetTimeline();
    }
  }, [videoState.workFiles.length, timelineState.tracks, resetTimeline]);

  return {
    // 提供一些便捷方法
    getVideoFileByClipId: (clipId: string) => {
      const clip = getClipById(clipId);
      if (!clip) return null;
      return videoState.workFiles.find(file => file.id === clip.sourceFileId) || null;
    },
    
    getClipsByVideoFileId: (videoFileId: string) => {
      return timelineState.tracks.flatMap(track => 
        track.clips.filter(clip => clip.sourceFileId === videoFileId)
      );
    },
  };
}