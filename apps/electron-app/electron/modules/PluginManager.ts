import * as fs from 'fs';
import { app, BrowserWindow } from 'electron';
import * as path from 'path';

// 插件配置接口
interface PluginSettings {
  name?: string;
  path: string;
  file?: string;
  type: 'filter' | 'meta';
  height: number;
  width: number;
}

// 插件列表接口
interface PluginList {
  [key: string]: PluginSettings;
}

export class PluginManager {
  private pluginList: PluginList = {};
  private windowList: BrowserWindow[] = [];
  private saveFile: string;
  private mainWindow: BrowserWindow | null = null;
  private listWindow: BrowserWindow | null = null;

  constructor(mainWindow?: BrowserWindow) {
    if (mainWindow) {
      this.mainWindow = mainWindow;
    }
    
    this.saveFile = path.join(app.getPath('userData'), 'plugins.json');

    if (fs.existsSync(this.saveFile)) {
      try {
        const data = fs.readFileSync(this.saveFile, 'utf8');
        this.pluginList = JSON.parse(data);
      } catch (error) {
        console.error('Failed to load plugins.json:', error);
        this.createDefault();
      }
    } else {
      this.createDefault();
    }
  }

  setMainWindow(mainWindow: BrowserWindow): void {
    this.mainWindow = mainWindow;
  }

  addPluginFromPackage(location: string): void {
    try {
      const packageData = fs.readFileSync(location, 'utf8');
      const settings: PluginSettings = JSON.parse(packageData);
      
      if (settings.file) {
        settings.path = path.join(path.dirname(location), settings.file);
      }
      
      if (settings.name) {
        this.registerPlugin(settings.name, settings);
      } else {
        throw new Error('Plugin name is required');
      }
    } catch (error) {
      console.error('Failed to add plugin from package:', error);
      throw error;
    }
  }

  registerPlugin(name: string, settings: PluginSettings): void {
    this.pluginList[name] = settings;
    this.saveList();
  }

  removePlugin(name: string): void {
    delete this.pluginList[name];
    this.saveList();
  }

  private saveList(): void {
    try {
      fs.writeFileSync(this.saveFile, JSON.stringify(this.pluginList, null, 2));
    } catch (error) {
      console.error('Failed to save plugins list:', error);
    }
  }

  private createDefault(): void {
    this.pluginList = {
      textEditor: {
        path: 'html/dialogs/textEditor.html',
        type: 'filter',
        height: 550,
        width: 900,
      },
      filter: {
        path: 'html/dialogs/addFilter.html',
        type: 'filter',
        height: 600,
        width: 800,
      },
      scheme: {
        path: 'html/dialogs/schemeManager.html',
        type: 'meta',
        height: 250,
        width: 800,
      },
    };
    this.saveList();
  }

  openPlugin(name: string): void {
    const plugin = this.pluginList[name];
    if (!plugin) {
      console.error(`Plugin '${name}' not found`);
      return;
    }

    const pluginWindow = new BrowserWindow({
      width: plugin.width,
      height: plugin.height,
      parent: this.mainWindow || undefined,
      title: `fwf: ${name}`,
      backgroundColor: '#20242B',
      webPreferences: { 
        nodeIntegration: true, 
        contextIsolation: false
      },
    });

    this.windowList.push(pluginWindow);
    
    pluginWindow.on('closed', () => {
      const index = this.windowList.indexOf(pluginWindow);
      if (index > -1) {
        this.windowList.splice(index, 1);
      }
    });

    console.log('Loading plugin:', plugin.path);
    pluginWindow.loadFile(plugin.path).catch(error => {
      console.error('Failed to load plugin file:', error);
    });
  }

  createListWindow(): void {
    if (!this.mainWindow) {
      console.error('Main window is required to create plugin list window');
      return;
    }

    this.listWindow = new BrowserWindow({
      width: 270,
      height: 280,
      title: 'fwf: Plugins',
      backgroundColor: '#20242B',
      minimizable: false,
      maximizable: false,
      parent: this.mainWindow,
      show: false,
      frame: true,
      titleBarStyle: 'default',
      webPreferences: { 
        nodeIntegration: true, 
        contextIsolation: false
      },
    });

    this.listWindow.on('close', (event) => {
      event.preventDefault();
      this.listWindow?.hide();
    });

    this.listWindow.webContents.on('did-finish-load', () => {
      this.listWindow?.webContents.send('plugin-list', this.pluginList);
    });

    this.listWindow.loadFile('html/dialogs/pluginList.html').catch(error => {
      console.error('Failed to load plugin list window:', error);
    });
  }

  showListWindow(): void {
    if (this.listWindow) {
      this.listWindow.show();
    } else {
      this.createListWindow();
    }
    
    // Show the window after creation
    if (this.listWindow) {
      this.listWindow.show();
    }
  }

  hideListWindow(): void {
    this.listWindow?.hide();
  }

  closeAllPluginWindows(): void {
    this.windowList.forEach(window => {
      if (!window.isDestroyed()) {
        window.close();
      }
    });
    this.windowList = [];

    if (this.listWindow && !this.listWindow.isDestroyed()) {
      this.listWindow.close();
      this.listWindow = null;
    }
  }

  // Getter 方法
  getPluginList(): PluginList {
    return { ...this.pluginList };
  }

  getPlugin(name: string): PluginSettings | undefined {
    return this.pluginList[name];
  }

  hasPlugin(name: string): boolean {
    return name in this.pluginList;
  }

  getPluginNames(): string[] {
    return Object.keys(this.pluginList);
  }

  getActiveWindows(): BrowserWindow[] {
    return this.windowList.filter(window => !window.isDestroyed());
  }
}