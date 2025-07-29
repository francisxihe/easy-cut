import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Card,
  Typography,
  Space,
  List,
  Input,
  Message,
  Divider,
  Empty,
} from '@arco-design/web-react';
import {
  IconPlus,
  IconFolder,
  IconFile,
  IconDelete,
} from '@arco-design/web-react/icon';
import { useElectron } from '../../hooks/useElectron';
import './ProjectSelector.module.less';

const { Title, Text } = Typography;

interface Project {
  id: string;
  name: string;
  path: string;
  lastModified: number;
  description?: string;
}

interface ProjectSelectorProps {
  visible: boolean;
  onProjectSelected: (projectPath: string) => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  visible,
  onProjectSelected,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const electron = useElectron();

  useEffect(() => {
    if (visible) {
      loadRecentProjects();
    }
  }, [visible]);

  const loadRecentProjects = async () => {
    try {
      const recentProjects = await electron?.electronAPI.project.getRecent();
      setProjects(recentProjects || []);
    } catch (error) {
      console.error('加载最近项目失败:', error);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      Message.warning('请输入项目名称');
      return;
    }

    try {
      setLoading(true);
      const result = await electron?.electronAPI.dialog.showSaveDialog({
        title: '选择项目保存位置',
        defaultPath: `${newProjectName.trim()}.easycut`,
        filters: [
          { name: 'Easy Cut 项目', extensions: ['easycut'] },
          { name: '所有文件', extensions: ['*'] },
        ],
      });

      if (!result?.canceled && result?.filePath) {
        // 创建新项目
        await electron?.electronAPI.project.create({
          name: newProjectName.trim(),
          path: result.filePath,
        });

        Message.success('项目创建成功');
        onProjectSelected(result.filePath);
      }
    } catch (error) {
      console.error('创建项目失败:', error);
      Message.error('创建项目失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProject = async () => {
    try {
      const result = await electron?.electronAPI.dialog.showOpenDialog({
        title: '选择项目文件',
        filters: [
          { name: 'Easy Cut 项目', extensions: ['easycut'] },
          { name: '所有文件', extensions: ['*'] },
        ],
        properties: ['openFile'],
      });

      if (!result?.canceled && result?.filePaths?.[0]) {
        onProjectSelected(result.filePaths[0]);
      }
    } catch (error) {
      console.error('打开项目失败:', error);
      Message.error('打开项目失败');
    }
  };

  const handleSelectRecentProject = (project: Project) => {
    onProjectSelected(project.path);
  };

  const handleDeleteProject = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await electron?.electronAPI.project.removeFromRecent(project.id);
      setProjects(projects.filter(p => p.id !== project.id));
      Message.success('已从最近项目中移除');
    } catch (error) {
      console.error('删除项目失败:', error);
      Message.error('删除项目失败');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  return (
    <Modal
      title="欢迎使用 Easy Cut"
      visible={visible}
      footer={null}
      closable={false}
      style={{ width: 800 }}
      className="project-selector-modal"
    >
      <div className="project-selector">
        <div className="welcome-section">
          <Title heading={4}>选择或创建一个项目开始工作</Title>
          <Text type="secondary">
            Easy Cut 使用项目文件来管理您的视频编辑工作。您可以创建新项目或打开现有项目。
          </Text>
        </div>

        <div className="actions-section">
          <Space size="large">
            <Card
              className="action-card"
              hoverable
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <div className="action-content">
                <IconPlus className="action-icon" />
                <Title heading={6}>创建新项目</Title>
                <Text type="secondary">开始一个全新的视频编辑项目</Text>
              </div>
            </Card>

            <Card className="action-card" hoverable onClick={handleOpenProject}>
              <div className="action-content">
                <IconFolder className="action-icon" />
                <Title heading={6}>打开现有项目</Title>
                <Text type="secondary">继续编辑已有的项目文件</Text>
              </div>
            </Card>
          </Space>
        </div>

        {showCreateForm && (
          <div className="create-form">
            <Divider />
            <Title heading={6}>创建新项目</Title>
            <Space>
              <Input
                placeholder="输入项目名称"
                value={newProjectName}
                onChange={setNewProjectName}
                style={{ width: 300 }}
                onPressEnter={handleCreateProject}
              />
              <Button
                type="primary"
                loading={loading}
                onClick={handleCreateProject}
              >
                创建
              </Button>
              <Button onClick={() => setShowCreateForm(false)}>取消</Button>
            </Space>
          </div>
        )}

        {projects.length > 0 && (
          <div className="recent-projects">
            <Divider />
            <Title heading={6}>最近的项目</Title>
            <List
              className="project-list"
              dataSource={projects}
              render={(project) => (
                <List.Item
                  key={project.id}
                  className="project-item"
                  onClick={() => handleSelectRecentProject(project)}
                  actions={[
                    <Button
                      key="delete"
                      type="text"
                      size="small"
                      icon={<IconDelete />}
                      onClick={(e: any) => handleDeleteProject(project, e)}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<IconFile className="project-icon" />}
                    title={project.name}
                    description={
                      <div>
                        <div>{project.path}</div>
                        <Text type="secondary">
                          最后修改: {formatDate(project.lastModified)}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}

        {projects.length === 0 && !showCreateForm && (
          <div className="empty-state">
            <Divider />
            <Empty description="暂无最近项目" />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProjectSelector;