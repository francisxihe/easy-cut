import React from "react";
import {
  List,
  Button,
  Typography,
  Space,
  Input,
  Select,
  Tooltip,
} from "@arco-design/web-react";
import {
  IconPlayArrow,
  IconDelete,
  IconSearch,
  IconList,
  IconApps,
  IconEye,
  IconCopy,
} from "@arco-design/web-react/icon";
import { useSourcesPanel, SourcesPanelProvider } from "./context";

const { Text } = Typography;
const { Option } = Select;

const SourcesPanel: React.FC = () => {
  const {
    state,
    removeFile,
    selectFile,
    previewFile,
    duplicateFile,
    setSorting,
    setFilter,
    setViewMode,
    toggleFileDetails,
    getFilteredAndSortedFiles,
  } = useSourcesPanel();

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // const handleFileSelect = (file: VideoFile) => {
  //   selectFile(file.id);
  //   // 可以在这里添加其他逻辑，比如更新预览等
  // };

  const filteredFiles = getFilteredAndSortedFiles();

  // 拖拽处理函数
  const handleDragStart = (e: React.DragEvent, file: any) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "video-file",
        fileId: file.id,
        fileName: file.name,
        duration: file.properties.duration,
      })
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="sources-panel" style={{ padding: "8px" }}>
      {/* 工具栏 */}
      <div style={{ marginBottom: "12px" }}>
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          {/* 搜索框 */}
          <Input
            placeholder="搜索文件..."
            prefix={<IconSearch />}
            value={state.filterText}
            onChange={(value) => setFilter(value)}
            allowClear
            size="small"
          />

          {/* 控制按钮 */}
          <Space
            size="small"
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <Space size="small">
              {/* 排序选择 */}
              <Select
                size="small"
                value={`${state.sortBy}-${state.sortOrder}`}
                onChange={(value) => {
                  const [sortBy, sortOrder] = value.split("-") as [
                    "name" | "duration" | "dateAdded",
                    "asc" | "desc",
                  ];
                  setSorting(sortBy, sortOrder);
                }}
                style={{ width: 120 }}
              >
                <Option value="name-asc">名称 ↑</Option>
                <Option value="name-desc">名称 ↓</Option>
                <Option value="duration-asc">时长 ↑</Option>
                <Option value="duration-desc">时长 ↓</Option>
                <Option value="dateAdded-asc">添加时间 ↑</Option>
                <Option value="dateAdded-desc">添加时间 ↓</Option>
              </Select>
            </Space>

            <Space size="small">
              {/* 视图模式切换 */}
              <Tooltip
                content={
                  state.viewMode === "list"
                    ? "切换到网格视图"
                    : "切换到列表视图"
                }
              >
                <Button
                  size="small"
                  type="text"
                  icon={state.viewMode === "list" ? <IconApps /> : <IconList />}
                  onClick={() =>
                    setViewMode(state.viewMode === "list" ? "grid" : "list")
                  }
                />
              </Tooltip>

              {/* 详情显示切换 */}
              <Tooltip
                content={state.showFileDetails ? "隐藏详情" : "显示详情"}
              >
                <Button
                  size="small"
                  type={state.showFileDetails ? "primary" : "text"}
                  icon={<IconEye />}
                  onClick={toggleFileDetails}
                />
              </Tooltip>
            </Space>
          </Space>
        </Space>
      </div>

      {/* 文件列表 */}
      {filteredFiles.length > 0 ? (
        <List
          size="small"
          dataSource={filteredFiles}
          render={(file) => (
            <List.Item
              key={file.id}
              draggable
              onDragStart={(e) => handleDragStart(e, file)}
              style={{
                backgroundColor:
                  state.selectedFileId === file.id
                    ? "var(--color-primary-light-1)"
                    : "transparent",
                cursor: "grab",
                borderRadius: "4px",
                marginBottom: "4px",
              }}
              onClick={() => selectFile(file.id)}
              actions={[
                <Tooltip key="preview" content="预览">
                  <Button
                    type="text"
                    size="mini"
                    icon={<IconPlayArrow />}
                    onClick={(e) => {
                      e.stopPropagation();
                      previewFile(file.id);
                    }}
                  />
                </Tooltip>,
                <Tooltip key="duplicate" content="复制">
                  <Button
                    type="text"
                    size="mini"
                    icon={<IconCopy />}
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateFile(file.id);
                    }}
                  />
                </Tooltip>,
                <Tooltip key="delete" content="删除">
                  <Button
                    type="text"
                    size="mini"
                    status="danger"
                    icon={<IconDelete />}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                  />
                </Tooltip>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Text
                    style={{
                      fontSize: "13px",
                      fontWeight: state.selectedFileId === file.id ? 600 : 400,
                    }}
                  >
                    {file.file.split("/").pop() || "Unknown"}
                  </Text>
                }
                description={
                  state.showFileDetails ? (
                    <Space direction="vertical" size={2}>
                      <Text
                        style={{
                          fontSize: "11px",
                          color: "var(--color-text-3)",
                        }}
                      >
                        时长:{" "}
                        {file.properties.duration
                          ? formatDuration(file.properties.duration)
                          : "N/A"}
                      </Text>
                      {file.properties.seek && (
                        <Text
                          style={{
                            fontSize: "11px",
                            color: "var(--color-text-3)",
                          }}
                        >
                          开始: {formatDuration(file.properties.seek)}
                        </Text>
                      )}
                      {file.properties.filters &&
                        file.properties.filters.length > 0 && (
                          <Text
                            style={{
                              fontSize: "11px",
                              color: "var(--color-text-3)",
                            }}
                          >
                            滤镜: {file.properties.filters.length} 个
                          </Text>
                        )}
                    </Space>
                  ) : null
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "var(--color-text-3)",
          }}
        >
          <Text>暂无文件</Text>
        </div>
      )}
    </div>
  );
};

export default () => {
  return (
    <SourcesPanelProvider>
      <SourcesPanel />
    </SourcesPanelProvider>
  );
};
