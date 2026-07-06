"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { BRAND_NAME } from "@/lib/brand";
import FloatingIcons from "./FloatingIcons";
import ProjectorSVG from "./ProjectorSVG";
import "./cinema-intro.css";

const BROWSER_STORAGE_KEY = "chithra_intro_seen";
const DESKTOP_SESSION_KEY = "chithra_intro_dismissed";
const TOTAL_MS = 7600;

const SPARKLES = [
  { left: "35%", bottom: "28%", delay: "0s" },
  { left: "42%", bottom: "32%", delay: "0.2s" },
  { left: "50%", bottom: "30%", delay: "0.4s" },
  { left: "58%", bottom: "34%", delay: "0.15s" },
  { left: "45%", bottom: "36%", delay: "0.35s" },
  { left: "52%", bottom: "38%", delay: "0.55s" },
  { left: "48%", bottom: "40%", delay: "0.7s" },
  { left: "55%", bottom: "42%", delay: "0.25s" }
];

function isDesktopApp() {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.chithraDesktop?.isDesktopApp ||
      new URLSearchParams(window.location.search).get("app") === "desktop"
  );
}

function hasSeenIntro() {
  if (typeof window === "undefined") return true;
  if (isDesktopApp()) {
    return sessionStorage.getItem(DESKTOP_SESSION_KEY) === window.chithraDesktop?.launchId;
  }
  return localStorage.getItem(BROWSER_STORAGE_KEY) === "1";
}

function markIntroSeen() {
  if (isDesktopApp()) {
    sessionStorage.setItem(DESKTOP_SESSION_KEY, window.chithraDesktop?.launchId ?? "1");
    return;
  }
  localStorage.setItem(BROWSER_STORAGE_KEY, "1");
}

export default function CinemaIntro() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [hasVideo, setHasVideo] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) {
      clearTimeout(timer);
    }
    timersRef.current = [];
  }, []);

  const dismiss = useCallback(() => {
    setExiting(true);
    const timer = setTimeout(() => {
      setVisible(false);
      markIntroSeen();
      document.body.style.overflow = "";
    }, 500);
    timersRef.current.push(timer);
  }, []);

  useLayoutEffect(() => {
    if (process.env.NODE_ENV === "development") return;
    if (hasSeenIntro()) return;
    document.body.style.overflow = "hidden";
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible || hasSeenIntro()) return undefined;

    fetch("/intro-video.mp4", { method: "HEAD" })
      .then((r) => setHasVideo(r.ok))
      .catch(() => setHasVideo(false));

    timersRef.current.push(setTimeout(() => setPhase(2), 2200));
    timersRef.current.push(setTimeout(() => setPhase(3), 4600));
    timersRef.current.push(setTimeout(() => dismiss(), TOTAL_MS));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimers();
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [visible, dismiss, clearTimers]);

  if (!visible) return null;

  return (
    <div
      className={`cinema-intro-overlay${exiting ? " cinema-intro-exit" : ""}`}
      role="dialog"
      aria-label={`${BRAND_NAME} intro`}
    >
      <button type="button" className="cinema-intro-skip" onClick={dismiss}>
        Skip
      </button>

      {hasVideo && (
        <video
          autoPlay
          muted
          playsInline
          loop={false}
          className="cinema-intro-video"
          src="/intro-video.mp4"
        />
      )}

      {phase === 1 && (
        <>
          <div className="cinema-projector-wrap">
            <ProjectorSVG />
          </div>
          {SPARKLES.map((s, i) => (
            <span
              key={i}
              className="cinema-sparkle"
              style={{ left: s.left, bottom: s.bottom, animationDelay: s.delay }}
            />
          ))}
        </>
      )}

      {phase === 2 && (
        <>
          <FloatingIcons />
          <div className="cinema-phase-content">
            <p className="cinema-line-1">🎬 {BRAND_NAME}</p>
            <p className="cinema-line-2">Unlimited Entertainment</p>
            <p className="cinema-line-3">Free · No Registration · No Subscription</p>
          </div>
        </>
      )}

      {phase === 3 && (
        <div className="cinema-phase-content">
          <ul className="cinema-privacy-list">
            <li>✓ No account required</li>
            <li>✓ No subscription fees</li>
            <li>✓ We don&apos;t sell your data</li>
            <li>✓ We value your privacy &amp; security</li>
          </ul>
          <p className="cinema-instagram">
            Found a bug or have ideas? DM us on Instagram: @__evilshown
          </p>
          <p className="cinema-legal">Content availability varies. Comply with your local laws.</p>
          <button type="button" className="cinema-enter-btn" onClick={dismiss}>
            Enter {BRAND_NAME}
          </button>
        </div>
      )}
    </div>
  );
}
