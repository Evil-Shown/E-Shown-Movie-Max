export {};

interface DesktopDownloadPayload {
  downloadId: string;
  percentage: number;
  currentSec?: number;
  durationSec?: number;
  done?: boolean;
  outputPath?: string;
}

declare global {
  interface Window {
    chithraDesktop?: {
      isDesktopApp?: boolean;
      platform?: string;
      appVersion?: string;
      launchId?: string;
      launchDay?: string;
      openExternal?: (url: string) => Promise<boolean>;
      onAppWindowEvent?: (callback: (type: string) => void) => (() => void) | undefined;
      downloadMedia?: (params: {
        tmdbId: string;
        type: string;
        season?: number;
        episode?: number;
      }) => Promise<{ success: boolean; outputPath: string }>;
      onDownloadProgress?: (callback: (payload: DesktopDownloadPayload) => void) => () => void;
      cancelDownload?: (downloadId: string) => void;
    };
  }
}
