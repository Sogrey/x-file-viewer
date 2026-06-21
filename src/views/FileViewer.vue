<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { OpenFileViewer } from "@open-file-viewer/vue";
import {
  imagePlugin, videoPlugin, audioPlugin, textPlugin, pdfPlugin, officePlugin,
  archivePlugin, emailPlugin, drawingPlugin, cadPlugin, model3dPlugin, gisPlugin,
  assetPlugin, epubPlugin, xpsPlugin, fallbackPlugin,
  type PreviewToolbarRenderContext, type PreviewPlugin
} from "@open-file-viewer/core";
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";
import type { ToastMessage, FileItem, ThemeMode, Player, JsmpegPlayer } from "../types";
import {
  getFileType, getFileIcon, isDangerousFile, isScriptFile, isValidUrl, formatFileSize, sanitizeFileName
} from "../utils/file";
import {
  MAX_FILE_SIZE, FILE_TYPE_GROUPS, SHORTCUTS, TOAST_DURATION
} from "../config/fileViewer";

import type { PreviewFile } from "@open-file-viewer/core";

async function readArrayBuffer(file: PreviewFile): Promise<ArrayBuffer> {
  if (file.source instanceof ArrayBuffer) {
    return file.source;
  }
  if (file.source instanceof File || file.source instanceof Blob) {
    return file.source.arrayBuffer();
  }
  if (typeof file.source === "string") {
    const response = await fetch(file.source);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`);
    }
    return response.arrayBuffer();
  }
  return new ArrayBuffer(0);
}

async function isMpegTsVideo(file: PreviewFile): Promise<boolean> {
  try {
    const buffer = await readArrayBuffer(file);
    const bytes = new Uint8Array(buffer);

    if (bytes.length < 4) return false;

    const hasMpegTsSyncByte = bytes[0] === 0x47;
    const hasMpegTsPattern = bytes.length >= 188 && bytes[187] === 0x47;

    const isBinaryContent = (() => {
      let nullBytes = 0;
      const checkBytes = Math.min(bytes.length, 1000);
      for (let i = 0; i < checkBytes; i++) {
        const byte = bytes[i];
        if (byte === 0) nullBytes++;
        if (nullBytes > checkBytes * 0.1) return true;
      }
      return false;
    })();

    return hasMpegTsSyncByte && hasMpegTsPattern && isBinaryContent;
  } catch {
    return false;
  }
}

async function isTextFile(file: PreviewFile): Promise<boolean> {
  try {
    const buffer = await readArrayBuffer(file);
    const bytes = new Uint8Array(buffer);

    if (bytes.length === 0) return true;

    const hasBOM = bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF;

    let controlChars = 0;
    const checkBytes = Math.min(bytes.length, 1000);
    for (let i = hasBOM ? 3 : 0; i < checkBytes; i++) {
      const byte = bytes[i]!;
      if (byte === 0x00) return false;
      if ((byte >= 0x00 && byte <= 0x08) ||
        (byte >= 0x0B && byte <= 0x0C) ||
        (byte >= 0x0E && byte <= 0x1F) ||
        (byte >= 0x7F && byte <= 0x9F)) {
        controlChars++;
      }
      if (controlChars > checkBytes * 0.1) return false;
    }

    return true;
  } catch {
    return false;
  }
}

function typescriptPlugin(): PreviewPlugin {
  return {
    name: "typescript",
    async match(file) {
      if (file.extension.toLowerCase() !== "ts") return false;

      const isVideo = await isMpegTsVideo(file);
      if (isVideo) return false;

      const isText = await isTextFile(file);
      return isText;
    },
    async render(ctx) {
      const buffer = await readArrayBuffer(ctx.file);
      const textContent = new TextDecoder("utf-8").decode(buffer);

      const panel = document.createElement("div");
      panel.className = "ofv-panel ofv-text-panel";

      const code = document.createElement("pre");
      code.className = "ofv-text-block";
      code.textContent = textContent;
      panel.appendChild(code);

      ctx.viewport.appendChild(panel);

      return {
        destroy() {
          panel.remove();
        }
      };
    }
  };
}

function mpegTsVideoPlugin(): PreviewPlugin {
  return {
    name: "mpegts-video",
    async match(file) {
      if (file.extension.toLowerCase() !== "ts") return false;
      return isMpegTsVideo(file);
    },
    async render(ctx) {
      const buffer = await readArrayBuffer(ctx.file);
      const blob = ctx.file.blob || new Blob([buffer]);
      const url = URL.createObjectURL(blob);

      const container = document.createElement("div");
      container.className = "ofv-video-container";

      const stage = document.createElement("div");
      stage.className = "ofv-video-stage";

      ctx.viewport.classList.add("ofv-center");
      ctx.viewport.appendChild(container);
      container.appendChild(stage);

      let mpegtsPlayer: Player | null = null;
      let jsmpegPlayer: JsmpegPlayer | null = null;

      const showTranscodeFallback = () => {
        const oldFallback = stage.querySelector(".ofv-fallback");
        if (oldFallback) {
          oldFallback.remove();
        }
        const fallback = document.createElement("div");
        fallback.className = "ofv-fallback";
        const title = document.createElement("strong");
        title.textContent = "当前浏览器不支持直接播放该视频格式 (MPEG-TS)";
        const meta = document.createElement("span");
        meta.textContent = "建议转换为 MP4 格式播放，或直接下载在本地播放。";
        const download = document.createElement("a");
        download.href = url;
        download.download = ctx.file.name;
        download.textContent = "下载视频";
        fallback.append(title, meta, download);
        stage.append(fallback);
      };

      const tryJsmpeg = async () => {
        try {
          const JSMpegModule = await import("jsmpeg");
          const JSMpeg = JSMpegModule.default || JSMpegModule;
          console.log("JSMpeg loaded successfully:", JSMpeg);

          const canvas = document.createElement("canvas");
          canvas.style.width = "100%";
          canvas.style.height = "100%";
          canvas.style.objectFit = ctx.options.fit === "cover" ? "cover" : "contain";
          stage.innerHTML = "";
          stage.appendChild(canvas);

          jsmpegPlayer = new JSMpeg.Player(url, {
            canvas,
            autoplay: true,
            loop: false,
            audio: true,
            video: true,
            progressive: true,
            chunkSize: 1024 * 1024,
            onPlay: () => {
              console.log("JSMpeg playback started");
            },
            onPause: () => {
              console.log("JSMpeg playback paused");
            }
          });

          return {
            resize() {
              if (canvas && stage) {
                canvas.width = stage.clientWidth;
                canvas.height = stage.clientHeight;
              }
            },
            destroy() {
              if (jsmpegPlayer) {
                jsmpegPlayer.destroy();
                jsmpegPlayer = null;
              }
              URL.revokeObjectURL(url);
              container.remove();
              ctx.viewport.classList.remove("ofv-center");
            }
          };
        } catch (err) {
          console.error("JSMpeg failed:", err);
          showTranscodeFallback();
          return {
            resize() { },
            destroy() {
              URL.revokeObjectURL(url);
              container.remove();
              ctx.viewport.classList.remove("ofv-center");
            }
          };
        }
      };

      try {
        const mpegts = await import("mpegts.js");
        const Mpegts = mpegts.default || mpegts;
        console.log("mpegts.js loaded successfully:", Mpegts);

        const features = Mpegts.getFeatureList();
        console.log("mpegts.js features:", features);

        if (!features.mseLivePlayback && !features.msePlayback) {
          console.warn("mpegts.js: MSE not supported, falling back to JSMpeg");
          return tryJsmpeg();
        }

        const video = document.createElement("video");
        video.className = "ofv-media";
        video.controls = true;
        video.playsInline = true;
        video.preload = "auto";
        video.style.objectFit = ctx.options.fit === "cover" ? "cover" : "contain";
        stage.appendChild(video);

        const onVideoError = () => {
          console.warn("mpegts.js video element error, falling back to JSMpeg");
          video.remove();
          tryJsmpeg();
        };

        video.addEventListener("error", onVideoError);

        mpegtsPlayer = Mpegts.createPlayer({
          type: "mpegts",
          url,
          isLive: false
        }, {
          enableWorker: true,
          lazyLoadMaxDuration: 3 * 60,
          enableStashBuffer: true,
          stashInitialSize: 384,
          deferLoadAfterSourceOpen: true
        });

        mpegtsPlayer.attachMediaElement(video);
        mpegtsPlayer.load();

        mpegtsPlayer.on(Mpegts.Events.ERROR, (errorType, errorDetail) => {
          console.error("mpegts.js error:", errorType, errorDetail);
          video.removeEventListener("error", onVideoError);
          video.remove();
          tryJsmpeg();
        });

        mpegtsPlayer.on(Mpegts.Events.MEDIA_INFO, (info) => {
          console.log("mpegts.js media info:", info);
        });

        mpegtsPlayer.on(Mpegts.Events.STATISTICS_INFO, (info) => {
          console.log("mpegts.js stats:", info);
        });

        const playPromise = mpegtsPlayer.play();
        if (playPromise instanceof Promise) {
          playPromise.catch((err: unknown) => {
            console.error("mpegts.js play error:", err);
            video.removeEventListener("error", onVideoError);
            video.remove();
            tryJsmpeg();
          });
        }

        return {
          resize() {
            video.style.width = "100%";
            video.style.height = "100%";
          },
          destroy() {
            video.removeEventListener("error", onVideoError);
            video.pause();
            if (mpegtsPlayer) {
              try {
                mpegtsPlayer.unload();
                mpegtsPlayer.destroy();
              } catch (e) {
                console.warn("Error destroying mpegts player:", e);
              }
            }
            URL.revokeObjectURL(url);
            container.remove();
            ctx.viewport.classList.remove("ofv-center");
          }
        };

      } catch (err) {
        console.error("mpegts.js failed to load, trying JSMpeg:", err);
        return tryJsmpeg();
      }
    }
  };
}

const plugins = [
  imagePlugin(), typescriptPlugin(), mpegTsVideoPlugin(), videoPlugin(), audioPlugin(), textPlugin(),
  pdfPlugin({ workerSrc: pdfWorkerSrc }), officePlugin(), archivePlugin(),
  emailPlugin(), drawingPlugin(), cadPlugin(), model3dPlugin(), gisPlugin(),
  assetPlugin(), epubPlugin(), xpsPlugin(), fallbackPlugin()
];

const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFiles = ref<(File | FileItem)[]>([]);
const currentIndex = ref(0);
const isDragging = ref(false);
const theme = ref<ThemeMode>('auto');
const fileUrl = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const filterType = ref('all');
const toastMessages = ref<ToastMessage[]>([]);
const showShortcuts = ref(false);
const sidebarCollapsed = ref(false);

let toastId = 0;

function showToast(message: string, type: ToastMessage['type'] = 'info') {
  const id = ++toastId;
  toastMessages.value.push({ id, message, type });
  setTimeout(() => {
    const index = toastMessages.value.findIndex(t => t.id === id);
    if (index > -1) toastMessages.value.splice(index, 1);
  }, TOAST_DURATION);
}

const filteredFiles = computed(() => {
  if (filterType.value === 'all') return selectedFiles.value;
  return selectedFiles.value.filter(f => getFileType(f) === filterType.value);
});

const toolbarConfig = {
  zoom: true, rotate: true, download: true, fullscreen: true, search: true,
  labels: { download: '下载', fullscreen: '全屏', search: '搜索', 'zoom-in': '放大', 'zoom-out': '缩小', 'zoom-reset': '原始比例', 'rotate-right': '旋转' },
  order: ['search', 'zoom-out', 'zoom-reset', 'zoom-in', 'rotate-right', 'favorite', 'approve', 'download', 'fullscreen'],
  actions: [
    {
      id: 'favorite', label: '收藏',
      onClick(ctx: PreviewToolbarRenderContext) {
        if (ctx.file) showToast(`已收藏文件: ${ctx.file.name}`, 'success');
      }
    },
    {
      id: 'approve', label: '审批',
      onClick(ctx: PreviewToolbarRenderContext) {
        if (ctx.file) showToast(`已审批文件: ${ctx.file.name}`, 'success');
      }
    }
  ]
};

const currentFile = computed(() => selectedFiles.value[currentIndex.value] || null);
const previewFile = computed(() => {
  const file = currentFile.value;
  if (!file) return null;
  if ('url' in file && file.url) return file.url;
  if ('blob' in file && file.blob) return file.blob;
  return file as File;
});
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
  errorMessage.value = '';

  const validFiles = files.filter(f => {
    if (f.size > MAX_FILE_SIZE) return false;
    if (isDangerousFile(f)) return false;
    return true;
  });

  const oversizedFiles = files.filter(f => f.size > MAX_FILE_SIZE);
  const dangerousFiles = files.filter(f => isDangerousFile(f));
  const scriptFiles = validFiles.filter(f => isScriptFile(f));

  if (dangerousFiles.length > 0) {
    errorMessage.value += `出于安全考虑，不支持以下可执行文件：${dangerousFiles.map(f => f.name).join(', ')}\n`;
  }

  if (scriptFiles.length > 0) {
    errorMessage.value += `以下脚本文件将以纯文本形式显示（不会执行）：${scriptFiles.map(f => f.name).join(', ')}\n`;
  }

  if (oversizedFiles.length > 0) {
    errorMessage.value += `以下文件超过大小限制(200MB)：${oversizedFiles.map(f => f.name).join(', ')}`;
  }

  selectedFiles.value = [...selectedFiles.value, ...validFiles];
  if (selectedFiles.value.length > 0 && currentFile.value === null) {
    currentIndex.value = 0;
  }
}

async function loadUrlFile() {
  if (!fileUrl.value.trim()) {
    errorMessage.value = '请输入有效的文件URL';
    return;
  }

  if (!isValidUrl(fileUrl.value)) {
    errorMessage.value = '不支持的协议，请使用 HTTP 或 HTTPS';
    return;
  }

  const fileName = sanitizeFileName(fileUrl.value.split('/').pop() || 'remote-file');
  if (isDangerousFile({ name: fileName, url: fileUrl.value })) {
    errorMessage.value = '出于安全考虑，不支持该可执行文件类型';
    return;
  }

  errorMessage.value = '';
  if (isScriptFile({ name: fileName, url: fileUrl.value })) {
    errorMessage.value = '该文件将以纯文本形式显示（不会执行）';
  }
  isLoading.value = true;

  try {
    const response = await fetch(fileUrl.value, {
      mode: 'cors',
      headers: { 'Referrer-Policy': 'no-referrer' }
    });

    if (!response.ok) {
      throw new Error(`HTTP 错误: ${response.status}`);
    }

    const blob = await response.blob();

    selectedFiles.value = [...selectedFiles.value, {
      name: fileName,
      blob,
      size: blob.size
    }];

    if (selectedFiles.value.length > 0 && currentFile.value === null) {
      currentIndex.value = 0;
    }

    fileUrl.value = '';
  } catch (err) {
    errorMessage.value = `加载远程文件失败: ${(err as Error).message}`;
  } finally {
    isLoading.value = false;
  }
}

function handleLoad() {
  isLoading.value = false;
  errorMessage.value = '';
}

function handleError(error: Error) {
  isLoading.value = false;
  errorMessage.value = `预览失败: ${error.message}`;
}

function handleUnsupported(file: unknown) {
  const fileName = typeof file === 'object' && file !== null && 'name' in file
    ? (file as { name: string }).name
    : '未知文件';
  errorMessage.value = `不支持的文件格式: ${fileName}`;
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
  if (canPrevious.value) currentIndex.value--;
}

function nextFile() {
  if (canNext.value) currentIndex.value++;
}

function clearAll() {
  selectedFiles.value = [];
  currentIndex.value = 0;
}

function toggleTheme() {
  const themes: ThemeMode[] = ['light', 'dark', 'auto'];
  const currentIdx = themes.indexOf(theme.value);
  const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % themes.length : 0;
  theme.value = themes[nextIdx]!;
  localStorage.setItem('file-viewer-theme', theme.value);
}

function openFileDialog() {
  fileInputRef.value?.click();
}

function handleKeydown(e: KeyboardEvent) {
  if (showShortcuts.value) {
    showShortcuts.value = false;
    return;
  }

  const target = e.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      previousFile();
      break;
    case 'ArrowRight':
      e.preventDefault();
      nextFile();
      break;
    case 'Escape':
      e.preventDefault();
      clearAll();
      break;
    case 't':
    case 'T':
      e.preventDefault();
      toggleTheme();
      break;
    case 'f':
    case 'F':
      e.preventDefault();
      openFileDialog();
      break;
  }
}

onMounted(() => {
  document.body.classList.add('file-viewer-app');
  window.addEventListener('keydown', handleKeydown);

  const savedTheme = localStorage.getItem('file-viewer-theme');
  if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
    theme.value = savedTheme as ThemeMode;
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
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
          <button class="shortcut-toggle" @click="showShortcuts = !showShortcuts" title="快捷键">
            ⌨️
          </button>
          <button class="theme-toggle" @click="toggleTheme"
            :title="theme === 'light' ? '切换暗色模式' : theme === 'dark' ? '切换自动模式' : '切换亮色模式'">
            {{ theme === 'light' ? '🌙' : theme === 'dark' ? '🤖' : '☀️' }}
          </button>
        </div>
      </div>
    </header>

    <div class="main-content">
      <button class="sidebar-toggle" :class="{ 'is-collapsed': sidebarCollapsed }"
        @click="sidebarCollapsed = !sidebarCollapsed" :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'">
        {{ sidebarCollapsed ? '▶' : '◀' }}
      </button>
      <aside class="sidebar" :class="{ 'is-collapsed': sidebarCollapsed }">
        <div class="sidebar-header">
          <h2>文件列表</h2>
          <span class="file-count">{{ filesCount }} 个文件</span>
        </div>

        <div v-if="selectedFiles.length > 0" class="filter-tabs">
          <button v-for="type in FILE_TYPE_GROUPS" :key="type.id" class="filter-tab"
            :class="{ 'is-active': filterType === type.id }" @click="filterType = type.id">
            {{ type.icon }} {{ type.label }}
          </button>
        </div>

        <div class="url-input-area">
          <input type="url" v-model="fileUrl" class="url-input" placeholder="输入远程文件URL..." @keyup.enter="loadUrlFile" />
          <button class="url-btn" @click="loadUrlFile" :disabled="isLoading || !fileUrl.trim()">
            {{ isLoading ? '加载中...' : '加载' }}
          </button>
        </div>

        <div class="drop-zone" :class="{ 'is-dragging': isDragging }" @drop="handleDrop" @dragover="handleDragOver"
          @dragleave="handleDragLeave" @click="openFileDialog">
          <span class="drop-icon">📥</span>
          <span class="drop-text">拖拽文件到此处，或点击选择文件</span>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="filteredFiles.length > 0" class="file-list">
          <div v-for="(file, index) in filteredFiles" :key="index" class="file-item"
            :class="{ 'is-active': selectedFiles.indexOf(file) === currentIndex }"
            @click="selectFile(selectedFiles.indexOf(file))">
            <span class="file-icon">{{ getFileIcon(file) }}</span>
            <div class="file-info">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ 'size' in file && file.size ? formatFileSize(file.size) : '远程文件' }}</span>
            </div>
            <button class="remove-btn" @click.stop="removeFile(selectedFiles.indexOf(file))">×</button>
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
          <OpenFileViewer v-else :file="previewFile!" :file-name="currentFile.name" width="100%" height="100%"
            fit="contain" :toolbar="toolbarConfig" :theme="theme" :plugins="plugins" :loading="isLoading"
            @load="handleLoad" @error="handleError" @unsupported="handleUnsupported" />
        </div>
      </main>
    </div>

    <input ref="fileInputRef" type="file" multiple accept="*" class="hidden-input" @change="handleFileSelect" />

    <div class="toast-container">
      <div v-for="toast in toastMessages" :key="toast.id" class="toast" :class="`toast-${toast.type}`">
        <span class="toast-icon">{{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : toast.type ===
          'warning' ? '⚠' : 'ℹ' }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showShortcuts" class="shortcuts-overlay" @click="showShortcuts = false">
        <div class="shortcuts-panel" @click.stop>
          <h3 class="shortcuts-title">键盘快捷键</h3>
          <div class="shortcuts-list">
            <div v-for="shortcut in SHORTCUTS" :key="shortcut.key" class="shortcut-item">
              <kbd class="shortcut-key">{{ shortcut.key }}</kbd>
              <span class="shortcut-label">{{ shortcut.label }}</span>
            </div>
          </div>
          <p class="shortcuts-hint">按任意键或点击空白处关闭</p>
        </div>
      </div>
    </Teleport>
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

.shortcut-toggle,
.theme-toggle {
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.shortcut-toggle {
  margin-right: 8px;
}

.shortcut-toggle:hover,
.theme-toggle:hover {
  background: var(--hover-bg);
  border-color: var(--accent-color);
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar-toggle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-left: none;
  border-radius: 0 4px 4px 0;
  padding: 8px 4px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s;
  opacity: 0;
  visibility: hidden;
  left: 320px;
}

.sidebar-toggle.is-collapsed {
  left: 0;
  border-left: 1px solid var(--border-color);
  border-radius: 4px;
}

.main-content:hover .sidebar-toggle {
  opacity: 1;
  visibility: visible;
}

.sidebar-toggle:hover {
  background: var(--hover-bg);
  color: var(--accent-color);
}

.sidebar {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  overflow: hidden;
  transition: width 0.3s ease;
}

.sidebar.is-collapsed {
  width: 0;
  padding: 0;
  border-right: none;
}

.sidebar.is-collapsed .sidebar-header,
.sidebar.is-collapsed .filter-tabs,
.sidebar.is-collapsed .url-input-area,
.sidebar.is-collapsed .drop-zone,
.sidebar.is-collapsed .error-message,
.sidebar.is-collapsed .file-list,
.sidebar.is-collapsed .sidebar-footer {
  display: none;
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

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 12px 16px;
}

.filter-tab {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  font-size: 12px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.filter-tab.is-active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: #ffffff;
}

.url-input-area {
  margin: 16px;
  display: flex;
  gap: 8px;
}

.url-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s;
}

.url-input:focus {
  border-color: var(--accent-color);
}

.url-input::placeholder {
  color: var(--text-secondary);
}

.url-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: var(--accent-color);
  color: #ffffff;
  cursor: pointer;
  transition: opacity 0.2s;
}

.url-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.url-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  margin: 0 16px 16px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
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

.toast-container {
  position: fixed;
  top: 80px;
  right: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  min-width: 280px;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-icon {
  font-size: 16px;
  font-weight: bold;
}

.toast-success {
  background: #dcfce7;
  color: #166534;
}

.toast-error {
  background: #fee2e2;
  color: #991b1b;
}

.toast-warning {
  background: #fef3c7;
  color: #92400e;
}

.toast-info {
  background: #dbeafe;
  color: #1e40af;
}

.shortcuts-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.shortcuts-panel {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  min-width: 320px;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.2s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.shortcuts-title {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

.shortcuts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.shortcut-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  padding: 6px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-color);
  font-family: monospace;
}

.shortcut-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.shortcuts-hint {
  margin: 16px 0 0;
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}
</style>
