"use client";

import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type CursorMode = "default" | "link" | "play" | "text" | "grab" | "grabbing";

export default function CustomCursor() {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");
  const [pressed, setPressed] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  useEffect(() => {
    setMounted(true);
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (prefersReducedMotion || isCoarsePointer) return;

    setEnabled(true);

    document.body.classList.add("custom-cursor-active");

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);

      const target = e.target as HTMLElement;
      const el = target.closest("[data-cursor]") as HTMLElement | null;

      if (el?.dataset.cursor === "play") setMode("play");
      else if (el?.dataset.cursor === "text" || target.closest("input, textarea")) setMode("text");
      else if (el?.dataset.cursor === "grab") setMode(document.body.classList.contains("is-grabbing") ? "grabbing" : "grab");
      else if (el?.dataset.cursor === "link" || target.closest("a, button, [role='button']")) setMode("link");
      else setMode("default");
    };

    const onDown = () => {
      document.body.classList.add("is-grabbing");
      setPressed(true);
    };
    const onUp = () => {
      document.body.classList.remove("is-grabbing");
      setPressed(false);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      document.body.classList.remove("custom-cursor-active", "is-grabbing");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [prefersReducedMotion, x, y]);

  if (!mounted || !enabled) return null;

  return createPortal(
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-normal"
      style={{ x, y }}
    >
      {mode === "text" ? (
        <div className="h-5 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-[var(--gold-primary)]" />
      ) : mode === "default" ? (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 -translate-x-[3px] -translate-y-[3px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
        >
          <path
            d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"
            fill="var(--gold-primary)"
            stroke="#171b24"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
      ) : mode === "link" || mode === "grab" || mode === "grabbing" ? (
        <motion.svg
          viewBox="0 0 24 24"
          animate={{ scale: mode === "grabbing" || pressed ? 0.92 : 1 }}
          transition={{ type: "tween", duration: 0.08 }}
          className="h-6 w-6 -translate-x-[5px] -translate-y-[3px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
        >
          <path
            d="M11.25 4.533A1.5 1.5 0 0 0 9 5.75v2.25H7.5a3 3 0 0 0-3 3v5.25a5.25 5.25 0 0 0 10.5 0V11.25a1.5 1.5 0 0 0-3 0v-1.5a1.5 1.5 0 0 0-3 0v-1.5a1.5 1.5 0 0 0-1.5-1.482Z"
            fill="var(--gold-primary)"
            stroke="#171b24"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
        </motion.svg>
      ) : (
        <motion.div
          animate={{ scale: 1 }}
          className="flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[var(--gold-primary)] bg-[var(--gold-primary)] shadow-[0_0_12px_rgba(212,168,67,0.4)]"
        >
          <svg viewBox="0 0 24 24" fill="black" className="ml-0.5 h-3.5 w-3.5">
            <path d="M8 5v14l11-7z" />
          </svg>
        </motion.div>
      )}
    </motion.div>,
    document.body
  );
}
