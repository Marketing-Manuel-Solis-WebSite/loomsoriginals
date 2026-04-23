export type YTPlayerState = -1 | 0 | 1 | 2 | 3 | 5;

export interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  getDuration: () => number;
  getCurrentTime: () => number;
  getPlayerState: () => YTPlayerState;
  destroy: () => void;
}

export interface YTNamespace {
  Player: new (
    element: HTMLElement | string,
    options: {
      videoId: string;
      playerVars?: Record<string, string | number>;
      host?: string;
      events?: {
        onReady?: (e: { target: YTPlayer }) => void;
        onStateChange?: (e: { data: YTPlayerState; target: YTPlayer }) => void;
        onError?: (e: { data: number }) => void;
      };
    }
  ) => YTPlayer;
  PlayerState: {
    UNSTARTED: -1;
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}
