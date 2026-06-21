export interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

export interface FileItem {
  name: string;
  url?: string;
  blob?: Blob;
  size?: number;
}

export interface FileTypeGroup {
  id: string;
  label: string;
  icon: string;
}

export interface Shortcut {
  key: string;
  label: string;
}

export type ThemeMode = "light" | "dark" | "auto";

export interface MediaInfo {
  mimeType: string;
  duration?: number;
  width?: number;
  height?: number;
  audioCodec?: string;
  videoCodec?: string;
}

export interface StatisticsInfo {
  playerType: string;
  url: string;
  decodedFrames?: number;
  droppedFrames?: number;
}

export interface Player {
  destroy(): void;
  on(event: "ERROR", listener: (errorType: string, errorDetail: string) => void): void;
  on(event: "MEDIA_INFO", listener: (info: MediaInfo) => void): void;
  on(event: "STATISTICS_INFO", listener: (info: StatisticsInfo) => void): void;
  on(event: string, listener: (...args: unknown[]) => void): void;
  off(event: "ERROR", listener: (errorType: string, errorDetail: string) => void): void;
  off(event: "MEDIA_INFO", listener: (info: MediaInfo) => void): void;
  off(event: "STATISTICS_INFO", listener: (info: StatisticsInfo) => void): void;
  off(event: string, listener: (...args: unknown[]) => void): void;
  attachMediaElement(mediaElement: HTMLMediaElement): void;
  detachMediaElement(): void;
  load(): void;
  unload(): void;
  play(): Promise<void> | void;
  pause(): void;
  type: string;
  buffered: TimeRanges;
  duration: number;
  volume: number;
  muted: boolean;
  currentTime: number;
}

export interface JsmpegPlayer {
  play(): void;
  pause(): void;
  stop(): void;
  destroy(): void;
  canvas: HTMLCanvasElement;
  volume: number;
  speed: number;
  currentTime: number;
  duration: number;
}
