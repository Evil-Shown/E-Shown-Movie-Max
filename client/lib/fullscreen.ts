type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  mozCancelFullScreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
};

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

export function getActiveFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return (
    doc.fullscreenElement ??
    doc.webkitFullscreenElement ??
    doc.mozFullScreenElement ??
    doc.msFullscreenElement ??
    null
  );
}

export async function exitAnyFullscreen(): Promise<void> {
  const doc = document as FullscreenDocument;
  if (!getActiveFullscreenElement()) return;

  try {
    if (doc.exitFullscreen) {
      await doc.exitFullscreen();
      return;
    }
    if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
      return;
    }
    if (doc.mozCancelFullScreen) {
      await doc.mozCancelFullScreen();
      return;
    }
    if (doc.msExitFullscreen) {
      await doc.msExitFullscreen();
    }
  } catch {
    // Tab inactive, embed-owned fullscreen, or already exited.
  }
}

export function requestElementFullscreen(element: HTMLElement): Promise<void> | void {
  const target = element as FullscreenElement;

  try {
    if (target.requestFullscreen) {
      return target.requestFullscreen({ navigationUI: "hide" });
    }
    if (target.webkitRequestFullscreen) {
      return target.webkitRequestFullscreen();
    }
    if (target.mozRequestFullScreen) {
      return target.mozRequestFullScreen();
    }
    if (target.msRequestFullscreen) {
      return target.msRequestFullscreen();
    }
  } catch {
    // Some browsers throw synchronously when the gesture window expired.
  }
}
