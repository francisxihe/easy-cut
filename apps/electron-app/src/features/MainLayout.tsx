import React from "react";
import { PlaybackProvider } from "../contexts/PlaybackContext";
import { TimelineProvider } from "./TimelinePanel/context";
import { SourcesPanelProvider } from "./SourcesPanel/context";
import { PreviewProvider } from "./PreviewPanel/context";
import { ToolbarProvider } from "./Toolbar/context";
import { InspectorProvider } from "./InspectorPanel/context";
import ResizableLayout from "../components/ResizableLayout";
import Toolbar from "./Toolbar";
import SourcesPanel from "./SourcesPanel";
import PreviewPanel from "./PreviewPanel";
import InspectorPanel from "./InspectorPanel";
import TimelinePanel from "./TimelinePanel";

const MainLayout: React.FC = () => {
  return (
    <PlaybackProvider>
      <ResizableLayout
        headerPanel={
          <ToolbarProvider>
            <Toolbar />
          </ToolbarProvider>
        }
        leftPanel={
          <SourcesPanelProvider>
            <SourcesPanel />
          </SourcesPanelProvider>
        }
        centerPanel={
          <PreviewProvider>
            <PreviewPanel />
          </PreviewProvider>
        }
        rightPanel={
          <InspectorProvider>
            <InspectorPanel />
          </InspectorProvider>
        }
        bottomPanel={
          <TimelineProvider>
            <TimelinePanel />
          </TimelineProvider>
        }
      />
    </PlaybackProvider>
  );
};

export default MainLayout;
