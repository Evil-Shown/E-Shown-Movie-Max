"use client";

import dynamic from "next/dynamic";
import FloatingIcons from "@/components/CinemaIntro/FloatingIcons";
import ProjectorSVG from "@/components/CinemaIntro/ProjectorSVG";
import { BRAND_NAME, BRAND_NAME_SINHALA } from "@/lib/brand";
import {
  getStartupSplashMode,
  markFullIntroCompleted,
  markStartupSplashStarted,
  type StartupSplashMode,
} from "@/lib/storage/startup-splash";
import {
  CINEMA_INTRO_PHASE2_MS,
  CINEMA_INTRO_PHASE3_MS,
  CINEMA_INTRO_TOTAL_MS,
  desktopSplineOnlyTotalMs,
  desktopStartupTotalMs,
  hasValidSplineStartupUrl,
  isSplineMyDesignUrl,
  isSplineProdSceneUrl,
  SPLINE_STAGE_TRANSITION_MS,
  SPLINE_STARTUP_FADE_MS,
  SPLINE_STARTUP_SCENE_URL,
} from "@/lib/spline-config";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import "../CinemaIntro/cinema-intro.css";
import "./startup-splash.css";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => null,
});

const SPARKLES = [
  { left: "35%", bottom: "28%", delay: "0s" },
  { left: "42%", bottom: "32%", delay: "0.2s" },
  { left: "50%", bottom: "30%", delay: "0.4s" },
  { left: "58%", bottom: "34%", delay: "0.15s" },
  { left: "45%", bottom: "36%", delay: "0.35s" },
  { left: "52%", bottom: "38%", delay: "0.55s" },
  { left: "48%", bottom: "40%", delay: "0.7s" },
  { left: "55%", bottom: "42%", delay: "0.25s" },
];

type StartupStage = "cinema" | "spline";

function SplineReactScene({ url }: { url: string }) {
  return (
    <div className="startup-splash-spline-host">
      <Spline scene={url} />
    </div>
  );
}

function SplineIframeScene({ url }: { url: string }) {
  return (
    <iframe
      src={url}
      title="CHITHRA startup scene"
      className="startup-splash-spline-iframe"
      loading="eager"
      allow="fullscreen"
    />
  );
}

function SplineScene({ url }: { url: string }) {
  if (isSplineProdSceneUrl(url)) return <SplineReactScene url={url} />;
  if (isSplineMyDesignUrl(url)) return <SplineIframeScene url={url} />;
  return null;
}

function CinemaIntroStage({
  phase,
  exiting,
}: {
  phase: 1 | 2 | 3;
  exiting: boolean;
}) {
  return (
    <div
      className={`cinema-intro-overlay startup-splash-cinema${
        exiting ? " cinema-intro-exit" : ""
      }`}
      aria-hidden
    >
      {phase === 1 && (
        <>
          <div className="cinema-projector-wrap">
            <ProjectorSVG />
          </div>
          {SPARKLES.map((sparkle, index) => (
            <span
              key={index}
              className="cinema-sparkle"
              style={{ left: sparkle.left, bottom: sparkle.bottom, animationDelay: sparkle.delay }}
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
        </div>
      )}
    </div>
  );
}

export default function StartupSplash() {
  const splashModeRef = useRef<StartupSplashMode>("none");
  const [active, setActive] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [stage, setStage] = useState<StartupStage>("cinema");
  const [cinemaPhase, setCinemaPhase] = useState<1 | 2 | 3>(1);
  const [cinemaExiting, setCinemaExiting] = useState(false);
  const [splineVisible, setSplineVisible] = useState(false);
  const dismissedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sequenceRef = useRef(0);
  const reducedMotionRef = useRef(false);

  const sceneUrl = SPLINE_STARTUP_SCENE_URL;
  const splashMode = splashModeRef.current;
  const includeSpline =
    hasValidSplineStartupUrl(sceneUrl) && !reducedMotionRef.current;

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) clearTimeout(timer);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((callback: () => void, delayMs: number) => {
    const sequenceId = sequenceRef.current;
    timersRef.current.push(
      setTimeout(() => {
        if (sequenceId !== sequenceRef.current || dismissedRef.current) return;
        callback();
      }, delayMs)
    );
  }, []);

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    sequenceRef.current += 1;
    clearTimers();
    setExiting(true);
    setSplineVisible(false);
    setCinemaExiting(true);

    if (splashModeRef.current === "full") {
      markFullIntroCompleted();
    }

    timersRef.current.push(
      setTimeout(() => {
        setActive(false);
        document.body.style.overflow = "";
      }, SPLINE_STARTUP_FADE_MS)
    );
  }, [clearTimers]);

  useLayoutEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mode = getStartupSplashMode();
    splashModeRef.current = mode;

    if (mode === "none") {
      setActive(false);
      return undefined;
    }

    markStartupSplashStarted(mode);

    sequenceRef.current += 1;
    dismissedRef.current = false;
    document.body.style.overflow = "hidden";
    setActive(true);
    setExiting(false);
    setCinemaExiting(false);
    setSplineVisible(false);
    clearTimers();

    const playSpline = includeSpline;
    const isFullIntro = mode === "full";

    if (isFullIntro) {
      setStage("cinema");
      setCinemaPhase(1);

      schedule(() => setCinemaPhase(2), CINEMA_INTRO_PHASE2_MS);
      schedule(() => setCinemaPhase(3), CINEMA_INTRO_PHASE3_MS);
      schedule(() => setCinemaExiting(true), CINEMA_INTRO_TOTAL_MS);

      if (playSpline) {
        schedule(() => {
          setStage("spline");
          setSplineVisible(true);
        }, CINEMA_INTRO_TOTAL_MS + SPLINE_STAGE_TRANSITION_MS);
        schedule(() => dismiss(), desktopStartupTotalMs(true));
      } else {
        schedule(() => dismiss(), desktopStartupTotalMs(false));
      }
    } else {
      setStage("spline");

      if (playSpline) {
        schedule(() => setSplineVisible(true), 120);
        schedule(() => dismiss(), desktopSplineOnlyTotalMs());
      } else {
        dismiss();
      }
    }

    return () => {
      sequenceRef.current += 1;
      clearTimers();
      document.body.style.overflow = "";
    };
    // Run once per page load — never on in-app route changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (!active || dismissedRef.current) return undefined;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
        return;
      }
      if (stage === "spline" && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        dismiss();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, dismiss, stage]);

  if (!active) return null;

  const showCinema = splashMode === "full" && stage === "cinema" && !exiting;
  const showSplineLayer = includeSpline && stage === "spline";

  return (
    <div
      className={`startup-splash startup-splash-visible startup-splash-stage-${stage}${exiting ? " startup-splash-exiting" : ""}`}
      role="dialog"
      aria-label={`${BRAND_NAME} startup`}
      aria-live="polite"
      onClick={() => {
        if (stage === "spline") dismiss();
      }}
    >
      <button
        type="button"
        className="startup-splash-skip"
        onClick={(event) => {
          event.stopPropagation();
          dismiss();
        }}
      >
        Skip
      </button>

      {showCinema && <CinemaIntroStage phase={cinemaPhase} exiting={cinemaExiting} />}

      {showSplineLayer && (
        <div
          className={`startup-splash-scene startup-splash-spline-layer${
            splineVisible ? " startup-splash-spline-layer-visible" : ""
          }`}
        >
          <SplineScene url={sceneUrl} />
          <div className="startup-splash-overlay" />
          <div className="startup-splash-vignette" />
        </div>
      )}

      {stage === "spline" && (
        <div className="startup-splash-footer">
          <p className="startup-splash-logo">
            CHITH<span>RA</span> — Cinema
          </p>
          <p className="startup-splash-loading">Loading Experience…</p>
          <p className="startup-splash-loading">{BRAND_NAME_SINHALA}</p>
        </div>
      )}
    </div>
  );
}
