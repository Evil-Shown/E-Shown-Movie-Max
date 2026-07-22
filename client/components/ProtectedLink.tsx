"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useAuthModal } from "@/components/AuthModalProvider";

interface ProtectedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  "aria-label"?: string;
  "aria-current"?: "page" | "step" | "location" | "date" | "time" | "true" | "false";
}

export default function ProtectedLink({ href, children, className = "", onClick, "aria-label": ariaLabel, "aria-current": ariaCurrent }: ProtectedLinkProps) {
  const { isAuthenticated, setPendingAction } = useAuth();
  const { openAuthModal } = useAuthModal();

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      onClick={(e) => {
        if (!isAuthenticated) {
          e.preventDefault();
          setPendingAction({ type: "page", payload: { href } });
          openAuthModal({ redirectOnClose: true });
          return;
        }
        onClick?.();
      }}
      className={className}
    >
      {children}
    </Link>
  );
}
