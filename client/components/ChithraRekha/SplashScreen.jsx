"use client";

import { useEffect, useState } from "react";

const HOLES = Array.from({ length: 16 });
const LANGUAGES = ["සිංහල", "हिन्दी", "தமிழ்", "తెలుగు", "English"];
const DESKTOP_LAUNCH_KEY = "chithra_desktop_splash_launch";

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const launchId = window.chithraDesktop?.launchId;
    if (window.chithraDesktop?.isDesktopApp && launchId) {
      if (sessionStorage.getItem(DESKTOP_LAUNCH_KEY) === launchId) {
        return undefined;
      }
      sessionStorage.setItem(DESKTOP_LAUNCH_KEY, launchId);
    } else if (sessionStorage.getItem("chithra_splash_done")) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setVisible(true);

    const exit = setTimeout(() => setExiting(true), 4200);
    const hide = setTimeout(() => {
      setVisible(false);
      if (!window.chithraDesktop?.isDesktopApp) {
        sessionStorage.setItem("chithra_splash_done", "1");
      }
      document.body.style.overflow = previousOverflow;
    }, 4900);

    return () => {
      clearTimeout(exit);
      clearTimeout(hide);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`chithra-splash${exiting ? " splash-exit" : ""}`} aria-label="CHITHRA — CINEMA intro">
      <div className="film-strip film-strip-top" aria-hidden="true">
        {HOLES.map((_, index) => (
          <span className="film-hole" key={`top-${index}`} />
        ))}
      </div>
      <div className="film-strip film-strip-bottom" aria-hidden="true">
        {HOLES.map((_, index) => (
          <span className="film-hole" key={`bottom-${index}`} />
        ))}
      </div>

      <svg
        className="ravana-vimana"
        width="200"
        height="54"
        viewBox="0 0 200 54"
        fill="none"
        aria-hidden="true"
      >
        <ellipse cx="100" cy="34" rx="56" ry="10" fill="rgba(201,106,43,0.06)" />
        <path d="M56 34 Q100 12 144 34" fill="rgba(201,106,43,0.04)" />
        <line x1="100" y1="12" x2="100" y2="4" strokeWidth="1" />
        <circle cx="100" cy="3" r="2.5" fill="#C96A2B" opacity="0.65" stroke="none" />
        <path d="M56 34 L20 27 L34 36 Z" fill="rgba(201,106,43,0.04)" />
        <path d="M144 34 L180 27 L166 36 Z" fill="rgba(201,106,43,0.04)" />
        <path d="M86 44 L80 53 L94 47 Z" fill="rgba(201,106,43,0.04)" />
        <path d="M114 44 L120 53 L106 47 Z" fill="rgba(201,106,43,0.04)" />
        <circle cx="100" cy="34" r="2.5" fill="rgba(201,106,43,0.45)" stroke="none" />
        <circle cx="76" cy="33" r="1.3" fill="rgba(201,106,43,0.22)" stroke="none" />
        <circle cx="124" cy="33" r="1.3" fill="rgba(201,106,43,0.22)" stroke="none" />
      </svg>

      <div className="chithra-splash-content">
        <p className="chithra-eyebrow">streaming platform</p>
        <h1 className="chithra-title">
          CHITH<span>RA</span>
        </h1>
        <p className="chithra-subtitle">චිත්‍ර — Cinema</p>

        <div className="chithra-rule">
          <span />
          <p>Hela · South Asia</p>
          <span />
        </div>

        <div className="chithra-languages" aria-label="Supported languages">
          {LANGUAGES.map((language) => (
            <span key={language}>{language}</span>
          ))}
        </div>
      </div>

      <svg className="personal-reel" width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
        <circle cx="26" cy="26" r="23" />
        <circle cx="26" cy="26" r="15" />
        <circle cx="26" cy="26" r="4" className="reel-center" />
        <circle cx="26" cy="10" r="2.8" className="reel-sprocket" />
        <circle cx="26" cy="42" r="2.8" className="reel-sprocket" />
        <circle cx="10" cy="26" r="2.8" className="reel-sprocket" />
        <circle cx="42" cy="26" r="2.8" className="reel-sprocket" />
      </svg>
    </div>
  );
}
