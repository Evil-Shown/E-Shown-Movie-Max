"use client";

import { useCallback } from "react";
import { useAuth, type PendingAction } from "@/components/AuthProvider";

export function useRequireAuth() {
  const { isAuthenticated, setPendingAction } = useAuth();

  const requireAuth = useCallback(
    (action: PendingAction): boolean => {
      if (!isAuthenticated) {
        setPendingAction(action);
        return false;
      }
      return true;
    },
    [isAuthenticated, setPendingAction]
  );

  return { requireAuth, isAuthenticated };
}
