"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar_url: string;
  updated_at: string;
}

export default function ProfileSettingsPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setForm({
          full_name: data.full_name ?? "",
          email: data.email ?? user.email ?? "",
          phone: data.phone ?? "",
          location: data.location ?? "",
          bio: data.bio ?? "",
          avatar_url: data.avatar_url ?? "",
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      ...form,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) showToast("Failed to save changes.", "error");
    else showToast("Profile saved successfully.", "success");
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 800 * 1024) { showToast("Image must be under 800KB.", "error"); return; }
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const filePath = `avatars/${user.id}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (uploadError) { showToast("Failed to upload image.", "error"); setUploadingAvatar(false); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    setForm((p) => ({ ...p, avatar_url: data.publicUrl }));
    await supabase.from("profiles").upsert({ id: user.id, avatar_url: data.publicUrl, updated_at: new Date().toISOString() });
    setUploadingAvatar(false);
    showToast("Profile picture updated.", "success");
  }

  async function handleRemoveAvatar() {
    if (!user) return;
    setForm((p) => ({ ...p, avatar_url: "" }));
    await supabase.from("profiles").upsert({ id: user.id, avatar_url: "", updated_at: new Date().toISOString() });
    showToast("Profile picture removed.", "success");
  }

  function handleCancel() {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      location: profile.location ?? "",
      bio: profile.bio ?? "",
      avatar_url: profile.avatar_url ?? "",
    });
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  }

  const updatedAt = profile?.updated_at
    ? new Date(profile.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  const s = styles;

  if (loading) {
    return (
      <div style={s.loadingWrap}>
        <div style={s.spinner} />
        <p style={{ color: "#6b7280", fontSize: 14 }}>Loading your profile…</p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      {/* Toast */}
      {toast && (
        <div style={{ ...s.toast, ...(toast.type === "error" ? s.toastError : s.toastSuccess) }}>
          {toast.message}
        </div>
      )}

      <div style={s.layout}>
        {/* Sidebar */}
        <aside style={s.sidebar}>
          <h2 style={s.sidebarTitle}>Settings</h2>
          <nav style={s.nav}>
            {[
              { label: "Profile", href: "/profile", active: true },
              { label: "My Listings", href: "/my-listings", active: false },
              { label: "Security", href: "/security", active: false },
            ].map((item) => (
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

        {/* Main */}
        <main style={s.main}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={s.pageTitle}>Profile Settings</h1>
            <p style={s.pageSubtitle}>Manage your public information and how other community members see you.</p>
          </div>

          {/* Avatar card */}
          <div style={s.card}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ position: "relative" }}>
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt="Profile" style={s.avatar} />
                ) : (
                  <div style={s.avatarPlaceholder}>
                    {form.full_name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                {uploadingAvatar && <div style={s.avatarOverlay}><div style={s.spinnerSm} /></div>}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: 4 }}>Profile Picture</p>
                <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>JPG, GIF or PNG. Max size of 800K.</p>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload} />
                  <button onClick={() => fileInputRef.current?.click()} style={s.btnOutline} disabled={uploadingAvatar}>
                    Upload New
                  </button>
                  {form.avatar_url && (
                    <button onClick={handleRemoveAvatar} style={s.btnRemove}>Remove</button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form card */}
          <div style={s.card}>
            <div style={s.grid2}>
              <Field label="Full Name">
                <input style={s.input} type="text" value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} placeholder="Your full name" />
              </Field>

              <Field label="Email Address">
                <div style={{ position: "relative" }}>
                  <input style={{ ...s.input, paddingRight: 36 }} type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="you@example.com" />
                  {user?.email_confirmed_at && (
                    <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#22c55e", fontSize: 16 }}>✓</span>
                  )}
                </div>
              </Field>

              <Field label="Phone Number">
                <input style={s.input} type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 0000-0000" />
              </Field>

              <Field label="Location">
                <input style={s.input} type="text" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="City, Country" />
              </Field>

              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Bio" optional>
                  <textarea style={{ ...s.input, height: 100, resize: "vertical" }} value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Tell your community a little about yourself…" />
                </Field>
              </div>
            </div>

            <div style={s.formFooter}>
              {updatedAt ? (
                <p style={{ fontSize: 12, color: "#9ca3af" }}>Last updated: {updatedAt}</p>
              ) : <span />}
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={handleCancel} style={s.btnOutline}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{ ...s.btnPrimary, opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>

          {/* Stats card */}
          <div style={s.card}>
            <div style={s.statsGrid}>
              {[
                { label: "ACCOUNT STATUS", value: "Verified", icon: "✓", bg: "#eff6ff", color: "#2563eb" },
                { label: "COMMUNITY KARMA", value: "420 pts", icon: "★", bg: "#fefce8", color: "#ca8a04" },
                { label: "ITEMS RETURNED", value: "12 Found", icon: "✦", bg: "#f0fdf4", color: "#16a34a" },
              ].map((stat) => (
                <div key={stat.label} style={s.statItem}>
                  <div style={{ ...s.statIcon, background: stat.bg, color: stat.color }}>{stat.icon}</div>
                  <div>
                    <p style={s.statLabel}>{stat.label}</p>
                    <p style={s.statValue}>{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>
        {label}{optional && <span style={{ color: "#9ca3af", fontWeight: 400 }}> (Optional)</span>}
      </label>
      {children}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f9fafb", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  loadingWrap: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: "#f9fafb" },
  spinner: { width: 32, height: 32, border: "3px solid #2563eb", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
  spinnerSm: { width: 20, height: 20, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
  toast: { position: "fixed", top: 20, right: 20, zIndex: 9999, padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 500, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  toastSuccess: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" },
  toastError: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" },
  layout: { maxWidth: 1024, margin: "0 auto", padding: "40px 16px", display: "flex", gap: 32 },
  sidebar: { width: 200, flexShrink: 0 },
  sidebarTitle: { fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 20, margin: "0 0 20px" },
  nav: { display: "flex", flexDirection: "column", gap: 4 },
  navItem: { display: "flex", alignItems: "center", padding: "10px 14px", borderRadius: 8, fontSize: 14, fontWeight: 500, color: "#4b5563", background: "none", border: "none", cursor: "pointer", textAlign: "left", width: "100%" },
  navItemActive: { background: "#eff6ff", color: "#1d4ed8" },
  signOutBtn: { display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, fontSize: 14, fontWeight: 500, color: "#dc2626", background: "none", border: "none", cursor: "pointer", width: "100%" },
  main: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 },
  pageTitle: { fontSize: 26, fontWeight: 700, color: "#111827", margin: "0 0 4px" },
  pageSubtitle: { fontSize: 14, color: "#6b7280", margin: 0 },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 },
  avatar: { width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid #e5e7eb" },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#2563eb", border: "2px solid #e5e7eb" },
  avatarOverlay: { position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, color: "#111827", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  formFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24, paddingTop: 20, borderTop: "1px solid #f3f4f6" },
  btnOutline: { padding: "8px 18px", fontSize: 14, fontWeight: 500, color: "#4b5563", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", cursor: "pointer" },
  btnPrimary: { padding: "8px 18px", fontSize: 14, fontWeight: 500, color: "#fff", background: "#2563eb", border: "none", borderRadius: 8, cursor: "pointer" },
  btnRemove: { fontSize: 14, fontWeight: 500, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: "8px 0" },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
  statItem: { display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 12, background: "#f9fafb" },
  statIcon: { width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 },
  statLabel: { fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 2px" },
  statValue: { fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 },
};
