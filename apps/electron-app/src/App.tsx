import { ConfigProvider } from "@arco-design/web-react";
import { VideoProvider } from "./contexts/VideoContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import MainLayout from "./features/MainLayout";
import "./App.css";

function AppContent() {
  return (
    <ConfigProvider>
      <VideoProvider>
        <div className="easy-cut-app">
          <MainLayout />
        </div>
      </VideoProvider>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
