<script setup lang="ts">import { ref, computed, onMounted } from "vue";
import { OpenFileViewer } from "@open-file-viewer/vue";
import { imagePlugin, videoPlugin, audioPlugin, textPlugin, pdfPlugin, officePlugin, archivePlugin, emailPlugin, drawingPlugin, cadPlugin, model3dPlugin, gisPlugin, assetPlugin, fallbackPlugin } from "@open-file-viewer/core";
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";
const plugins = [
  imagePlugin(),
  videoPlugin(),
  audioPlugin(),
  textPlugin(),
  pdfPlugin({ workerSrc: pdfWorkerSrc }),
  officePlugin(),
  archivePlugin(),
  emailPlugin(),
  drawingPlugin(),
  cadPlugin(),
  model3dPlugin(),
  gisPlugin(),
  assetPlugin(),
  fallbackPlugin()
];
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFiles = ref<File[]>([]);
const currentIndex = ref(0);
const isDragging = ref(false);
const theme = ref<'light' | 'dark' | 'auto'>('auto');
const toolbarConfig = {
  zoom: true,
  rotate: true,
  download: true,
  fullscreen: true,
  search: true,
  labels: {
    download: '下载',
    fullscreen: '全屏',
    search: '搜索',
    'zoom-in': '放大',
    'zoom-out': '缩小',
    'zoom-reset': '原始比例',
    'rotate-right': '旋转'
  },
  order: ['search', 'zoom-out', 'zoom-reset', 'zoom-in', 'rotate-right', 'download', 'fullscreen']
};
const currentFile = computed(() => selectedFiles.value[currentIndex.value] || null);
const filesCount = computed(() => selectedFiles.value.length);
const canPrevious = computed(() => currentIndex.value > 0);
const canNext = computed(() => currentIndex.value < selectedFiles.value.length - 1);
function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    addFiles(Array.from(input.files));
  }
  input.value = '';
}
function handleDrop(event: DragEvent) {
  event.preventDefault();
  isDragging.value = false;
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files));
  }
}
function handleDragOver(event: DragEvent) {
  event.preventDefault();
  isDragging.value = true;
}
function handleDragLeave() {
  isDragging.value = false;
}
function addFiles(files: File[]) {
  selectedFiles.value = [...selectedFiles.value, ...files];
  if (selectedFiles.value.length > 0 && currentFile.value === null) {
    currentIndex.value = 0;
  }
}
function removeFile(index: number) {
  selectedFiles.value.splice(index, 1);
  if (currentIndex.value >= selectedFiles.value.length) {
    currentIndex.value = Math.max(0, selectedFiles.value.length - 1);
  }
}
function selectFile(index: number) {
  currentIndex.value = index;
}
function previousFile() {
  if (canPrevious.value) {
    currentIndex.value--;
  }
}
function nextFile() {
  if (canNext.value) {
    currentIndex.value++;
  }
}
function clearAll() {
  selectedFiles.value = [];
  currentIndex.value = 0;
}
function toggleTheme() {
  const themes: ('light' | 'dark' | 'auto')[] = ['light', 'dark', 'auto'];
  const currentValue = theme.value;
  const currentIdx = themes.indexOf(currentValue);
  const nextValue = themes[(currentIdx + 1) % themes.length] as 'light' | 'dark' | 'auto';
  theme.value = nextValue;
}
function openFileDialog() {
  fileInputRef.value?.click();
}
function getFileIcon(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const iconMap: Record<string, string> = {
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️', avif: '🖼️', svg: '📐', bmp: '🖼️', tiff: '🖼️', heic: '🖼️', heif: '🖼️',
    mp4: '🎬', webm: '🎬', mov: '🎬', avi: '🎬', mkv: '🎬', flv: '🎬', wmv: '🎬', m3u8: '📺',
    mp3: '🎵', wav: '🎵', ogg: '🎵', aac: '🎵', m4a: '🎵', flac: '🎵', opus: '🎵',
    pdf: '📕', epub: '📖', xps: '📘', oxps: '📘',
    docx: '📄', doc: '📄', rtf: '📄', odt: '📄', wps: '📄',
    xlsx: '📊', xls: '📊', csv: '📊', ods: '📊', et: '📊',
    pptx: '📈', ppt: '📈', odp: '📈', dps: '📈',
    zip: '📦', rar: '📦', '7z': '📦', tar: '📦', gz: '📦', tgz: '📦', bz2: '📦', xz: '📦',
    txt: '📝', md: '📝', json: '📋', yaml: '📋', yml: '📋', xml: '📋', js: '💻', ts: '💻', vue: '💚', html: '🌐', css: '🎨', py: '🐍', go: '🐹', rs: '🦀',
    eml: '📧', msg: '📧', mbox: '📧',
    dxf: '📐', dwg: '📐', dwf: '📐', step: '🔧', stp: '🔧', iges: '🔧', ifc: '🔧', skp: '🏗️',
    gltf: '🗿', glb: '🗿', obj: '🗿', stl: '🔺', fbx: '🗿', dae: '🗿', ply: '🗿', '3mf': '🗿', usdz: '🗿',
    geojson: '🗺️', topojson: '🗺️', kml: '🗺️', kmz: '🗺️', gpx: '🧭', shp: '🗺️',
    ttf: '🔤', woff2: '🔤', woff: '🔤', psd: '🎨', ai: '🎨', eps: '🎨', sqlite: '🗄️', wasm: '⚙️'
  };
  return iconMap[ext] || '📄';
}
function formatFileSize(bytes: number): string {
  if (bytes < 1024)
    return bytes + ' B';
  if (bytes < 1024 * 1024)
    return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}
onMounted(() => {
  document.body.classList.add('file-viewer-app');
});
</script>

<template>
  <div class="app-container" :class="`theme-${theme}`">
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">📁</span>
          <span class="logo-text">万能文档阅读器</span>
        </div>
        <div class="header-actions">
          <button class="theme-toggle" @click="toggleTheme"
            :title="theme === 'light' ? '切换暗色模式' : theme === 'dark' ? '切换自动模式' : '切换亮色模式'">
            {{ theme === 'light' ? '🌙' : theme === 'dark' ? '🤖' : '☀️' }}
          </button>
        </div>
      </div>
    </header>

    <div class="main-content">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>文件列表</h2>
          <span class="file-count">{{ filesCount }} 个文件</span>
        </div>

        <div class="drop-zone" :class="{ 'is-dragging': isDragging }" @drop="handleDrop" @dragover="handleDragOver"
          @dragleave="handleDragLeave" @click="openFileDialog">
          <span class="drop-icon">📥</span>
          <span class="drop-text">拖拽文件到此处，或点击选择文件</span>
        </div>

        <div v-if="selectedFiles.length > 0" class="file-list">
          <div v-for="(file, index) in selectedFiles" :key="index" class="file-item"
            :class="{ 'is-active': index === currentIndex }" @click="selectFile(index)">
            <span class="file-icon">{{ getFileIcon(file) }}</span>
            <div class="file-info">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
            <button class="remove-btn" @click.stop="removeFile(index)">×</button>
          </div>
        </div>

        <div v-if="selectedFiles.length > 0" class="sidebar-footer">
          <button class="clear-btn" @click="clearAll">清空列表</button>
        </div>
      </aside>

      <main class="preview-area">
        <div v-if="currentFile" class="preview-header">
          <div class="preview-nav">
            <button class="nav-btn" :disabled="!canPrevious" @click="previousFile">
              ◀ 上一个
            </button>
            <span class="nav-info">{{ currentIndex + 1 }} / {{ filesCount }}</span>
            <button class="nav-btn" :disabled="!canNext" @click="nextFile">
              下一个 ▶
            </button>
          </div>
          <div class="preview-title">
            <span class="file-icon">{{ getFileIcon(currentFile) }}</span>
            <span class="file-name">{{ currentFile.name }}</span>
          </div>
        </div>

        <div class="preview-container">
          <div v-if="!currentFile" class="empty-preview">
            <span class="empty-icon">📄</span>
            <p class="empty-text">请选择或拖拽文件进行预览</p>
            <p class="empty-hint">支持 110+ 种文件格式</p>
          </div>
          <OpenFileViewer v-else :file="currentFile" :file-name="currentFile.name" width="100%" height="100%"
            fit="contain" :toolbar="toolbarConfig" :theme="theme" :plugins="plugins" />
        </div>
      </main>
    </div>

    <input ref="fileInputRef" type="file" multiple accept="*" class="hidden-input" @change="handleFileSelect" />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background 0.3s, color 0.3s;
}

.app-container.theme-light {
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --bg-sidebar: #f1f5f9;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --accent-color: #3b82f6;
  --hover-bg: #f1f5f9;
}

.app-container.theme-dark {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-sidebar: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-color: #334155;
  --accent-color: #60a5fa;
  --hover-bg: #334155;
}

.app-container.theme-auto {
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --bg-sidebar: #f1f5f9;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --accent-color: #3b82f6;
  --hover-bg: #f1f5f9;
}

@media (prefers-color-scheme: dark) {
  .app-container.theme-auto {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-sidebar: #1e293b;
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --border-color: #334155;
    --accent-color: #60a5fa;
    --hover-bg: #334155;
  }
}

.header {
  flex-shrink: 0;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1920px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.theme-toggle {
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-toggle:hover {
  background: var(--hover-bg);
  border-color: var(--accent-color);
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  overflow: hidden;
}

.sidebar-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.file-count {
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: 4px 10px;
  border-radius: 12px;
}

.drop-zone {
  margin: 16px;
  padding: 24px;
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-secondary);
}

.drop-zone:hover,
.drop-zone.is-dragging {
  border-color: var(--accent-color);
  background: rgba(59, 130, 246, 0.05);
}

.drop-icon {
  display: block;
  font-size: 40px;
  margin-bottom: 12px;
}

.drop-text {
  font-size: 14px;
  color: var(--text-secondary);
}

.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-secondary);
}

.file-item:hover {
  background: var(--hover-bg);
}

.file-item.is-active {
  background: var(--accent-color);
}

.file-item.is-active .file-name,
.file-item.is-active .file-size {
  color: #ffffff;
}

.file-icon {
  font-size: 20px;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  display: block;
  font-size: 11px;
  color: var(--text-secondary);
}

.remove-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.file-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  color: #ef4444;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
}

.clear-btn {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: var(--hover-bg);
  border-color: #ef4444;
  color: #ef4444;
}

.preview-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-header {
  flex-shrink: 0;
  padding: 12px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  padding: 6px 14px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: #ffffff;
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nav-info {
  font-size: 13px;
  color: var(--text-secondary);
  min-width: 80px;
  text-align: center;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-title .file-icon {
  font-size: 18px;
}

.preview-title .file-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  max-width: 400px;
}

.preview-container {
  flex: 1;
  overflow: hidden;
  background: var(--bg-primary);
}

.empty-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.empty-icon {
  font-size: 64px;
}

.empty-text {
  font-size: 18px;
  color: var(--text-primary);
  margin: 0;
}

.empty-hint {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.hidden-input {
  display: none;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}
</style>
