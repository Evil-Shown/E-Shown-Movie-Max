"use client";

import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const OPTIONS = [
  { value: "light", label: "Daylight" },
  { value: "dark", label: "Midnight" },
  { value: "dim", label: "Theater Dim" },
] as const;

/**
 * Theme selector using native <select> element.
 *
 * BROWSER LIMITATION: The <select> element itself is themed via CSS variables
 * (--bg-card, --text-primary, --border-strong, --accent-primary), but the native
 * dropdown options panel is rendered by the OS/browser and CANNOT be styled with CSS.
 * The option list will always appear with system-default colors (typically white
 * background with dark text) regardless of the active Daylight/Midnight/Theater Dim theme.
 *
 * This is a fundamental browser limitation — no CSS property (background, color, etc.)
 * reliably themes <option> elements across Chrome, Firefox, Safari, and Edge.
 *
 * A custom dropdown (e.g., Radix UI Select, Headless UI Listbox, or a manual popover)
 * would be required to fully theme the options panel. This was intentionally NOT done
 * because: (1) native <select> has better accessibility and mobile UX out of the box,
 * (2) it avoids adding a UI library dependency, and (3) the theming inconsistency is
 * limited to the dropdown popup — the closed select control matches the theme correctly.
 */
export default function ThemeSelect() {
  const { theme, setTheme } = useTheme();
  const { user, token, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const saved = user?.settings?.theme;
    if (saved && (saved === "light" || saved === "dark" || saved === "dim")) {
      setTheme(saved);
    }
  }, [user?.settings?.theme, setTheme]);

  async function handleChange(value: string) {
    setTheme(value);
    if (isAuthenticated && token) {
      await api
        .patch("/api/v1/users/preferences", { theme: value }, token)
        .catch((error) => console.error("Failed to save theme preference:", error));
    }
  }

  if (!mounted) {
    return (
      <div className="h-11 w-full animate-pulse rounded-lg bg-[var(--bg-secondary)]" aria-hidden />
    );
  }

  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
        Appearance
      </span>
      <select
        value={theme ?? "light"}
        onChange={(event) => handleChange(event.target.value)}
        className="form-input w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-card)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
        aria-label="Color theme"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
