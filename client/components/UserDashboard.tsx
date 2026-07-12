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
      className="block rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2"
      aria-label="User dashboard"
    >
      {icon ? (
        <div className="h-11 w-11 rounded-full overflow-hidden shadow-md ring-2 ring-white/60">
          <img src={`/avatars/${icon}`} alt="Profile" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-warm)] text-white shadow-md ring-2 ring-white/60">
          <svg
            className="h-6 w-6"
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
