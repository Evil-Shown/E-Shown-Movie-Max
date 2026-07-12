"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useAuthModal } from "@/components/AuthModalProvider";

interface ProtectedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function ProtectedLink({ href, children, className = "", onClick }: ProtectedLinkProps) {
  const { isAuthenticated, setPendingAction } = useAuth();
  const { openAuthModal } = useAuthModal();

  return (
    <Link
      href={href}
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
