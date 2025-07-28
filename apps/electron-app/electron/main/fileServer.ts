import http from "http";
import fs from "fs";
import { extname } from "path";

const FILE_SERVER_PORT = 8765;

// 获取文件MIME类型
function getMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    '.webm': 'video/webm',
    '.flv': 'video/x-flv',
    '.wmv': 'video/x-ms-wmv',
    '.m4v': 'video/mp4',
    '.3gp': 'video/3gpp',
    '.ogv': 'video/ogg',
  };
  return mimeMap[ext] || 'video/mp4'; // 默认为mp4而不是octet-stream
}

export class FileServer {
  private server: http.Server | null = null;
  private port: number;

  constructor(port: number = FILE_SERVER_PORT) {
    this.port = port;
  }

  start(): void {
    this.server = http.createServer((req, res) => {
      // 设置CORS头
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Range');
      
      // 处理预检请求
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }
      
      // 解析请求URL，提取文件路径
      const url = new URL(req.url!, `http://localhost:${this.port}`);
      let filePath = decodeURIComponent(url.pathname.substring(1)); // 移除开头的 '/'
      
      // 在Unix-like系统上，确保路径以斜杠开头
      if (process.platform !== 'win32' && !filePath.startsWith('/')) {
        filePath = '/' + filePath;
      }
      
      console.log("File server request:", filePath);

      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*'
        });
        res.end('File not found');
        return;
      }

      const stat = fs.statSync(filePath);
      const mimeType = getMimeType(filePath);
      
      // 支持范围请求（用于视频流）
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        const chunksize = (end - start) + 1;
        
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': mimeType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache',
        });
        
        const stream = fs.createReadStream(filePath, { start, end });
        stream.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': stat.size,
          'Content-Type': mimeType,
          'Access-Control-Allow-Origin': '*',
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-cache',
        });
        
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
      }
    });

    this.server.listen(this.port, () => {
      console.log(`File server started on port ${this.port}`);
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }

  getPort(): number {
    return this.port;
  }

  generateFileUrl(filePath: string): string {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }
    
    // 返回HTTP服务器URL，对路径进行正确编码
    // 移除开头的斜杠以避免双斜杠问题
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const encodedPath = encodeURIComponent(cleanPath).replace(/%2F/g, '/');
    const url = `http://localhost:${this.port}/${encodedPath}`;
    console.log("Generated file URL:", url);
    return url;
  }
}

export { FILE_SERVER_PORT };