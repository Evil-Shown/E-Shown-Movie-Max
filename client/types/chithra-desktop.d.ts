export {};

declare global {
  interface Window {
    chithraDesktop?: {
      isDesktopApp?: boolean;
      platform?: string;
      appVersion?: string;
      launchId?: string;
      launchDay?: string;
      onAppWindowEvent?: (callback: (type: string) => void) => (() => void) | undefined;
    };
  }
}
