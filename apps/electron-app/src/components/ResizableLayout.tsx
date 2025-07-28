import React, { useState, useRef, useCallback, useEffect } from "react";
import styles from "./ResizableLayout.module.less";
import clsx from "clsx";

interface ResizableLayoutProps {
  headerPanel: React.ReactNode;
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  bottomPanel: React.ReactNode;
}

const ResizableLayout: React.FC<ResizableLayoutProps> = ({
  headerPanel,
  leftPanel,
  centerPanel,
  rightPanel,
  bottomPanel,
}) => {
  const [panelSizes, setPanelSizes] = useState<{
    leftWidth: number;
    rightWidth: number;
    bottomHeight: number;
  }>({
    leftWidth: 250,
    rightWidth: 280,
    bottomHeight: 300,
  });

  const [isDragging, setIsDragging] = useState<string | null>(null);
  const layoutRef = useRef<HTMLDivElement>(null);

  // 处理鼠标按下事件
  const handleMouseDown = useCallback((resizer: string) => {
    setIsDragging(resizer);
  }, []);

  // 处理鼠标移动事件
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !layoutRef.current) return;

      const rect = layoutRef.current.getBoundingClientRect();

      switch (isDragging) {
        case "left":
          const leftWidth = Math.max(200, Math.min(400, e.clientX - rect.left));
          setPanelSizes((prev) => ({ ...prev, leftWidth: leftWidth }));
          break;
        case "right":
          const rightWidth = Math.max(
            200,
            Math.min(400, rect.right - e.clientX)
          );
          setPanelSizes((prev) => ({ ...prev, rightWidth: rightWidth }));
          break;
        case "bottom":
          const newHeight = Math.max(
            250,
            Math.min(400, rect.bottom - e.clientY)
          );
          setPanelSizes((prev) => ({ ...prev, bottomHeight: newHeight }));
          break;
      }
    },
    [isDragging]
  );

  // 处理鼠标松开事件
  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  // 添加全局事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor =
        isDragging === "bottom" ? "ns-resize" : "ew-resize";
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={layoutRef}
      className={styles["resizable-layout"]}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--color-bg-1)",
        position: "relative",
      }}
    >
      {/* 工具栏区域 */}
      <div className={clsx("border-b")}>{headerPanel}</div>

      {/* 主视图区域 */}
      <div
        className="main-view"
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          position: "relative",
        }}
      >
        {/* 左侧面板 */}
        <div
          style={{
            width: panelSizes.leftWidth,
            background: "var(--color-bg-2)",
            borderRight: "1px solid var(--color-border-2)",
            flexShrink: 0,
            position: "relative",
          }}
        >
          {leftPanel}

          {/* 左侧拖拽手柄 */}
          <div
            className={clsx(styles["resize-handle"])}
            style={{
              position: "absolute",
              top: 0,
              right: -2,
              width: 4,
              height: "100%",
              cursor: "ew-resize",
              background: "transparent",
              zIndex: 10,
            }}
            onMouseDown={() => handleMouseDown("left")}
          />
        </div>

        {/* 中心面板 */}
        <div
          style={{
            flex: 1,
            background: "var(--color-bg-1)",
            minWidth: 0,
          }}
        >
          {centerPanel}
        </div>

        {/* 右侧面板 */}
        <div
          style={{
            width: panelSizes.rightWidth,
            background: "var(--color-bg-2)",
            borderLeft: "1px solid var(--color-border-2)",
            flexShrink: 0,
            position: "relative",
          }}
        >
          {rightPanel}

          {/* 右侧拖拽手柄 */}
          <div
            className={clsx(styles["resize-handle"])}
            style={{
              position: "absolute",
              top: 0,
              left: -2,
              width: 4,
              height: "100%",
              cursor: "ew-resize",
              background: "transparent",
              zIndex: 10,
            }}
            onMouseDown={() => handleMouseDown("right")}
          />
        </div>
      </div>

      {/* 底部区域区域 */}
      <div
        style={{
          height: panelSizes.bottomHeight,
          background: "var(--color-bg-2)",
          borderTop: "1px solid var(--color-border-2)",
          flexShrink: 0,
          position: "relative",
        }}
      >
        {bottomPanel}

        {/* 底部区域拖拽手柄 */}
        <div
          className={clsx(styles["resize-handle"])}
          style={{
            position: "absolute",
            top: -2,
            left: 0,
            width: "100%",
            height: 4,
            cursor: "ns-resize",
            background: "transparent",
            zIndex: 10,
          }}
          onMouseDown={() => handleMouseDown("bottom")}
        />
      </div>

      {/* 拖拽时的视觉反馈 */}
      {isDragging && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.1)",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};

export default ResizableLayout;
