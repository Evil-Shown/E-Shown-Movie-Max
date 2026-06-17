export {};

declare global {
  interface Window {
    chithraDesktop?: {
      isDesktopApp?: boolean;
      platform?: string;
    };
  }
}
