import { useEffect } from "react";

export function useElectron() {
  const electronAPI = window.electronAPI;

  useEffect(() => {
    if (!electronAPI) {
      console.error("Electron API not available");
    }
  }, [electronAPI]);

  return { electronAPI };
}
