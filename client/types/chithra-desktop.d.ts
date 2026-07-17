export {};

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
    };
  }
}
