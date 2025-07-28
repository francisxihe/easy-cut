import React, { useRef, useEffect } from "react";
import { Card, Button, Space, Typography, Message } from "@arco-design/web-react";
import {
  IconZoomIn,
  IconZoomOut,
  IconSkipPrevious,
  IconPlayArrow,
  IconPause,
  IconSkipNext,
  IconDelete,
} from "@arco-design/web-react/icon";
import { useTimeline } from "./context";
import { useTimelineSync } from "./useTimelineSync";
import { usePlayback } from "../../contexts/PlaybackContext";

const { Text } = Typography;

const TimelinePanel: React.FC = () => {
  const { 
    state: timelineState, 
    setPosition, 
    selectClips, 
    setZoom,
    removeClip,
    addClipFromFile,
    play,
    pause,
    setPlaying
  } = useTimeline();
  
  const { 
    state: playbackState,
    handlePlayPause: playbackHandlePlayPause,
    seek
  } = usePlayback();
  
  // 从TimelineContext获取时间轴数据
  const tracks = timelineState.tracks;
  const timelineDuration = timelineState.duration;

  // 拖拽处理函数
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'video-file') {
        // 计算拖拽位置对应的时间
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const timelineWidth = rect.width;
        const dropTime = (x / timelineWidth) * timelineDuration;
        
        // 添加片段到轨道
        addClipFromFile(data.fileId, trackId, Math.max(0, dropTime));
      }
    } catch (error) {
      console.error('拖拽数据解析失败:', error);
    }
  };
  
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // 键盘快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (timelineState.selectedClipIds.length > 0) {
          e.preventDefault();
          handleDeleteSelectedClips();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [timelineState.selectedClipIds]);
  
  const handleDeleteSelectedClips = () => {
    if (timelineState.selectedClipIds.length === 0) return;
    
    timelineState.selectedClipIds.forEach(clipId => {
      removeClip(clipId);
    });
    
    Message.success(`已删除 ${timelineState.selectedClipIds.length} 个片段`);
    selectClips([]);
  };
  
  // 处理时间轴点击跳转
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (timelineDuration === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const timelineWidth = rect.width;
    const clickTime = Math.max(0, Math.min((x / timelineWidth) * timelineDuration, timelineDuration));
    
    // 更新时间轴位置
    setPosition(clickTime);
    // 同步视频播放时间
    seek(clickTime);
  };
  
  // 播放头拖拽状态
  const [isDraggingPlayhead, setIsDraggingPlayhead] = React.useState(false);
  
  // 处理播放头拖拽
  const handlePlayheadMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingPlayhead(true);
  };
  
  // 处理拖拽过程中的鼠标移动
  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDraggingPlayhead || !timelineRef.current || timelineDuration === 0) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const timelineWidth = rect.width;
    const newTime = Math.max(0, Math.min((x / timelineWidth) * timelineDuration, timelineDuration));
    
    setPosition(newTime);
    seek(newTime);
  }, [isDraggingPlayhead, timelineDuration, setPosition, seek]);
  
  // 处理拖拽结束
  const handleMouseUp = React.useCallback(() => {
    setIsDraggingPlayhead(false);
  }, []);
  
  // 添加全局鼠标事件监听
  useEffect(() => {
    if (isDraggingPlayhead) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingPlayhead, handleMouseMove, handleMouseUp]);
  
  // 同步视频文件和时间轴数据
  // const { getVideoFileByClipId } = useTimelineSync();
  useTimelineSync();
  
  // 同步播放时间和时间轴位置
  useEffect(() => {
    if (playbackState.currentTime !== timelineState.position) {
      setPosition(playbackState.currentTime);
    }
  }, [playbackState.currentTime, timelineState.position, setPosition]);
  
  // 同步播放状态
  useEffect(() => {
    if (playbackState.isPlaying !== timelineState.isPlaying) {
      setPlaying(playbackState.isPlaying);
    }
  }, [playbackState.isPlaying, timelineState.isPlaying, setPlaying]);
  
  // 播放时自动停止在时间轴末尾
  useEffect(() => {
    if (timelineState.isPlaying && timelineState.position >= timelineDuration && timelineDuration > 0) {
      pause();
      setPosition(timelineDuration);
      seek(timelineDuration);
    }
  }, [timelineState.isPlaying, timelineState.position, timelineDuration, pause, setPosition, seek]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="timeline-panel" style={{ padding: "8px", height: "100%" }}>
      <Card
        title={
          <Space>
            <span>时间轴</span>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              总时长: {formatTime(timelineDuration)}
            </Text>
          </Space>
        }
        size="small"
        style={{ height: "100%" }}
        bodyStyle={{
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          height: "calc(100% - 40px)",
        }}
      >
        {/* 时间刻度尺 */}
        <div
          style={{
            height: "30px",
            borderBottom: "1px solid var(--color-border-2)",
            marginBottom: "8px",
            position: "relative",
            backgroundColor: "var(--color-bg-1)",
          }}
        >
          <div
            style={{ display: "flex", height: "100%", position: "relative" }}
          >
            {Array.from({ length: 11 }, (_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${(i / 10) * 100}%`,
                  height: "100%",
                  borderLeft: "1px solid var(--color-border-3)",
                  paddingLeft: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: "10px", color: "var(--color-text-3)" }}
                >
                  {formatTime((timelineDuration / 10) * i)}
                </Text>
              </div>
            ))}
          </div>
        </div>

        {/* 时间轴轨道 */}
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          style={{
            flex: 1,
            position: "relative",
            backgroundColor: "var(--color-bg-2)",
            borderRadius: "4px",
            padding: "8px",
            cursor: "pointer",
          }}
        >
          <div style={{ marginBottom: "8px" }}>
            <Text style={{ fontSize: "12px", fontWeight: 500 }}>视频轨道</Text>
          </div>

          {/* 渲染所有轨道 */}
          {tracks.map((track) => (
            <div key={track.id} style={{ marginBottom: "8px" }}>
              <div style={{ marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Text style={{ fontSize: "12px", fontWeight: 500 }}>{track.name}</Text>
                <Text style={{ fontSize: "10px", color: "var(--color-text-3)" }}>({track.clips.length} 片段)</Text>
              </div>
              
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, track.id)}
                style={{
                  height: `${track.height}px`,
                  backgroundColor: "var(--color-bg-3)",
                  borderRadius: "4px",
                  position: "relative",
                  border: "1px dashed var(--color-border-2)",
                  opacity: track.visible ? 1 : 0.5,
                }}
              >
                {track.clips.map((clip) => {
                  const width = timelineDuration > 0 
                    ? (clip.duration / timelineDuration) * 100 
                    : 10;
                  const left = timelineDuration > 0 
                    ? (clip.startTime / timelineDuration) * 100 
                    : 0;
                  const isSelected = timelineState.selectedClipIds.includes(clip.id);

                  return (
                    <div
                      key={clip.id}
                      style={{
                        position: "absolute",
                        width: `${Math.max(width, 2)}%`,
                        left: `${left}%`,
                        height: `${track.height - 10}px`,
                        top: "5px",
                        backgroundColor: isSelected
                          ? "var(--color-primary-6)"
                          : "var(--color-primary-3)",
                        borderRadius: "4px",
                        cursor: "pointer",
                        border: isSelected
                          ? "2px solid var(--color-primary-6)"
                          : "1px solid var(--color-primary-4)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        padding: "4px 8px",
                        overflow: "hidden",
                        transition: "all 0.2s",
                        opacity: clip.visible ? 1 : 0.5,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (e.ctrlKey || e.metaKey) {
                          // 多选模式
                          const newSelection = isSelected
                            ? timelineState.selectedClipIds.filter(id => id !== clip.id)
                            : [...timelineState.selectedClipIds, clip.id];
                          selectClips(newSelection);
                        } else {
                          selectClips([clip.id]);
                        }
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (!isSelected) {
                          selectClips([clip.id]);
                        }
                        // 显示右键菜单
                        const menu = document.createElement('div');
                        menu.style.cssText = `
                          position: fixed;
                          top: ${e.clientY}px;
                          left: ${e.clientX}px;
                          background: var(--color-bg-popup);
                          border: 1px solid var(--color-border-2);
                          border-radius: 4px;
                          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                          z-index: 1000;
                          padding: 4px 0;
                        `;
                        
                        const deleteItem = document.createElement('div');
                        deleteItem.style.cssText = `
                          padding: 8px 16px;
                          cursor: pointer;
                          font-size: 12px;
                          color: var(--color-text-1);
                          display: flex;
                          align-items: center;
                          gap: 8px;
                        `;
                        deleteItem.innerHTML = '🗑️ 删除片段';
                        deleteItem.onmouseover = () => deleteItem.style.backgroundColor = 'var(--color-bg-3)';
                        deleteItem.onmouseout = () => deleteItem.style.backgroundColor = 'transparent';
                        deleteItem.onclick = () => {
                          handleDeleteSelectedClips();
                          document.body.removeChild(menu);
                        };
                        
                        menu.appendChild(deleteItem);
                        document.body.appendChild(menu);
                        
                        const removeMenu = () => {
                          if (document.body.contains(menu)) {
                            document.body.removeChild(menu);
                          }
                        };
                        
                        setTimeout(() => {
                          document.addEventListener('click', removeMenu, { once: true });
                        }, 0);
                      }}
                    >
                      <Text
                        style={{
                          fontSize: "11px",
                          color: "#fff",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {clip.name}
                      </Text>
                      {track.height > 40 && (
                        <Text
                          style={{
                            fontSize: "10px",
                            color: "rgba(255,255,255,0.8)",
                            marginTop: "2px",
                          }}
                        >
                          {formatTime(clip.duration)}
                        </Text>
                      )}
                    </div>
                  );
                })}

                {track.clips.length === 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      color: "var(--color-text-3)",
                      pointerEvents: "none",
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      拖拽视频文件到此轨道
                    </Text>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* 播放头 */}
          {timelineDuration > 0 && (
            <div
              style={{
                position: "absolute",
                left: `${(timelineState.position / timelineDuration) * 100}%`,
                top: "38px",
                width: "2px",
                height: `${tracks.reduce((total, track) => total + track.height + 8, 0)}px`,
                backgroundColor: "var(--color-danger-6)",
                zIndex: 10,
                cursor: isDraggingPlayhead ? "grabbing" : "grab",
                transform: "translateX(-1px)", // 居中对齐
              }}
              onMouseDown={handlePlayheadMouseDown}
            >
              {/* 播放头顶部的三角形指示器 */}
              <div
                style={{
                  position: "absolute",
                  top: "-8px",
                  left: "-6px",
                  width: "0",
                  height: "0",
                  borderLeft: "6px solid transparent",
                  borderRight: "6px solid transparent",
                  borderBottom: "8px solid var(--color-danger-6)",
                  cursor: "inherit",
                }}
              />
              {/* 播放头底部的小圆点 */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-4px",
                  left: "-3px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-danger-6)",
                  cursor: "inherit",
                }}
              />
            </div>
          )}
        </div>

        {/* 控制面板 */}
        <div
          style={{
            marginTop: "12px",
            borderTop: "1px solid var(--color-border-2)",
            paddingTop: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space>
            <Text
              style={{
                fontSize: "12px",
                color: "var(--color-text-2)",
                minWidth: "80px",
              }}
            >
              {formatTime(timelineState.position)} / {formatTime(timelineDuration)}
            </Text>
            <div style={{ width: "1px", height: "16px", backgroundColor: "var(--color-border-2)" }} />
            <Button 
              type="text" 
              size="small" 
              icon={<IconZoomOut />} 
              onClick={() => setZoom(Math.max(0.1, timelineState.zoom - 0.1))}
            />
            <Text
              style={{
                fontSize: "12px",
                minWidth: "40px",
                textAlign: "center",
              }}
            >
              {Math.round(timelineState.zoom * 100)}%
            </Text>
            <Button 
              type="text" 
              size="small" 
              icon={<IconZoomIn />} 
              onClick={() => setZoom(Math.min(5, timelineState.zoom + 0.1))}
            />
          </Space>

          <Space>
            <Button 
              type="text" 
              size="small" 
              icon={<IconSkipPrevious />}
              onClick={() => {
                setPosition(0);
                seek(0);
              }}
            />
            <Button
              type="primary"
              size="small"
              icon={timelineState.isPlaying ? <IconPause /> : <IconPlayArrow />}
              onClick={() => {
                // 只调用PlaybackContext的播放控制，状态会通过useEffect同步
                playbackHandlePlayPause();
              }}
              disabled={!timelineDuration || timelineDuration === 0}
            />
            <Button 
              type="text" 
              size="small" 
              icon={<IconSkipNext />}
              onClick={() => {
                setPosition(timelineDuration);
                seek(timelineDuration);
              }}
            />
            <Button 
              type="text" 
              size="small" 
              icon={<IconDelete />}
              disabled={timelineState.selectedClipIds.length === 0}
              onClick={handleDeleteSelectedClips}
              title="删除选中片段 (Delete)"
            />
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default TimelinePanel;
