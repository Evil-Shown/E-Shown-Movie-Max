"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
        active ? "bg-[#3E2723] text-[#FFFBF5]" : "text-[#6B4423] hover:bg-[#FFE8D1]/50 hover:text-[#E65100]"
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
      setTimeout(() => setSaved(false), 2500);
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
    <div className="min-h-screen bg-[#FAF3E8] font-sans text-[#3E2723]">
      <style jsx>{`
        .texture-bg {
          background-image:
            radial-gradient(circle at 15% 20%, rgba(230, 81, 0, 0.04) 0%, transparent 40%),
            radial-gradient(circle at 85% 70%, rgba(62, 39, 35, 0.05) 0%, transparent 40%);
          background-attachment: fixed;
        }
        .topbar {
          background: rgba(255, 251, 245, 0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(212, 165, 116, 0.25);
        }
        .form-input {
          background: #fffbf5;
          border: 1px solid rgba(212, 165, 116, 0.4);
          transition: all 0.2s ease;
        }
        .form-input:focus {
          border-color: #e65100;
          outline: none;
          box-shadow: 0 0 0 3px rgba(230, 81, 0, 0.08);
        }
      `}</style>

      <div className="flex min-h-screen texture-bg">
        {/* Sidebar */}
        <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-[#FFFBF5] border-r border-[#D4A574]/25 flex-col z-40">
          <div className="px-6 py-6 border-b border-[#D4A574]/25" />
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
              <h1 className="font-cinzel text-xl font-bold text-[#3E2723]">Settings</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#E65100] font-semibold">Manage your account</p>
            </div>
            <Link href="/dashboard" className="text-sm font-semibold text-[#6B4423] hover:text-[#E65100] transition">
              Back to Dashboard
            </Link>
          </header>

          <div className="p-6 md:p-8 max-w-4xl mx-auto">
            {/* Profile Icon Section */}
            <section className="bg-[#FFFBF5] border border-[#D4A574]/30 rounded-2xl p-6 mb-6">
              <h2 className="font-cinzel text-lg font-bold text-[#3E2723] mb-4">Profile Icon</h2>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {PROFILE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => handleSelectIcon(icon)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition hover:scale-105 ${
                      profileIcon === icon
                        ? "border-[#E65100] ring-2 ring-[#E65100]/20"
                        : "border-transparent hover:border-[#D4A574]"
                    }`}
                  >
                    <img src={`/avatars/${icon}`} alt="Avatar" className="w-full h-full object-cover" />
                    {profileIcon === icon && (
                      <div className="absolute inset-0 bg-[#E65100]/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#E65100]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Account Form */}
            <form onSubmit={handleSubmit} className="bg-[#FFFBF5] border border-[#D4A574]/30 rounded-2xl p-6 mb-6">
              <h2 className="font-cinzel text-lg font-bold text-[#3E2723] mb-5">Account Details</h2>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B4423] mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    readOnly
                    className="form-input w-full rounded-xl px-4 py-2.5 text-sm text-[#A0785A] bg-[#FFF8ED] cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B4423] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    readOnly
                    className="form-input w-full rounded-xl px-4 py-2.5 text-sm text-[#A0785A] bg-[#FFF8ED] cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B4423] mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={form.displayName}
                    onChange={handleChange}
                    placeholder="How you want to appear"
                    className="form-input w-full rounded-xl px-4 py-2.5 text-sm text-[#3E2723] placeholder:text-[#A0785A]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B4423] mb-1.5">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell us a little about yourself"
                    className="form-input w-full rounded-xl px-4 py-2.5 text-sm text-[#3E2723] placeholder:text-[#A0785A] resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[#D4A574]/25">
                <h3 className="font-cinzel text-base font-bold text-[#3E2723] mb-4">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B4423] mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={form.currentPassword}
                      onChange={handleChange}
                      placeholder="Current password"
                      className="form-input w-full rounded-xl px-4 py-2.5 text-sm text-[#3E2723] placeholder:text-[#A0785A]"
                    />
                  </div>
                  <div />
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B4423] mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      placeholder="New password"
                      className="form-input w-full rounded-xl px-4 py-2.5 text-sm text-[#3E2723] placeholder:text-[#A0785A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B4423] mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      className="form-input w-full rounded-xl px-4 py-2.5 text-sm text-[#3E2723] placeholder:text-[#A0785A]"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#E65100] hover:bg-[#FF7B1C] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                {saved && <span className="text-sm font-medium text-green-700">Settings saved.</span>}
              </div>
            </form>

            <p className="text-xs text-[#A0785A]">Your profile information is synced across all your devices.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
