import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';

// 工作文件接口
interface WorkFile {
  file: string;
  properties: {
    duration?: number;
    seek?: number;
    filters?: Array<{ filter: string; options?: any }>;
    advanced?: {
      inputs?: string[];
      complex?: boolean;
    };
    complexFilter?: string;
  };
}

// 渲染方案接口
interface RenderScheme {
  size?: string;
  fps?: number;
  bitrate?: string;
  codec?: string;
  pad?: boolean;
  format?: string;
}

// 回调函数接口
interface RenderCallbacks {
  progress?: (progress: any) => void;
  start?: (commandLine: string) => void;
  end?: () => void;
  error?: (err: Error) => void;
  stderr?: (stderrLine: string) => void;
}

// 预览选项接口
interface PreviewOptions {
  path: string;
  seek: number;
  filters?: string[];
}

export class VideoManager {
  private wd: string; // 工作目录
  private scheme: RenderScheme = {}; // 渲染方案
  private masterOutput: string;
  private workFiles: WorkFile[] = []; // 导入的工作文件
  private masterFiles: string[] = []; // 处理后的主文件列表
  private postProcessing: any[] = []; // 后处理任务

  constructor(ffmpegPath: string | null = null, ffprobePath: string | null = null, workdir: string) {
    if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);
    if (ffprobePath) ffmpeg.setFfprobePath(ffprobePath);
    this.checkBinsExist(ffmpegPath, ffprobePath);

    this.wd = workdir;
    this.masterOutput = this.wd + "masterOutput";
  }

  private checkBinsExist(ffmpegPath: string | null, ffprobePath: string | null): void {
    // 如果路径为null，说明使用系统PATH中的二进制文件，跳过检查
    if (ffmpegPath === null || ffprobePath === null) {
      console.log("Using system PATH binaries, skipping binary check");
      return;
    }
    
    if (fs.existsSync(ffmpegPath) && fs.existsSync(ffprobePath)) return;
    else throw new Error("Binary not installed!");
  }

  getMeta(path: string, callback: (err: any, metadata?: any) => void): void {
    ffmpeg.ffprobe(path, (err: any, metadata?: any) => {
      callback(err, metadata);
    });
  }

  addWorkFile(file: string, properties: WorkFile['properties']): void {
    const workFile: WorkFile = {
      file: file,
      properties: properties,
    };
    this.workFiles.push(workFile);
  }

  // 将视频文件复制到项目目录并返回新路径
  async copyVideoToProject(originalPath: string, projectPath: string): Promise<string> {
    try {
      // 确保项目目录存在
      const projectDir = path.dirname(projectPath);
      const videosDir = path.join(projectDir, 'videos');
      
      if (!fs.existsSync(videosDir)) {
        fs.mkdirSync(videosDir, { recursive: true });
      }

      // 生成唯一的文件名
      const originalName = path.basename(originalPath);
      const ext = path.extname(originalName);
      const nameWithoutExt = path.basename(originalName, ext);
      const timestamp = Date.now();
      const newFileName = `${nameWithoutExt}_${timestamp}${ext}`;
      const newPath = path.join(videosDir, newFileName);

      // 复制文件
      await this.copyFile(originalPath, newPath);
      
      return newPath;
    } catch (error) {
      console.error('复制视频文件到项目目录失败:', error);
      throw error;
    }
  }

  // 异步文件复制方法
  private copyFile(src: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(src);
      const writeStream = fs.createWriteStream(dest);
      
      readStream.on('error', reject);
      writeStream.on('error', reject);
      writeStream.on('finish', resolve);
      
      readStream.pipe(writeStream);
    });
  }

  private setCallbacks(command: any, callbacks: RenderCallbacks): void {
    if (callbacks.progress) command.on("progress", callbacks.progress);
    if (callbacks.start) command.on("start", callbacks.start);
    if (callbacks.end) command.on("end", callbacks.end);
    if (callbacks.error) command.on("error", callbacks.error);
    if (callbacks.stderr) command.on("stderr", callbacks.stderr);
  }

  addWorkFileFilter(index: number, filter: string, options?: any): void {
    const filterObj = {
      filter: filter,
      options: options,
    };
    
    if (!this.workFiles[index].properties.filters) {
      this.workFiles[index].properties.filters = [];
    }

    this.workFiles[index].properties.filters!.push(filterObj);
  }

  // 渲染所有工作文件
  async renderAll(index: number, callbacks: RenderCallbacks): Promise<void> {
    if (this.workFiles.length <= 0) {
      throw new Error("Files list empty");
    }

    if (index >= this.workFiles.length) return; // 已到末尾

    // 渲染当前索引的文件
    await this.render(index, callbacks);
    return this.renderAll(index + 1, callbacks);
  }

  // 将工作文件渲染为主文件
  render(index: number, callbacks: RenderCallbacks): Promise<void> {
    return new Promise((resolve, reject) => {
      const modifiedCallbacks = { ...callbacks };
      modifiedCallbacks.end = resolve;
      modifiedCallbacks.error = reject;

      const command = ffmpeg();
      const workFile = this.workFiles[index];

      if (workFile.properties.duration) {
        // 设置时长
        command.duration(workFile.properties.duration);
      }

      let complex = false;
      // 高级渲染设置
      if (workFile.properties.advanced) {
        if (workFile.properties.advanced.inputs) {
          // 添加多个输入
          const inputs = workFile.properties.advanced.inputs;
          for (let i = 0; i < inputs.length; i++) {
            command.input(inputs[i]);
          }
        }
        if (workFile.properties.advanced.complex) {
          // 使用复杂滤镜图
          complex = true;
          if (workFile.properties.complexFilter) {
            command.complexFilter(workFile.properties.complexFilter);
          }
        }
      }

      if (!complex) {
        // 不使用复杂滤镜图
        this.fromScheme(command);
        if (workFile.properties.filters) {
          // 转换滤镜格式为fluent-ffmpeg期望的格式
          const filters = workFile.properties.filters.map(f => 
            typeof f === 'string' ? f : `${f.filter}${f.options ? '=' + Object.entries(f.options).map(([k,v]) => `${k}=${v}`).join(':') : ''}`
          );
          command.videoFilters(filters);
        }
      }

      this.setCallbacks(command, modifiedCallbacks);

      // 渲染输入到单个文件
      command.input(workFile.file);

      if (workFile.properties.seek) {
        // 设置开始时间
        command.seekInput(workFile.properties.seek);
      }

      command
        .keepDAR()
        .output(this.wd + "/master/master" + index + this.scheme.format)
        .run();

      this.masterFiles.push("master" + index + this.scheme.format);
    });
  }

  // 从主文件夹中的处理文件创建完整的主文件
  stitchMaster(callbacks: RenderCallbacks): Promise<void> {
    return new Promise((resolve, reject) => {
      const modifiedCallbacks = { ...callbacks };
      modifiedCallbacks.end = resolve;
      modifiedCallbacks.error = reject;

      const command = ffmpeg();
      this.setCallbacks(command, modifiedCallbacks);

      const fileList = this.masterFiles;
      const listFileName = this.wd + "/master/list.txt";
      let fileNames = "";

      // 创建文件名列表
      fileList.forEach((fileName) => {
        fileNames = fileNames + "file " + fileName + "\n";
      });

      fs.writeFileSync(listFileName, fileNames);

      command
        .input(listFileName)
        .inputOptions(["-f concat", "-safe 0"])
        .outputOptions("-c copy")
        .save(this.masterOutput + this.scheme.format);
    });
  }

  renderPreview(options: PreviewOptions, stream: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = ffmpeg();
      if (options.filters) command.videoFilters(options.filters);

      command
        .input(options.path)
        .on("end", () => resolve())
        .on("error", reject)
        .duration(10)
        .size("480x?")
        .format("mp4")
        .outputOptions("-movflags frag_keyframe+empty_moov") // 可寻址性魔法
        .videoCodec("libx264")
        .seekInput(options.seek)
        .pipe(stream, { end: true });
    });
  }

  private fromScheme(command: any): void {
    const sch = this.scheme;

    command
      .size(sch.size)
      .fps(sch.fps)
      .videoBitrate(sch.bitrate)
      .videoCodec(sch.codec)
      .autopad(sch.pad);
  }

  convertToCompliant(input: string, name: string): void {
    const command = ffmpeg();
    this.fromScheme(command);

    command.input(input).save(this.wd + name + this.scheme.format);
  }

  // Getter 和 Setter
  get workingDirectory(): string {
    return this.wd;
  }

  get renderScheme(): RenderScheme {
    return this.scheme;
  }

  set renderScheme(scheme: RenderScheme) {
    this.scheme = scheme;
  }

  get workFilesList(): WorkFile[] {
    return this.workFiles;
  }

  get masterFilesList(): string[] {
    return this.masterFiles;
  }

  // 设置渲染方案
  setScheme(scheme: RenderScheme): void {
    this.scheme = { ...scheme };
  }

  // 获取渲染方案
  getScheme(): RenderScheme {
    return { ...this.scheme };
  }
}