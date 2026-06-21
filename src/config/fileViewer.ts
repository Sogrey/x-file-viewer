import type { FileTypeGroup, Shortcut, ThemeMode } from '../types';

export const MAX_FILE_SIZE = 200 * 1024 * 1024;

export const FILE_TYPE_GROUPS: FileTypeGroup[] = [
  { id: 'all', label: '全部', icon: '📁' },
  { id: 'image', label: '图片', icon: '🖼️' },
  { id: 'video', label: '视频', icon: '🎬' },
  { id: 'audio', label: '音频', icon: '🎵' },
  { id: 'document', label: '文档', icon: '📄' },
  { id: 'archive', label: '压缩包', icon: '📦' },
];

export const SHORTCUTS: Shortcut[] = [
  { key: '←', label: '上一个文件' },
  { key: '→', label: '下一个文件' },
  { key: 'Esc', label: '清空文件列表' },
  { key: 'T', label: '切换主题' },
  { key: 'F', label: '打开文件选择' },
];

export const THEME_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'light', label: '亮色模式', icon: '☀️' },
  { value: 'dark', label: '暗色模式', icon: '🌙' },
  { value: 'auto', label: '自动模式', icon: '🤖' },
];

export const PLUGIN_OPTIONS = {
  pdfWorkerSrc: 'pdfjs-dist/build/pdf.worker.mjs',
};

export const TOAST_DURATION = 3000;

export const SUPPORTED_FORMAT_COUNT = 110;
