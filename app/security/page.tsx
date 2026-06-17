"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const XIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── useIsMobile hook ─────────────────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navQuery, setNavQuery] = useState("");

  function goSearch(closeMenu = false) {
    router.push(navQuery.trim() ? `/search?q=${encodeURIComponent(navQuery.trim())}` : "/search");
    if (closeMenu) setMenuOpen(false);
  }

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "#fff", borderBottom: "1px solid #E2E8F0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <a href="/" style={{ fontWeight: 700, fontSize: 20, color: "#1E3A8A", letterSpacing: "-0.5px", textDecoration: "none", flexShrink: 0 }}>FoundLink</a>

        {isMobile ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="/messages" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}><MessageIcon /></a>
            <a href="/profile" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}><UserIcon /></a>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569" }}>
              {menuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 24, flexShrink: 0 }}>
              {[["Home", "/"], ["Search", "/search"], ["Post", "/post"]].map(([label, href]) => (
                <a key={label} href={href} style={{ fontSize: 14, fontWeight: 400, color: "#475569", textDecoration: "none" }}>{label}</a>
              ))}
            </div>
            <div style={{ flex: 1, maxWidth: 400, display: "flex", background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ padding: "0 12px", display: "flex", alignItems: "center", color: "#94A3B8" }}><SearchIcon /></div>
              <input
                value={navQuery}
                onChange={(e) => setNavQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") goSearch(); }}
                placeholder="Search items..."
                style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: "#0F172A", padding: "10px 0", outline: "none", fontFamily: "inherit" }}
              />
              <button onClick={() => goSearch()} style={{ background: "#2563EB", color: "#fff", border: "none", padding: "0 16px", fontWeight: 600, fontSize: 13, cursor: "pointer", borderRadius: "0 99px 99px 0" }}>Search</button>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <a href="/messages" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}><MessageIcon /></a>
              <a href="/profile" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}><UserIcon /></a>
            </div>
          </>
        )}
      </div>

      {isMobile && menuOpen && (
        <div style={{ background: "#fff", borderTop: "1px solid #F1F5F9", padding: "12px 24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 99, padding: "8px 16px", marginBottom: 16 }}>
            <SearchIcon />
            <input
              value={navQuery}
              onChange={(e) => setNavQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") goSearch(true); }}
              placeholder="Search items..."
              style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, color: "#0F172A", outline: "none" }}
            />
          </div>
          {[["Home", "/"], ["Search", "/search"], ["Post", "/post"]].map(([label, href]) => (
            <a key={label} href={href} onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "12px 0", fontSize: 15, fontWeight: 400, color: "#475569", textDecoration: "none", borderBottom: "1px solid #F1F5F9" }}>
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

export default function SecuritySettingsPage() {
  const supabase = createClient();
  const isMobile = useIsMobile();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleSave() {
    if (!form.newPassword || !form.confirmPassword) {
      showToast("Please fill in all fields.", "error");
      return;
    }
    if (form.newPassword.length < 8) {
      showToast("New password must be at least 8 characters.", "error");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password: form.newPassword,
    });

    setSaving(false);

    if (error) {
      showToast(error.message || "Failed to update password.", "error");
    } else {
      showToast("Password updated successfully.", "success");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }

  const s = styles;

  const settingsNav = [
    { label: "Profile", href: "/profile", active: false },
    { label: "My Listings", href: "/my-listings", active: false },
    { label: "Security", href: "/security", active: true },
  ];

  return (
    <div style={s.page}>
      {/* Toast */}
      {toast && (
        <div style={{
          ...s.toast,
          top: isMobile ? 12 : 20, right: isMobile ? 12 : 20, left: isMobile ? 12 : "auto",
          ...(toast.type === "error" ? s.toastError : s.toastSuccess),
        }}>
          {toast.message}
        </div>
      )}

      <Navbar />

      <div style={{ ...s.layout, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 24 : 32, padding: isMobile ? "20px 16px 40px" : "40px 16px" }}>
        {/* Sidebar */}
        {isMobile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
              {settingsNav.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  style={{
                    padding: "9px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600,
                    whiteSpace: "nowrap", textDecoration: "none", flexShrink: 0,
                    background: item.active ? "#eff6ff" : "#fff",
                    color: item.active ? "#1d4ed8" : "#4b5563",
                    border: item.active ? "1px solid #bfdbfe" : "1px solid #e5e7eb",
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>
            <button onClick={handleSignOut} style={{ ...s.signOutBtn, alignSelf: "flex-start", padding: "8px 4px" }}>
              Sign Out
            </button>
          </div>
        ) : (
          <aside style={s.sidebar}>
            <h2 style={s.sidebarTitle}>Settings</h2>
            <nav style={s.nav}>
              {settingsNav.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  style={{ ...s.navItem, ...(item.active ? s.navItemActive : {}), textDecoration: "none" }}
                >
                  {item.label}
                </a>
              ))}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
                <button onClick={handleSignOut} style={s.signOutBtn}>
                  Sign Out
                </button>
              </div>
            </nav>
          </aside>
        )}

        {/* Main */}
        <main style={s.main}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ ...s.pageTitle, fontSize: isMobile ? 21 : 26 }}>Security</h1>
            <p style={s.pageSubtitle}>Manage your password and keep your account secure.</p>
          </div>

          {/* Change Password Card */}
          <div style={{ ...s.card, padding: isMobile ? 16 : 24 }}>
            <h2 style={s.cardTitle}>Change Password</h2>
            <p style={s.cardSubtitle}>Choose a strong password you don't use on other sites.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 24 }}>
              <PasswordField
                label="Current Password"
                value={form.currentPassword}
                show={showPasswords.current}
                onToggle={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
                onChange={(v) => setForm((p) => ({ ...p, currentPassword: v }))}
                placeholder="Enter your current password"
              />
              <PasswordField
                label="New Password"
                value={form.newPassword}
                show={showPasswords.new}
                onToggle={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                onChange={(v) => setForm((p) => ({ ...p, newPassword: v }))}
                placeholder="At least 8 characters"
              />
              <PasswordField
                label="Confirm New Password"
                value={form.confirmPassword}
                show={showPasswords.confirm}
                onToggle={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                onChange={(v) => setForm((p) => ({ ...p, confirmPassword: v }))}
                placeholder="Repeat your new password"
              />
            </div>

            {/* Password strength */}
            {form.newPassword && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>Password strength</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: strengthColor(form.newPassword) }}>
                    {strengthLabel(form.newPassword)}
                  </span>
                </div>
                <div style={{ height: 4, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${strengthPercent(form.newPassword)}%`, background: strengthColor(form.newPassword), borderRadius: 99, transition: "width 0.3s, background 0.3s" }} />
                </div>
              </div>
            )}

            <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: isMobile ? "stretch" : "flex-end" }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ ...s.btnPrimary, opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: isMobile ? "100%" : "auto" }}
              >
                {saving && <div style={s.spinnerSm} />}
                {saving ? "Updating…" : "Update Password"}
              </button>
            </div>
          </div>

          {/* Tips Card */}
          <div style={{ ...s.card, padding: isMobile ? 16 : 24 }}>
            <h2 style={{ ...s.cardTitle, marginBottom: 16 }}>Password Tips</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Use at least 8 characters",
                "Mix uppercase, lowercase, numbers and symbols",
                "Avoid using your name or common words",
                "Don't reuse passwords from other sites",
              ].map((tip) => (
                <div key={tip} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>✓</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#4b5563", margin: 0 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Password Field ───────────────────────────────────────────────────────────
function PasswordField({ label, value, show, onToggle, onChange, placeholder }: {
  label: string;
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", padding: "10px 44px 10px 12px",
            border: "1px solid #d1d5db", borderRadius: 8,
            fontSize: 14, color: "#111827", outline: "none",
            boxSizing: "border-box", fontFamily: "inherit",
            background: "#fff",
          }}
        />
        <button
          onClick={onToggle}
          style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: "#9ca3af", fontSize: 13, fontWeight: 500, padding: 0,
          }}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

// ─── Password Strength ────────────────────────────────────────────────────────
function strengthPercent(password: string): number {
  let score = 0;
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 25;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 25;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 25;
  return score;
}

function strengthLabel(password: string): string {
  const p = strengthPercent(password);
  if (p <= 25) return "Weak";
  if (p <= 50) return "Fair";
  if (p <= 75) return "Good";
  return "Strong";
}

function strengthColor(password: string): string {
  const p = strengthPercent(password);
  if (p <= 25) return "#ef4444";
  if (p <= 50) return "#f97316";
  if (p <= 75) return "#eab308";
  return "#22c55e";
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f9fafb", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  toast: { position: "fixed", zIndex: 9999, padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 500, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  toastSuccess: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" },
  toastError: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" },
  layout: { maxWidth: 1024, margin: "0 auto", display: "flex" },
  sidebar: { width: 200, flexShrink: 0 },
  sidebarTitle: { fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 20px" },
  nav: { display: "flex", flexDirection: "column", gap: 4 },
  navItem: { display: "flex", alignItems: "center", padding: "10px 14px", borderRadius: 8, fontSize: 14, fontWeight: 500, color: "#4b5563", background: "none", border: "none", cursor: "pointer", textAlign: "left", width: "100%" },
  navItemActive: { background: "#eff6ff", color: "#1d4ed8" },
  signOutBtn: { display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, fontSize: 14, fontWeight: 500, color: "#dc2626", background: "none", border: "none", cursor: "pointer", width: "100%" },
  main: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 },
  pageTitle: { fontWeight: 700, color: "#111827", margin: "0 0 4px" },
  pageSubtitle: { fontSize: 14, color: "#6b7280", margin: 0 },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 4px" },
  cardSubtitle: { fontSize: 13, color: "#6b7280", margin: 0 },
  btnPrimary: { padding: "8px 18px", fontSize: 14, fontWeight: 500, color: "#fff", background: "#2563eb", border: "none", borderRadius: 8, cursor: "pointer" },
  spinnerSm: { width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
};
