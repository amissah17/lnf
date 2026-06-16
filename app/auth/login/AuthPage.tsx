"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px",
  border: "1.5px solid #E2E8F0", borderRadius: 10,
  fontSize: 14, color: "#0F172A", outline: "none",
  background: "#fff", fontFamily: "inherit",
  transition: "border-color 0.15s",
};

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const [mode, setMode] = useState<Mode>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const supabase = createClient();

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email || !password || (mode === "signup" && !fullName)) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        setSuccess("Account created! Check your email to confirm, then log in.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#F1F5F9",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Navbar */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "0 24px", height: 60, display: "flex", alignItems: "center" }}>
        <a href="/" style={{ fontWeight: 700, fontSize: 20, color: "#1E3A8A", letterSpacing: "-0.5px", textDecoration: "none" }}>
          FoundLink
        </a>
      </nav>

      {/* Split layout */}
      <div style={{ flex: 1, display: "flex" }}>
        {/* Left: hero panel */}
        <div style={{
          flex: 1, background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "60px 48px", color: "#fff",
        }}>
          <div style={{ maxWidth: 400 }}>
            {/* Logo mark */}
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 32,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.15, marginBottom: 16 }}>
              Reuniting what's lost with where it belongs.
            </h1>
            <p style={{ fontSize: 15, color: "#BFDBFE", lineHeight: 1.65, marginBottom: 40 }}>
              Join thousands of community members helping return lost items to their owners every day.
            </p>
            {/* Stats */}
            <div style={{ display: "flex", gap: 32 }}>
              {[["12.5k", "Items returned"], ["4.8★", "Community rating"], ["2 min", "Avg. post time"]].map(([val, label]) => (
                <div key={label}>
                  <p style={{ fontSize: 22, fontWeight: 800, margin: "0 0 2px" }}>{val}</p>
                  <p style={{ fontSize: 12, color: "#93C5FD", margin: 0 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: form panel */}
        <div style={{
          width: 480, background: "#fff",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "48px 48px",
          overflowY: "auto",
        }}>
          <div style={{ maxWidth: 360, margin: "0 auto", width: "100%" }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px", marginBottom: 6 }}>
              {mode === "signup" ? "Create an account" : "Welcome back"}
            </h2>
            <p style={{ fontSize: 14, color: "#64748B", marginBottom: 32 }}>
              {mode === "signup"
                ? "Start helping your community find lost items."
                : "Sign in to continue to FoundLink."}
            </p>

            {/* Error / success */}
            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: "#DC2626", margin: 0 }}>{error}</p>
              </div>
            )}
            {success && (
              <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: "#16A34A", margin: 0 }}>{success}</p>
              </div>
            )}

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {mode === "signup" && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Full Name</label>
                  <input
                    style={inputStyle}
                    placeholder="John Mensah"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onFocus={(e) => e.target.style.borderColor = "#2563EB"}
                    onBlur={(e) => e.target.style.borderColor = "#E2E8F0"}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Email</label>
                <input
                  type="email"
                  style={inputStyle}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = "#2563EB"}
                  onBlur={(e) => e.target.style.borderColor = "#E2E8F0"}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    style={{ ...inputStyle, paddingRight: 42 }}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={(e) => e.target.style.borderColor = "#2563EB"}
                    onBlur={(e) => e.target.style.borderColor = "#E2E8F0"}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", color: "#94A3B8",
                      display: "flex", alignItems: "center",
                    }}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {mode === "login" && (
                  <div style={{ textAlign: "right", marginTop: 6 }}>
                    <a href="#" style={{ fontSize: 12, color: "#2563EB" }}>Forgot password?</a>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%", marginTop: 24,
                padding: "13px 0", borderRadius: 10,
                background: loading ? "#93C5FD" : "#2563EB",
                border: "none", color: "#fff",
                fontWeight: 700, fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.15s",
              }}
            >
              {loading ? "Please wait…" : mode === "signup" ? "Create Account" : "Sign In"}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              <span style={{ fontSize: 12, color: "#94A3B8" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            </div>

            {/* Toggle mode */}
            <p style={{ textAlign: "center", fontSize: 14, color: "#64748B" }}>
              {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
              <button
                onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); setSuccess(""); }}
                style={{ background: "none", border: "none", color: "#2563EB", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
              >
                {mode === "signup" ? "Sign in" : "Create one"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
