import React from "react";
import { Button, Space, Progress, Divider } from "@arco-design/web-react";
import {
  IconFolder,
  IconVideoCamera,
  IconSettings,
  IconSave,
  IconFolderAdd,
  IconApps,
  IconDelete,
} from "@arco-design/web-react/icon";
import { useVideo } from "../../contexts/VideoContext";
import { ToolbarProvider, useToolbar } from "./context";
import ThemeToggle from "../ThemeToggle";
import clsx from "clsx";

const Toolbar: React.FC = () => {
  const { state: videoState, resetProject } = useVideo();
  const { actions } = useToolbar();

  return (
    <div
      className={clsx("flex gap-2 items-center")}
      style={{
        padding: "8px 16px",
        backgroundColor: "var(--color-bg-2)",
      }}
    >
      <Space size="small" wrap>
        <Button
          type="primary"
          icon={<IconFolder />}
          onClick={actions.handleAddSource}
        >
          添加源文件
        </Button>

        <Button
          type="primary"
          status={videoState.isRendering ? "warning" : "default"}
          icon={<IconVideoCamera />}
          onClick={actions.handleRender}
          disabled={videoState.isRendering || videoState.workFiles.length === 0}
          loading={videoState.isRendering}
        >
          {videoState.isRendering ? "渲染中..." : "渲染"}
        </Button>

        <Divider type="vertical" />

        <Button
          icon={<IconSettings />}
          onClick={() => window.electronAPI.plugin.open("scheme")}
        >
          渲染设置
        </Button>

        <Button icon={<IconSave />} onClick={actions.handleSave}>
          保存项目
        </Button>

        <Button icon={<IconFolderAdd />} onClick={actions.handleLoad}>
          加载项目
        </Button>

        <Button icon={<IconApps />} onClick={actions.handleShowPlugins}>
          插件管理
        </Button>

        <Divider type="vertical" />

        <Button status="danger" icon={<IconDelete />} onClick={resetProject}>
          清空项目
        </Button>

        <Divider type="vertical" />

        <ThemeToggle />
      </Space>

      {videoState.isRendering && (
        <div
          style={{
            marginTop: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Progress
            percent={videoState.renderProgress}
            size="small"
            style={{ flex: 1, maxWidth: "200px" }}
          />
          <span style={{ fontSize: "12px", color: "var(--color-text-2)" }}>
            {Math.round(videoState.renderProgress)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default () => {
  return (
    <ToolbarProvider>
      <Toolbar />
    </ToolbarProvider>
  );
};
