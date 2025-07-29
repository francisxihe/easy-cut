import { dialog } from 'electron';
import express, { Request, Response, Application } from 'express';
import { VideoManager } from './VideoManager';

// 预览设置接口
interface PreviewSettings {
  path?: string;
  seek?: string;
  filters?: string[];
}

// 预览选项接口
interface PreviewOptions {
  path: string;
  seek: number;
  filters?: string[];
}

export class PreviewServer {
  private app: Application;
  private settings: PreviewSettings = {};
  private port: number;
  private videoManager: VideoManager;

  constructor(videoManager: VideoManager, port: number = 4000) {
    this.videoManager = videoManager;
    this.port = process.env.PV_PORT ? parseInt(process.env.PV_PORT as string) : port;
    this.app = express();
    
    this.setupRoutes();
    this.setupErrorHandling();
    this.startServer();
  }

  private setupRoutes(): void {
    // 根路由
    this.app.get('/', (req: Request, res: Response) => {
      res.send('fwf preview server');
    });

    // 预览特定文件的特定时间点
    this.app.get('/preview/:file/:seek', (req: Request, res: Response) => {
      res.contentType('mp4');
      const filePath = `${__dirname}/wd/${req.params.file}`;
      
      const options: PreviewOptions = {
        path: filePath,
        seek: parseFloat(req.params.seek),
      };

      this.videoManager
        .renderPreview(options, res)
        .then(() => {
          res.end();
        })
        .catch((error) => {
          console.error('Preview render error:', error);
          res.status(500).send('Preview render failed');
        });
    });

    // 预览带滤镜的视频
    this.app.get('/filtered', (req: Request, res: Response) => {
      res.contentType('mp4');
      
      if (!this.settings.path || !this.settings.seek) {
        res.status(400).send('Preview settings not configured');
        return;
      }

      const options: PreviewOptions = {
        path: this.settings.path,
        seek: this.settings.seek ? parseFloat(this.settings.seek) : 0,
        filters: this.settings.filters,
      };

      this.videoManager
        .renderPreview(options, res)
        .then(() => {
          res.end();
        })
        .catch((error) => {
          console.error('Filtered preview render error:', error);
          res.status(500).send('Filtered preview render failed');
        });
    });
  }

  private setupErrorHandling(): void {
    // Express应用错误处理中间件
    this.app.use((error: Error, req: any, res: any, next: any) => {
      console.error('Preview server error:', error);
      dialog.showErrorBox('Preview server error', error.message);
      res.status(500).send('Internal Server Error');
    });
  }

  private startServer(): void {
    this.app.listen(this.port, () => {
      console.log(
        `Preview server running on port ${this.port}. Change PV_PORT environment variable for a different port.`
      );
    });
  }

  // 设置预览参数
  setPreviewSettings(settings: PreviewSettings): void {
    this.settings = { ...settings };
  }

  // 更新特定设置
  updateSetting(key: keyof PreviewSettings, value: string | string[]): void {
    this.settings[key] = value as any;
  }

  // 清除设置
  clearSettings(): void {
    this.settings = {};
  }

  // 获取当前设置
  getSettings(): PreviewSettings {
    return { ...this.settings };
  }

  // 获取服务器端口
  getPort(): number {
    return this.port;
  }

  // 获取预览URL
  getPreviewUrl(file: string, seek: string): string {
    return `http://localhost:${this.port}/preview/${file}/${seek}`;
  }

  // 获取滤镜预览URL
  getFilteredPreviewUrl(): string {
    return `http://localhost:${this.port}/filtered`;
  }
}