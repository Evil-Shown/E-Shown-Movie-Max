"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "error">("processing");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const errorDescription = params.get("error_description");

        if (errorDescription) {
          setStatus("error");
          setErrorMsg(decodeURIComponent(errorDescription));
          return;
        }

        if (!accessToken) {
          // Try to get from Supabase session (in case of pkce flow)
          const sb = getSupabaseClient();
          const { data: sessionData } = await sb.auth.getSession();
          const token = sessionData?.session?.access_token || accessToken;

          if (!token) {
            setStatus("error");
            setErrorMsg("No access token received from authentication provider.");
            return;
          }

          const result = await api.post<{ user: Record<string, unknown>; tokens: { accessToken: string } }>(
            "/api/v1/auth/oauth",
            {
              accessToken: token,
            }
          );

          if (!result.success || !result.data) {
            setStatus("error");
            setErrorMsg(result.error?.message || "Failed to complete authentication.");
            return;
          }

          const { user, tokens } = result.data;
          localStorage.setItem("chithra-auth-token", tokens.accessToken);
          localStorage.setItem("chithra-auth-user", JSON.stringify(user));
          window.dispatchEvent(new Event("auth-stored"));
          router.replace("/");
          return;
        }

        const result = await api.post<{ user: Record<string, unknown>; tokens: { accessToken: string } }>(
          "/api/v1/auth/oauth",
          {
            accessToken,
          }
        );

        if (!result.success || !result.data) {
          setStatus("error");
          setErrorMsg(result.error?.message || "Failed to complete authentication.");
          return;
        }

        const { user, tokens } = result.data;
        localStorage.setItem("chithra-auth-token", tokens.accessToken);
        localStorage.setItem("chithra-auth-user", JSON.stringify(user));
        window.dispatchEvent(new Event("auth-stored"));
        router.replace("/");
      } catch (err) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: "#0a0a0f" }}>
      <div className="text-center">
        {status === "processing" ? (
          <>
            <div className="w-10 h-10 border-2 border-[#e65100] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Completing sign in...</p>
          </>
        ) : (
          <div>
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-300 text-sm mb-4">{errorMsg || "Authentication failed."}</p>
            <button
              onClick={() => router.replace("/")}
              className="px-5 py-2.5 rounded-xl bg-[#e65100] text-white text-sm font-semibold hover:bg-[#ff7b1c] transition-colors"
            >
              Go back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
