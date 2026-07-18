"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const styles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #f2f4f8 !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh;
  }
  @keyframes spin { to { transform: rotate(360deg) } }
`;

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
          await fetch("http://localhost:5000/api/v1/auth/store-session", {
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
    <>
      <style>{styles}</style>
      {status === "processing" && (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #e65100",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <p style={{ color: "#5f636b", fontSize: 14 }}>Completing sign in...</p>
        </div>
      )}
      {status === "success" && (
        <div style={{ textAlign: "center", padding: 24 }}>
          <div
            style={{
              width: 56,
              height: 56,
              margin: "0 auto 16px",
              borderRadius: "50%",
              background: "#e6f7e6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2e7d32"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e2025", marginBottom: 8 }}>Signed in to CHITHRA</h1>
          <p style={{ fontSize: 14, color: "#5f636b" }}>You can close this tab and return to the app.</p>
        </div>
      )}
      {status === "error" && (
        <div style={{ textAlign: "center", padding: 24 }}>
          <div
            style={{
              width: 56,
              height: 56,
              margin: "0 auto 16px",
              borderRadius: "50%",
              background: "#fce8e6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d93025"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e2025", marginBottom: 8 }}>Sign in failed</h1>
          <p style={{ fontSize: 14, color: "#5f636b", marginBottom: 20 }}>{errorMsg}</p>
          <button
            onClick={() => router.replace("/")}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "none",
              background: "#e65100",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Go back
          </button>
        </div>
      )}
    </>
  );
}
