"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import AuthModal from "./AuthModal";
import { useAuth } from "./AuthProvider";

interface AuthModalContextValue {
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}

export default function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { consumePendingAction } = useAuth();

  const openAuthModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
    const pending = consumePendingAction();
    if (pending) {
      window.dispatchEvent(new CustomEvent("authActionReady", { detail: pending }));
    }
  }, [consumePendingAction]);

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal }}>
      {children}
      <AuthModal isOpen={isOpen} onClose={closeAuthModal} />
    </AuthModalContext.Provider>
  );
}
