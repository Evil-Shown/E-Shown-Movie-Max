"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getApiBase } from "@/lib/api";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handle = async () => {
      try {
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const queryParams = new URLSearchParams(window.location.search);
        const accessToken = hashParams.get("access_token");
        const errorDescription = hashParams.get("error_description");
        const state = queryParams.get("state");
        const claimId = state || localStorage.getItem("chithra-oauth-claim-id");

        if (errorDescription) {
          setStatus("error");
          setErrorMsg(decodeURIComponent(errorDescription));
          return;
        }

        if (!accessToken) {
          setStatus("error");
          setErrorMsg("No access token received.");
          return;
        }

        const isElectron = typeof window !== "undefined" && window.chithraDesktop?.isDesktopApp;

        const result = await api.post<{ user: Record<string, unknown>; tokens: { accessToken: string } }>(
          "/api/v1/auth/oauth",
          { accessToken }
        );

        if (!result.success || !result.data) {
          setStatus("error");
          setErrorMsg(result.error?.message || "Authentication failed.");
          return;
        }

        const { user, tokens } = result.data;

        if (isElectron && claimId) {
          await fetch(`${getApiBase()}/api/v1/auth/store-session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken: tokens.accessToken, user, claimId }),
          });
          setStatus("success");
          return;
        }

        localStorage.setItem("chithra-auth-token", tokens.accessToken);
        localStorage.setItem("chithra-auth-user", JSON.stringify(user));
        window.dispatchEvent(new Event("auth-stored"));
        router.replace("/");
      } catch (err) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
      }
    };

    handle();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      {status === "processing" && (
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-5 rounded-full border-[3px] border-[var(--accent-primary)] border-t-transparent animate-spin" />
          <p className="text-sm text-[var(--text-secondary)]">Completing sign in...</p>
        </div>
      )}
      {status === "success" && (
        <div className="text-center p-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--accent-cool)]/10 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent-cool)]">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">Signed in to CHITHRA</h1>
          <p className="text-sm text-[var(--text-secondary)]">You can close this tab and return to the app.</p>
        </div>
      )}
      {status === "error" && (
        <div className="text-center p-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent-primary)]">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">Sign in failed</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-5">{errorMsg}</p>
          <button
            onClick={() => router.replace("/")}
            className="px-6 py-2.5 rounded-xl border-none bg-[var(--accent-primary)] text-white text-sm font-semibold cursor-pointer"
          >
            Go back
          </button>
        </div>
      )}
    </div>
  );
}
