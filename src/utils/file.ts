import type { FileItem } from "../types";

export const EXECUTABLE_EXTENSIONS = [
  "exe",
  "dll",
  "bat",
  "cmd",
  "com",
  "scr",
  "app",
  "pkg",
  "dmg",
];

export const SCRIPT_SOURCE_EXTENSIONS = [
  "js",
  "vbs",
  "ps1",
  "py",
  "go",
  "rs",
  "java",
  "cpp",
  "c",
  "cs",
  "php",
  "rb",
  "swift",
  "kt",
];

export const ALLOWED_PROTOCOLS = ["http:", "https:"];

export const FILE_TYPE_MAP: Record<string, string> = {
  jpg: "image",
  jpeg: "image",
  png: "image",
  gif: "image",
  webp: "image",
  avif: "image",
  svg: "image",
  bmp: "image",
  tiff: "image",
  heic: "image",
  heif: "image",
  mp4: "video",
  webm: "video",
  mov: "video",
  avi: "video",
  mkv: "video",
  flv: "video",
  wmv: "video",
  m3u8: "video",
  mp3: "audio",
  wav: "audio",
  ogg: "audio",
  aac: "audio",
  m4a: "audio",
  flac: "audio",
  opus: "audio",
  pdf: "document",
  epub: "document",
  xps: "document",
  oxps: "document",
  docx: "document",
  doc: "document",
  rtf: "document",
  odt: "document",
  wps: "document",
  xlsx: "document",
  xls: "document",
  csv: "document",
  ods: "document",
  et: "document",
  pptx: "document",
  ppt: "document",
  odp: "document",
  dps: "document",
  txt: "document",
  md: "document",
  json: "document",
  yaml: "document",
  yml: "document",
  xml: "document",
  js: "document",
  ts: "document",
  vue: "document",
  html: "document",
  css: "document",
  zip: "archive",
  rar: "archive",
  "7z": "archive",
  tar: "archive",
  gz: "archive",
  tgz: "archive",
  bz2: "archive",
  xz: "archive",
};

export const FILE_ICON_MAP: Record<string, string> = {
  jpg: "🖼️",
  jpeg: "🖼️",
  png: "🖼️",
  gif: "🖼️",
  webp: "🖼️",
  avif: "🖼️",
  svg: "📐",
  bmp: "🖼️",
  tiff: "🖼️",
  heic: "🖼️",
  heif: "🖼️",
  mp4: "🎬",
  webm: "🎬",
  mov: "🎬",
  avi: "🎬",
  mkv: "🎬",
  flv: "🎬",
  wmv: "🎬",
  m3u8: "📺",
  mp3: "🎵",
  wav: "🎵",
  ogg: "🎵",
  aac: "🎵",
  m4a: "🎵",
  flac: "🎵",
  opus: "🎵",
  pdf: "📕",
  epub: "📖",
  xps: "📘",
  oxps: "📘",
  docx: "📄",
  doc: "📄",
  rtf: "📄",
  odt: "📄",
  wps: "📄",
  xlsx: "📊",
  xls: "📊",
  csv: "📊",
  ods: "📊",
  et: "📊",
  pptx: "📈",
  ppt: "📈",
  odp: "📈",
  dps: "📈",
  zip: "📦",
  rar: "📦",
  "7z": "📦",
  tar: "📦",
  gz: "📦",
  tgz: "📦",
  bz2: "📦",
  xz: "📦",
  txt: "📝",
  md: "📝",
  json: "📋",
  yaml: "📋",
  yml: "📋",
  xml: "📋",
  js: "💻",
  ts: "💻",
  vue: "💚",
  html: "🌐",
  css: "🎨",
  py: "🐍",
  go: "🐹",
  rs: "🦀",
  eml: "📧",
  msg: "📧",
  mbox: "📧",
  dxf: "📐",
  dwg: "📐",
  dwf: "📐",
  step: "🔧",
  stp: "🔧",
  iges: "🔧",
  ifc: "🔧",
  skp: "🏗️",
  gltf: "🗿",
  glb: "🗿",
  obj: "🗿",
  stl: "🔺",
  fbx: "🗿",
  dae: "🗿",
  ply: "🗿",
  "3mf": "🗿",
  usdz: "🗿",
  geojson: "🗺️",
  topojson: "🗺️",
  kml: "🗺️",
  kmz: "🗺️",
  gpx: "🧭",
  shp: "🗺️",
  ttf: "🔤",
  woff2: "🔤",
  woff: "🔤",
  psd: "🎨",
  ai: "🎨",
  eps: "🎨",
  sqlite: "🗄️",
  wasm: "⚙️",
};

export function getFileExtension(file: File | FileItem): string {
  return file.name.split(".").pop()?.toLowerCase() || "";
}

export function getFileType(file: File | FileItem): string {
  const ext = getFileExtension(file);
  return FILE_TYPE_MAP[ext] || "document";
}

export function getFileIcon(file: File | FileItem): string {
  const ext = getFileExtension(file);
  return FILE_ICON_MAP[ext] || "📄";
}

export function isDangerousFile(file: File | FileItem): boolean {
  const ext = getFileExtension(file);
  return EXECUTABLE_EXTENSIONS.includes(ext);
}

export function isScriptFile(file: File | FileItem): boolean {
  const ext = getFileExtension(file);
  return SCRIPT_SOURCE_EXTENSIONS.includes(ext);
}

export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return ALLOWED_PROTOCOLS.includes(url.protocol);
  } catch {
    return false;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

export function sanitizeFileName(name: string): string {
  const invalidChars = /[\\/:*?"<>|]/g;
  return name.replace(invalidChars, "_").trim();
}
