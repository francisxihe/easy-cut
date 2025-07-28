import React from 'react';
import {
  Card,
  Typography,
  InputNumber,
  Button,
  Space,
  Tag,
} from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { useVideo } from '../../contexts/VideoContext';
import { useInspector } from './context';

const { Text } = Typography;

const InspectorPanel: React.FC = () => {
  const { state: videoState } = useVideo();
  const { actions, utils } = useInspector();

  const selectedFile = videoState.workFiles.find(
    (file) => file.id === videoState.selectedFileId
  );

  return (
    <div
      className="inspector-panel"
      style={{ padding: '8px', height: '100%', overflow: 'auto' }}
    >
      <Card
        title="属性检查器"
        size="small"
        style={{ height: '100%' }}
        bodyStyle={{ padding: '12px' }}
      >
        {selectedFile ? (
          <Space direction="vertical" size="medium" style={{ width: '100%' }}>
            {/* 文件信息 */}
            <Card size="small" title="文件信息">
              <Space
                direction="vertical"
                size="small"
                style={{ width: '100%' }}
              >
                <div>
                  <Text type="secondary">文件名:</Text>
                  <br />
                  <Text ellipsis title={selectedFile.file.split('/').pop()}>
                    {selectedFile.file.split('/').pop()}
                  </Text>
                </div>
                <div>
                  <Text type="secondary">时长:</Text>
                  <br />
                  <Text>
                    {selectedFile.properties.duration
                      ? `${selectedFile.properties.duration.toFixed(2)} 秒`
                      : 'N/A'}
                  </Text>
                </div>
                <div>
                  <Text type="secondary">格式化时长:</Text>
                  <br />
                  <Text>
                    {selectedFile.properties.duration
                      ? utils.formatDuration(selectedFile.properties.duration)
                      : 'N/A'}
                  </Text>
                </div>
              </Space>
            </Card>

            {/* 时间设置 */}
            <Card size="small" title="时间设置">
              <Space
                direction="vertical"
                size="small"
                style={{ width: '100%' }}
              >
                <div>
                  <Text type="secondary">开始时间 (秒):</Text>
                  <InputNumber
                    style={{ width: '100%', marginTop: '4px' }}
                    step={0.1}
                    precision={1}
                    value={selectedFile.properties.seek || 0}
                    onChange={(value) => {
                      if (utils.validateProperty('seek', value)) {
                        actions.handlePropertyChange('seek', value);
                      }
                    }}
                  />
                </div>
                <div>
                  <Text type="secondary">持续时间 (秒):</Text>
                  <InputNumber
                    style={{ width: '100%', marginTop: '4px' }}
                    step={0.1}
                    precision={1}
                    value={selectedFile.properties.duration || 0}
                    onChange={(value) => {
                      if (utils.validateProperty('duration', value)) {
                        actions.handlePropertyChange('duration', value);
                      }
                    }}
                  />
                </div>
              </Space>
            </Card>

            {/* 滤镜 */}
            <Card
              size="small"
              title="滤镜"
              extra={
                <Button
                  type="text"
                  size="mini"
                  icon={<IconPlus />}
                  onClick={actions.handleFilterAdd}
                >
                  添加
                </Button>
              }
            >
              {selectedFile.properties.filters?.length ? (
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: '100%' }}
                >
                  {selectedFile.properties.filters.map((filter, index) => (
                    <Tag
                      key={index}
                      closable
                      onClose={() => actions.handleFilterRemove(index)}
                    >
                      {filter.filter}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  暂无滤镜
                </Text>
              )}
            </Card>
          </Space>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
            <Text type="secondary">请选择一个视频文件查看属性</Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InspectorPanel;