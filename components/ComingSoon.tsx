export default function ComingSoonPage({ title }: { title: string }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ fontWeight: 700, fontSize: 20, color: "#1E3A8A", textDecoration: "none", letterSpacing: "-0.5px" }}>FoundLink</a>
        <a href="/" style={{ fontSize: 14, color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>← Back to Home</a>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          {/* Icon */}
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", border: "2px solid #BFDBFE" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>

          {/* Badge */}
          <span style={{ display: "inline-block", background: "#EFF6FF", color: "#2563EB", fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 99, letterSpacing: "0.5px", marginBottom: 20, border: "1px solid #BFDBFE" }}>
            COMING SOON
          </span>

          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", margin: "0 0 12px", letterSpacing: "-0.5px" }}>{title}</h1>
          <p style={{ fontSize: 15, color: "#64748B", lineHeight: 1.7, margin: "0 0 36px" }}>
            We're working hard to bring this page to life. Check back soon — it won't be long!
          </p>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/" style={{ padding: "11px 24px", borderRadius: 99, background: "#2563EB", color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
              Go Home
            </a>
            <a href="/search" style={{ padding: "11px 24px", borderRadius: 99, border: "1.5px solid #CBD5E1", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
              Browse Items
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: "#fff", borderTop: "1px solid #E2E8F0", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>© 2024 FoundLink. All rights reserved.</p>
      </footer>
    </div>
  );
}
