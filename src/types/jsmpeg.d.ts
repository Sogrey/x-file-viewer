declare module 'jsmpeg' {
  interface JSMpeg {
    Player: typeof Player;
  }

  class Player {
    constructor(url: string, options?: PlayerOptions);
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

  interface PlayerOptions {
    canvas?: HTMLCanvasElement;
    loop?: boolean;
    autoplay?: boolean;
    audio?: boolean;
    video?: boolean;
    poster?: string;
    pauseWhenHidden?: boolean;
    disableGl?: boolean;
    disableWebAssembly?: boolean;
    preserveDrawingBuffer?: boolean;
    progressive?: boolean;
    throttled?: boolean;
    chunkSize?: number;
    decodeFirstFrame?: boolean;
    maxAudioLag?: number;
    videoBufferSize?: number;
    audioBufferSize?: number;
    onVideoDecode?: (decoder: Decoder, time: number) => void;
    onAudioDecode?: (decoder: Decoder, time: number) => void;
    onPlay?: (player: Player) => void;
    onPause?: (player: Player) => void;
  }

  interface Decoder {
    readonly timestamp: number;
    readonly currentTime: number;
    readonly duration: number;
    readonly bytesDecoded: number;
    readonly fps: number;
  }

  const JSMpeg: JSMpeg;
  export = JSMpeg;
}
