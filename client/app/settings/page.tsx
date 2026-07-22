"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import { getProfileIcon, PROFILE_ICONS, setProfileIcon } from "@/lib/storage/profile-icon";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings", label: "Account Settings", active: true },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/history", label: "History" },
];

function SidebarNavLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
        active ? "bg-[var(--bg-dark)] text-[var(--text-inverse)]" : "text-[var(--text-secondary)] hover:bg-[var(--light-orange-faint)] hover:text-[var(--accent-primary)]"
      }`}
    >
      {label}
    </Link>
  );
}

export default function SettingsPage() {
  const pathname = usePathname();
  const { user, token, isAuthenticated } = useAuth();
  const [profileIcon, setProfileIconState] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: "Watcher",
    email: "",
    displayName: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setProfileIconState(getProfileIcon());
    if (user) {
      setForm((f) => ({
        ...f,
        username: user.username || "",
        email: user.email || "",
        displayName: user.displayName || "",
        bio: "",
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !token) {
      setError("Please log in to save changes");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.patch(
        "/api/v1/users/profile",
        {
          displayName: form.displayName,
          bio: form.bio,
        },
        token
      );

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to save profile");
      }

      setSaved(true);
      savedTimerRef.current = setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIcon = async (icon: string) => {
    setProfileIcon(icon);
    setProfileIconState(icon);

    if (isAuthenticated && token) {
      const avatarUrl = `/avatars/${icon}`;
      await api.patch("/api/v1/users/avatar", { avatarUrl }, token).catch(console.error);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] font-sans text-[var(--text-primary)]">
      <style jsx>{`
        .texture-bg {
          background-image:
            radial-gradient(circle at 15% 20%, color-mix(in srgb, var(--accent-primary) 4%, transparent) 0%, transparent 40%),
            radial-gradient(circle at 85% 70%, color-mix(in srgb, var(--text-primary) 5%, transparent) 0%, transparent 40%);
          background-attachment: fixed;
        }
        .topbar {
          background: var(--topbar-bg);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
        }
        .form-input {
          background: var(--bg-card);
          border: 1px solid var(--border-strong);
          transition: all 0.2s ease;
        }
        .form-input:focus {
          border-color: var(--accent-primary);
          outline: none;
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 8%, transparent);
        }
      `}</style>

      <div className="flex min-h-screen texture-bg">
        {/* Sidebar */}
        <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-[var(--bg-card)] border-r border-[var(--border)] flex-col z-40">
          <div className="px-6 py-6 border-b border-[var(--border)]" />
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <SidebarNavLink key={item.href} {...item} active={pathname === item.href} />
            ))}
          </nav>
        </aside>

        <main className="flex-1 lg:ml-64 min-h-screen">
          {/* Topbar */}
          <header className="topbar sticky top-0 z-30 px-6 md:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="font-cinzel text-xl font-bold text-[var(--text-primary)]">Settings</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-primary)] font-semibold">Manage your account</p>
            </div>
            <Link href="/dashboard" className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition">
              Back to Dashboard
            </Link>
          </header>

          <div className="p-6 md:p-8 max-w-4xl mx-auto">
            {/* Profile Icon Section */}
            <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 mb-6">
              <h2 className="font-cinzel text-lg font-bold text-[var(--text-primary)] mb-4">Profile Icon</h2>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {PROFILE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => handleSelectIcon(icon)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition hover:scale-105 ${
                      profileIcon === icon
                        ? "border-[var(--accent-primary)] ring-2 ring-[var(--light-orange-faint)]"
                        : "border-transparent hover:border-[var(--border-strong)]"
                    }`}
                  >
                    <img src={`/avatars/${icon}`} alt="Avatar" className="w-full h-full object-cover" loading="lazy" />
                    {profileIcon === icon && (
                      <div className="absolute inset-0 bg-[var(--light-orange-faint)] flex items-center justify-center">
                        <svg className="w-5 h-5 text-[var(--accent-primary)]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Account Form */}
            <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 mb-6">
              <h2 className="font-cinzel text-lg font-bold text-[var(--text-primary)] mb-5">Account Details</h2>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] text-sm">{error}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    readOnly
                    className="form-input w-full rounded-xl px-4 py-2.5 text-sm text-[var(--text-muted)] bg-[var(--bg-secondary)] cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    readOnly
                    className="form-input w-full rounded-xl px-4 py-2.5 text-sm text-[var(--text-muted)] bg-[var(--bg-secondary)] cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={form.displayName}
                    onChange={handleChange}
                    placeholder="How you want to appear"
                    className="form-input w-full rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell us a little about yourself"
                    className="form-input w-full rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <h3 className="font-cinzel text-base font-bold text-[var(--text-primary)] mb-4">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={form.currentPassword}
                      onChange={handleChange}
                      placeholder="Current password"
                      className="form-input w-full rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                    />
                  </div>
                  <div />
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      placeholder="New password"
                      className="form-input w-full rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      className="form-input w-full rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[var(--accent-primary)] hover:brightness-110 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                {saved && <span className="text-sm font-medium text-[var(--accent-cool)]">Settings saved.</span>}
              </div>
            </form>

            <p className="text-xs text-[var(--text-muted)]">Your profile information is synced across all your devices.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
