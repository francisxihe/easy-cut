import { ConfigProvider } from "@arco-design/web-react";
import { VideoProvider } from "./contexts/VideoContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProjectProvider, useProject } from "./contexts/ProjectContext";
import MainLayout from "./features/MainLayout";
import ProjectSelector from "./features/ProjectSelector/ProjectSelector";
import "./App.css";

function AppContent() {
  const { showProjectSelector, handleProjectSelected, currentProjectPath } = useProject();

  return (
    <ConfigProvider>
      <VideoProvider>
        <div className="easy-cut-app">
          {currentProjectPath ? (
            <MainLayout />
          ) : (
            <div className="app-loading">
              <div className="loading-content">
                <h3>Easy Cut</h3>
                <p>正在准备工作环境...</p>
              </div>
            </div>
          )}
          
          <ProjectSelector
            visible={showProjectSelector}
            onProjectSelected={handleProjectSelected}
          />
        </div>
      </VideoProvider>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </ThemeProvider>
  );
}

export default App;
