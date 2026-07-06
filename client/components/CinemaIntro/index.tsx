"use client";

import { useCallback, useEffect, useState } from "react";
import FloatingIcons from "./FloatingIcons";
import ProjectorSVG from "./ProjectorSVG";
import "./cinema-intro.css";

const STORAGE_KEY = "chithra_intro_seen";
const TOTAL_MS = 5000;

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

export default function CinemaIntro() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [hasVideo, setHasVideo] = useState(false);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      localStorage.setItem(STORAGE_KEY, "1");
      document.body.style.overflow = "";
    }, 500);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setVisible(true);

    fetch("/intro-video.mp4", { method: "HEAD" })
      .then((r) => setHasVideo(r.ok))
      .catch(() => setHasVideo(false));

    const t2 = setTimeout(() => setPhase(2), 1500);
    const t3 = setTimeout(() => setPhase(3), 3500);
    const tEnd = setTimeout(dismiss, TOTAL_MS);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(tEnd);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [dismiss]);

  if (!visible) return null;

  return (
    <div
      className={`cinema-intro-overlay${exiting ? " cinema-intro-exit" : ""}`}
      role="dialog"
      aria-label="CHITHRA — CINEMA intro"
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
            <p className="cinema-line-1">🎬 CHITHRA — CINEMA</p>
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
            Enter CHITHRA — CINEMA
          </button>
        </div>
      )}
    </div>
  );
}
