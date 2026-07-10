import { useMemo } from "react";

export function formatResumeTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function useResumeTime(resumeSeconds?: number) {
  const showResumeBadge = Boolean(resumeSeconds && resumeSeconds > 30);
  const formattedResumeTime = useMemo(
    () => (resumeSeconds && resumeSeconds > 30 ? formatResumeTime(resumeSeconds) : null),
    [resumeSeconds]
  );

  return {
    resumeSeconds,
    showResumeBadge,
    formattedResumeTime,
  };
}
