# 万能文档阅读器

基于 Open File Viewer 构建的跨平台文档预览工具，支持 110+ 种文件格式。

## ✨ 特性

- **110+ 文件格式支持**：覆盖图片、音视频、文本、PDF、Office、压缩包、邮件、CAD、3D、GIS 等多种格式
- **Vue 3 + TypeScript**：现代化前端技术栈
- **多主题支持**：亮色、暗色、自动三种主题模式
- **自定义工具栏**：搜索、缩放、旋转、下载、全屏等功能
- **多文件队列**：支持批量上传和快速切换
- **拖拽上传**：简单便捷的文件添加方式

## 📁 支持格式

### 图片类
jpg、png、gif、webp、avif、svg、bmp、tiff、heic、heif

### 视频类
mp4、webm、mov、avi、mkv、flv、wmv、m3u8

### 音频类
mp3、wav、ogg、aac、m4a、flac、opus

### 文本/代码类
txt、md、json、yaml、xml、js、ts、vue、html、css、py、go、rs

### PDF/电子书类
pdf、epub、xps、oxps

### Office 文档类
docx、rtf、odt、xlsx、csv、pptx、odp、wps、et、dps

### 压缩包类
zip、rar、7z、tar、gz、tgz、bz2、xz

### 邮件类
eml、msg、mbox

### CAD/工程图纸类
dxf、dwg、dwf、step、stp、iges、ifc、skp

### 3D 模型类
gltf、glb、obj、stl、fbx、dae、ply、3mf、usdz

### GIS 地理数据类
geojson、topojson、kml、kmz、gpx、shp

### 设计资产/数据文件类
ttf、woff2、psd、ai、eps、sqlite、wasm、parquet、avro

## 🛠️ 技术栈

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **构建工具**: Vite 8
- **文件预览**: Open File Viewer
  - `@open-file-viewer/core`
  - `@open-file-viewer/vue`
- **PDF 解析**: pdfjs-dist

## 🚀 快速开始

### 安装依赖

```sh
npm install
```

### 开发模式

```sh
npm run dev
```

### 生产构建

```sh
npm run build
```

### 代码检查

```sh
npm run lint
```

## 📁 项目结构

```
src/
├── views/
│   └── FileViewer.vue    # 文件预览主页面
├── router/
│   └── index.ts          # 路由配置
├── assets/
│   ├── base.css          # 基础样式
│   └── main.css          # 全局样式
├── App.vue               # 根组件
└── main.ts               # 入口文件
```

## 📖 使用说明

1. **添加文件**: 拖拽文件到左侧区域，或点击选择文件
2. **切换文件**: 使用上下按钮或直接点击文件列表中的文件
3. **工具栏操作**: 搜索、缩放、旋转、下载、全屏
4. **主题切换**: 点击右上角主题按钮切换亮色/暗色/自动模式

## 🔗 相关链接

- **Open File Viewer 官网**: https://open-file-viewer-workspace.void.app/
- **GitHub**: https://github.com/xushanpei/open-file-viewer
- **npm**: https://www.npmjs.com/package/@open-file-viewer/core

## 📄 许可证

MIT
