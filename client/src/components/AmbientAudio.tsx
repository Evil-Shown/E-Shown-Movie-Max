"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

function useWebAudioDrone() {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  const start = useCallback(async () => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
      gainRef.current = ctxRef.current.createGain();
      gainRef.current.gain.value = 0;
      gainRef.current.connect(ctxRef.current.destination);

      oscRef.current = ctxRef.current.createOscillator();
      oscRef.current.type = "sine";
      oscRef.current.frequency.value = 55;
      oscRef.current.connect(gainRef.current);
      oscRef.current.start();
    }
    await ctxRef.current.resume();
    const now = ctxRef.current.currentTime;
    gainRef.current!.gain.cancelScheduledValues(now);
    gainRef.current!.gain.setValueAtTime(gainRef.current!.gain.value, now);
    gainRef.current!.gain.linearRampToValueAtTime(0.06, now + 1);
  }, []);

  const stop = useCallback(() => {
    if (!ctxRef.current || !gainRef.current) return;
    const now = ctxRef.current.currentTime;
    gainRef.current.gain.cancelScheduledValues(now);
    gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, now);
    gainRef.current.gain.linearRampToValueAtTime(0, now + 0.8);
  }, []);

  return { start, stop };
}

export default function AmbientAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [useSynth, setUseSynth] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const drone = useWebAudioDrone();

  const fadeVolume = useCallback((target: number, duration = 800) => {
    const audio = audioRef.current;
    if (!audio || useSynth) return;
    const start = audio.volume;
    const startTime = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      audio.volume = start + (target - start) * t;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [useSynth]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0;
    audio.loop = true;
    audio.addEventListener("error", () => setUseSynth(true));
  }, []);

  const toggle = async () => {
    if (playing) {
      if (useSynth) drone.stop();
      else {
        fadeVolume(0);
        setTimeout(() => audioRef.current?.pause(), 800);
      }
      setPlaying(false);
    } else {
      if (useSynth) {
        await drone.start();
      } else {
        const audio = audioRef.current;
        if (audio) {
          try {
            await audio.play();
            fadeVolume(0.18);
          } catch {
            setUseSynth(true);
            await drone.start();
          }
        }
      }
      setPlaying(true);
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/audio/ambient.mp3" preload="none" />
      <button
        type="button"
        data-cursor="link"
        onClick={toggle}
        aria-label={playing ? "Mute ambient audio" : "Play ambient audio"}
        className="fixed bottom-6 left-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-mid)] bg-[var(--bg-surface)]/90 text-[var(--gold-primary)] transition hover:bg-[var(--gold-primary)] hover:text-black active:scale-95"
      >
        <span className="flex h-4 items-end gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-0.5 rounded-full bg-current"
              animate={
                playing && !prefersReducedMotion
                  ? { height: ["4px", "14px", "6px", "12px", "4px"] }
                  : { height: "4px" }
              }
              transition={
                playing && !prefersReducedMotion
                  ? { duration: 1.2, repeat: Infinity, delay: i * 0.15 }
                  : undefined
              }
            />
          ))}
        </span>
      </button>
    </>
  );
}
