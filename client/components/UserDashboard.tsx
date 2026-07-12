"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProfileIcon } from "@/lib/storage/profile-icon";

export default function UserDashboard() {
  const [icon, setIcon] = useState<string | null>(null);

  useEffect(() => {
    setIcon(getProfileIcon());
    const onChange = (e: Event) => {
      setIcon((e as CustomEvent<string>).detail);
    };
    window.addEventListener("profileIconChanged", onChange);
    return () => window.removeEventListener("profileIconChanged", onChange);
  }, []);

  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] px-2 py-1.5 transition-all hover:border-[var(--accent-primary)] hover:shadow-sm"
      aria-label="User dashboard"
    >
      {icon ? (
        <div className="h-9 w-9 rounded-full overflow-hidden border border-[var(--border-strong)]">
          <img src={`/avatars/${icon}`} alt="Profile" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-warm)] text-white">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      )}
    </Link>
  );
}
