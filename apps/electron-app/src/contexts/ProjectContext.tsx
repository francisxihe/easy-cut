import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useElectron } from '../hooks/useElectron';

interface ProjectContextType {
  currentProjectPath: string | null;
  isFirstLaunch: boolean;
  showProjectSelector: boolean;
  setCurrentProjectPath: (path: string | null) => void;
  setShowProjectSelector: (show: boolean) => void;
  handleProjectSelected: (projectPath: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [currentProjectPath, setCurrentProjectPath] = useState<string | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const electron = useElectron();

  useEffect(() => {
    // 检查是否是首次启动
    checkFirstLaunch();
  }, []);

  useEffect(() => {
    // 如果是首次启动且没有当前项目，显示项目选择器
    if (isFirstLaunch && !currentProjectPath) {
      setShowProjectSelector(true);
    }
  }, [isFirstLaunch, currentProjectPath]);

  const checkFirstLaunch = async () => {
    try {
      // 检查本地存储或配置文件来确定是否是首次启动
      const hasLaunchedBefore = localStorage.getItem('easy-cut-launched');
      if (!hasLaunchedBefore) {
        setIsFirstLaunch(true);
        localStorage.setItem('easy-cut-launched', 'true');
      } else {
        setIsFirstLaunch(false);
        // 尝试加载最后使用的项目
        const lastProject = localStorage.getItem('easy-cut-last-project');
        if (lastProject) {
          setCurrentProjectPath(lastProject);
        } else {
          // 如果没有最后使用的项目，仍然显示项目选择器
          setShowProjectSelector(true);
        }
      }
    } catch (error) {
      console.error('检查首次启动状态失败:', error);
      setIsFirstLaunch(true);
    }
  };

  const handleProjectSelected = async (projectPath: string) => {
    try {
      setCurrentProjectPath(projectPath);
      setShowProjectSelector(false);
      
      // 保存最后使用的项目路径
      localStorage.setItem('easy-cut-last-project', projectPath);
      
      // 这里可以添加加载项目数据的逻辑
      console.log('项目已选择:', projectPath);
      
    } catch (error) {
      console.error('选择项目失败:', error);
    }
  };

  const value: ProjectContextType = {
    currentProjectPath,
    isFirstLaunch,
    showProjectSelector,
    setCurrentProjectPath,
    setShowProjectSelector,
    handleProjectSelected,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectProvider;