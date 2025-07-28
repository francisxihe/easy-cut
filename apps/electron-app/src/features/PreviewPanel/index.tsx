import React from "react";
import { Card, Button, Space, Typography } from "@arco-design/web-react";
import {
  IconSkipPrevious,
  IconPlayArrow,
  IconPause,
  IconSkipNext,
} from "@arco-design/web-react/icon";
import { useVideo } from "../../contexts/VideoContext";
import { usePlayback } from "../../contexts/PlaybackContext";
import { usePreview, PreviewProvider } from "./context";

const { Text } = Typography;

const PreviewPanel: React.FC = () => {
  const { state: videoState } = useVideo();
  const {
    state: playbackState,
    videoRef,
    handlePlayPause,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleVideoEnded,
    handleVideoError,
    handleCanPlay,
    handleLoadStart,
    handleLoadedData,
    handleWaiting,
    handlePlaying,
    formatTime,
  } = usePlayback();
  const {
    state,
    testFileUrl,
    refreshVideo,
    openVideoInNewWindow,
    toggleNativeControls,
    toggleImageTest,
    convertToMp4,
  } = usePreview();

  return (
    <div className="preview-panel" style={{ padding: "8px", height: "100%" }}>
      <Card
        title="视频预览"
        size="small"
        style={{ height: "100%" }}
        extra={
          <Space>
            {videoState.previewUrl && (
              <Button size="mini" onClick={testFileUrl}>
                测试URL
              </Button>
            )}
            {videoState.previewUrl && (
              <Button size="mini" onClick={refreshVideo}>
                刷新视频
              </Button>
            )}
            {videoState.previewUrl && (
              <Button size="mini" onClick={openVideoInNewWindow}>
                新窗口打开
              </Button>
            )}
            {videoState.previewUrl && (
              <Button size="mini" onClick={toggleNativeControls}>
                {state.showNativeControls ? "隐藏" : "显示"}原生控件
              </Button>
            )}
            {videoState.previewUrl && (
              <Button size="mini" onClick={toggleImageTest}>
                {state.showImageTest ? "隐藏" : "显示"}图片测试
              </Button>
            )}
            {!state.isFormatSupported && videoState.previewUrl && (
              <Button size="mini" status="warning" onClick={convertToMp4}>
                转换建议
              </Button>
            )}
          </Space>
        }
        bodyStyle={{
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          height: "calc(100% - 40px)",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000",
            borderRadius: "4px",
            minHeight: "200px",
            position: "relative",
          }}
        >
          {!state.isFormatSupported && videoState.previewUrl && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                right: "10px",
                backgroundColor: "rgba(255, 193, 7, 0.9)",
                color: "#000",
                padding: "8px 12px",
                borderRadius: "4px",
                fontSize: "12px",
                zIndex: 10,
                textAlign: "center",
              }}
            >
              ⚠️ {state.videoFormat.toUpperCase()}{" "}
              格式在Web环境中支持有限，可能无法正常播放。建议转换为MP4格式。
            </div>
          )}

          {videoState.previewUrl ? (
            <>
              {playbackState.videoError ? (
                <div
                  style={{
                    color: "#ff6b6b",
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                    ⚠️
                  </div>
                  <Text style={{ color: "#ff6b6b" }}>{playbackState.videoError}</Text>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  style={{
                    width: "100%",
                    height: "100%",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    backgroundColor: "transparent",
                    display: "block",
                    border: "1px solid red", // 调试边框
                    zIndex: 1,
                  }}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleVideoEnded}
                  onError={handleVideoError}
                  onCanPlay={handleCanPlay}
                  onLoadStart={handleLoadStart}
                  onLoadedData={handleLoadedData}
                  onWaiting={handleWaiting}
                  onPlaying={handlePlaying}
                  preload="metadata"
                  controls={state.showNativeControls}
                  muted={false}
                  playsInline
                  crossOrigin="anonymous"
                >
                  {/* source标签将通过useEffect动态添加 */}
                </video>
              )}
              {state.showImageTest && videoState.previewUrl && (
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    zIndex: 10,
                  }}
                >
                  <img
                    src={videoState.previewUrl}
                    alt="URL测试"
                    style={{
                      width: "100px",
                      height: "60px",
                      objectFit: "cover",
                      border: "2px solid yellow",
                    }}
                    onLoad={() => console.log("Image loaded successfully")}
                    onError={(e) => console.error("Image load error:", e)}
                  />
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎬</div>
              <Text style={{ color: "#fff" }}>选择视频文件开始预览</Text>
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: "12px",
            borderTop: "1px solid var(--color-border-2)",
            paddingTop: "12px",
          }}
        >
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Space>
              <Button type="text" icon={<IconSkipPrevious />} size="small" />
              <Button
                type="primary"
                icon={
                  playbackState.isPlaying ? <IconPause /> : <IconPlayArrow />
                }
                size="small"
                onClick={handlePlayPause}
                disabled={!videoState.previewUrl}
              />
              <Button type="text" icon={<IconSkipNext />} size="small" />
            </Space>

            <Text style={{ fontSize: "12px", color: "var(--color-text-3)" }}>
              {formatTime(playbackState.currentTime)} / {formatTime(playbackState.duration)}
            </Text>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default () => {
  return (
    <PreviewProvider>
      <PreviewPanel />
    </PreviewProvider>
  );
};
