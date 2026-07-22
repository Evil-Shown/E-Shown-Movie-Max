"use client";

import { useCallback, useEffect, useState } from "react";

function isMobilePlayerViewport() {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 1023px)").matches;
  return coarse || narrow;
}

function isLandscapeViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(orientation: landscape)").matches;
}

/** Keeps faux-fullscreen sized to the real visual viewport across rotate/toolbar shifts. */
export function syncPlayerViewportVars() {
  if (typeof window === "undefined") return;
  const vv = window.visualViewport;
  const height = Math.round(vv?.height ?? window.innerHeight);
  const width = Math.round(vv?.width ?? window.innerWidth);
  const top = Math.round(vv?.offsetTop ?? 0);
  const left = Math.round(vv?.offsetLeft ?? 0);
  const root = document.documentElement;
  root.style.setProperty("--player-vvh", `${height}px`);
  root.style.setProperty("--player-vvw", `${width}px`);
  root.style.setProperty("--player-vv-top", `${top}px`);
  root.style.setProperty("--player-vv-left", `${left}px`);
}

export function clearPlayerViewportVars() {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  root.style.removeProperty("--player-vvh");
  root.style.removeProperty("--player-vvw");
  root.style.removeProperty("--player-vv-top");
  root.style.removeProperty("--player-vv-left");
}

export function usePlayerViewport(active: boolean) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  const refresh = useCallback(() => {
    setIsMobile(isMobilePlayerViewport());
    setIsLandscape(isLandscapeViewport());
    if (active) syncPlayerViewportVars();
  }, [active]);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();

    window.addEventListener("resize", onChange);
    window.addEventListener("orientationchange", onChange);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", onChange);
    vv?.addEventListener("scroll", onChange);

    const landscapeMq = window.matchMedia("(orientation: landscape)");
    const mobileMq = window.matchMedia("(max-width: 1023px)");
    landscapeMq.addEventListener?.("change", onChange);
    mobileMq.addEventListener?.("change", onChange);

    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("orientationchange", onChange);
      vv?.removeEventListener("resize", onChange);
      vv?.removeEventListener("scroll", onChange);
      landscapeMq.removeEventListener?.("change", onChange);
      mobileMq.removeEventListener?.("change", onChange);
      clearPlayerViewportVars();
    };
  }, [refresh]);

  useEffect(() => {
    if (!active) {
      clearPlayerViewportVars();
      return;
    }
    syncPlayerViewportVars();
  }, [active]);

  return { isMobile, isLandscape, refreshViewport: refresh };
}
