"use client";

import { useEffect, useState } from "react";

interface FlipClockProps {
  mode?: "12h" | "24h";
  showDate?: boolean;
  showTimezone?: boolean;
}

interface TimeState {
  hours: string;
  minutes: string;
  seconds: string;
  isPM: boolean;
  dayOfWeek: string;
  date: string;
  timezone: string;
}

function getTime(mode: "12h" | "24h"): TimeState {
  const now = new Date();
  let hours = now.getHours();
  const isPM = hours >= 12;

  if (mode === "12h") {
    hours = hours % 12 || 12;
  }

  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(now.getMinutes()).padStart(2, "0"),
    seconds: String(now.getSeconds()).padStart(2, "0"),
    isPM,
    dayOfWeek: now.toLocaleDateString("en-US", { weekday: "long" }),
    date: now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

function FlipDigit({ value, prevValue }: { value: string; prevValue?: string }) {
  const isFlipping = prevValue !== undefined && prevValue !== value;

  return (
    <div className="relative w-8 h-12 md:w-10 md:h-14 perspective-500">
      <div
        className="absolute inset-0 rounded-md overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, var(--chocolate) 0%, color-mix(in srgb, var(--chocolate) 85%, black) 100%)",
          boxShadow:
            "0 1px 8px color-mix(in srgb, var(--chocolate) 20%, transparent), inset 0 1px 0 color-mix(in srgb, var(--faint-white) 6%, transparent)",
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-1/2 flex items-end justify-center pb-px overflow-hidden"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.25)" }}
        >
          <span className="font-cinzel text-lg md:text-xl font-bold text-light-orange">{value}</span>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1/2 flex items-start justify-center pt-px overflow-hidden">
          <span className="font-cinzel text-lg md:text-xl font-bold text-light-orange">{value}</span>
        </div>

        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/50 z-10"></div>

        {isFlipping && (
          <>
            <div
              className="absolute top-0 left-0 w-full h-1/2 overflow-hidden animate-flip-top origin-bottom"
              style={{
                background:
                  "linear-gradient(180deg, var(--chocolate) 0%, color-mix(in srgb, var(--chocolate) 85%, black) 100%)",
              }}
            >
              <span className="font-cinzel text-lg md:text-xl font-bold text-light-orange absolute bottom-0 left-1/2 -translate-x-1/2 pb-px">
                {prevValue}
              </span>
            </div>

            <div
              className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden animate-flip-bottom origin-top"
              style={{
                background:
                  "linear-gradient(180deg, color-mix(in srgb, var(--chocolate) 85%, black) 0%, var(--chocolate) 100%)",
              }}
            >
              <span className="font-cinzel text-lg md:text-xl font-bold text-light-orange absolute top-0 left-1/2 -translate-x-1/2 pt-px">
                {value}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-deep-orange/15 to-transparent"></div>
    </div>
  );
}

function Separator({ animate }: { animate?: boolean }) {
  return (
    <div className="flex flex-col gap-1 items-center justify-center mx-0.5">
      <div
        className={`w-1 h-1 rounded-full bg-deep-orange shadow-[0_0_4px_var(--deep-orange)] ${animate ? "animate-pulse" : ""}`}
      ></div>
      <div
        className={`w-1 h-1 rounded-full bg-deep-orange shadow-[0_0_4px_var(--deep-orange)] ${animate ? "animate-pulse" : ""}`}
      ></div>
    </div>
  );
}

export default function FlipClock({ mode = "12h", showDate: _showDate = true, showTimezone = true }: FlipClockProps) {
  const [time, setTime] = useState<TimeState>(getTime(mode));
  const [prevTime, setPrevTime] = useState<TimeState>(time);
  const [currentMode, setCurrentMode] = useState<"12h" | "24h">(mode);

  useEffect(() => {
    const timer = setInterval(() => {
      setPrevTime(time);
      setTime(getTime(currentMode));
    }, 1000);

    return () => clearInterval(timer);
  }, [currentMode, time]);

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  const digits = [...time.hours, ...time.minutes, ...time.seconds];
  const prevDigits = [...prevTime.hours, ...prevTime.minutes, ...prevTime.seconds];

  return (
    <div className="flex items-center gap-0.5 md:gap-1">
      <FlipDigit value={digits[0]} prevValue={prevDigits[0]} />
      <FlipDigit value={digits[1]} prevValue={prevDigits[1]} />

      <Separator animate />

      <FlipDigit value={digits[2]} prevValue={prevDigits[2]} />
      <FlipDigit value={digits[3]} prevValue={prevDigits[3]} />

      <Separator animate />

      <FlipDigit value={digits[4]} prevValue={prevDigits[4]} />
      <FlipDigit value={digits[5]} prevValue={prevDigits[5]} />

      {currentMode === "12h" && (
        <span
          className="ml-1.5 text-[9px] font-bold leading-none uppercase"
          style={{ color: time.isPM ? "var(--deep-orange)" : "var(--sandy)", opacity: 0.7 }}
        >
          {time.isPM ? "PM" : "AM"}
        </span>
      )}

      {showTimezone && (
        <span className="hidden md:block ml-2 text-[9px] text-sandy/50 tracking-wider uppercase">
          {time.timezone.replace("_", " ")}
        </span>
      )}
    </div>
  );
}
