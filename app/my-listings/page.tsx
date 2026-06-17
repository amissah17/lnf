"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Item {
  id: string;
  title: string;
  category: string;
  description: string;
  status: string;
  location: string;
  found_date: string;
  photos: string[];
  condition: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const MapPinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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
          // Mobile: icons + hamburger
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="/messages" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}><MessageIcon /></a>
            <a href="/profile" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}><UserIcon /></a>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569" }}>
              {menuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        ) : (
          // Desktop: nav links + search + icons
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

      {/* Mobile menu dropdown */}
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

// ─── Item Card ────────────────────────────────────────────────────────────────
function ItemCard({ item, onDelete }: { item: Item; onDelete: (id: string) => void }) {
  const isMobile = useIsMobile();
  const [hovered, setHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isFound = item.status === "found";
  const date = new Date(item.found_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false); }}
      style={{
        background: "#fff", borderRadius: 14, overflow: "hidden",
        border: "1px solid #E2E8F0",
        boxShadow: hovered ? "0 8px 24px rgba(37,99,235,0.1)" : "0 1px 4px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.2s ease",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: isMobile ? 130 : 180, background: "#F1F5F9", overflow: "hidden" }}>
        {item.photos?.[0] ? (
          <img src={item.photos[0]} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", transform: hovered ? "scale(1.04)" : "scale(1)", transition: "transform 0.3s" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#CBD5E1", fontSize: 13 }}>No photo</div>
        )}
        <span style={{ position: "absolute", top: 10, left: 10, background: isFound ? "#059669" : "#EF4444", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {isFound ? "Found" : "Lost"}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: isMobile ? "12px 12px 14px" : "14px 16px 16px" }}>
        <p style={{ fontWeight: 700, fontSize: isMobile ? 13 : 14, color: "#0F172A", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</p>
        <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.category} · {date}</p>
        <p style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748B", marginBottom: isMobile ? 12 : 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          <MapPinIcon /> {item.location}
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: isMobile ? 6 : 8 }}>
          <a
            href={`/items/${item.id}`}
            style={{ flex: 1, padding: isMobile ? "7px 0" : "8px 0", border: "1.5px solid #2563EB", borderRadius: 8, background: "transparent", color: "#2563EB", fontWeight: 600, fontSize: isMobile ? 12 : 13, textAlign: "center", textDecoration: "none", display: "block" }}
          >
            View
          </a>
          <a
            href={`/items/${item.id}/edit`}
            style={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, flexShrink: 0, border: "1.5px solid #E2E8F0", borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", textDecoration: "none" }}
          >
            <EditIcon />
          </a>
          {confirmDelete ? (
            <button
              onClick={() => onDelete(item.id)}
              style={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, flexShrink: 0, border: "1.5px solid #EF4444", borderRadius: 8, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", cursor: "pointer" }}
              title="Confirm delete"
            >
              <TrashIcon />
            </button>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, flexShrink: 0, border: "1.5px solid #E2E8F0", borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", cursor: "pointer" }}
              title="Delete item"
            >
              <TrashIcon />
            </button>
          )}
        </div>
        {confirmDelete && (
          <p style={{ fontSize: 11, color: "#EF4444", marginTop: 8, textAlign: "center" }}>Click trash again to confirm delete</p>
        )}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  const isMobile = useIsMobile();
  return (
    <div style={{ textAlign: "center", padding: isMobile ? "56px 16px" : "80px 24px", gridColumn: "1 / -1" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <SearchIcon />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>No listings yet</h3>
      <p style={{ fontSize: 14, color: "#64748B", maxWidth: 300, margin: "0 auto 24px", lineHeight: 1.6 }}>
        You haven't posted any items yet. Found something? Report it to help your community.
      </p>
      <a href="/post" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 99, background: "#2563EB", color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
        <PlusIcon /> Post an Item
      </a>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MyListingsPage() {
  const supabase = createClient();
  const isMobile = useIsMobile();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "found" | "lost">("all");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("items")
        .select("id, title, category, description, status, location, found_date, photos, condition")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setItems(data);
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) {
      showToast("Failed to delete item.", "error");
    } else {
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast("Item deleted.", "success");
    }
  }

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);
  const gridColumns = isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(260px, 1fr))";
  const gridGap = isMobile ? 12 : 20;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: isMobile ? 12 : 20, right: isMobile ? 12 : 20, left: isMobile ? 12 : "auto", zIndex: 9999,
          padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 500,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          ...(toast.type === "success"
            ? { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }
            : { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" })
        }}>
          {toast.message}
        </div>
      )}

      <Navbar />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "20px 16px 40px" : "32px 24px 64px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", marginBottom: isMobile ? 20 : 24, gap: isMobile ? 12 : 16 }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px", marginBottom: 4 }}>My Listings</h1>
            <p style={{ fontSize: 14, color: "#64748B" }}>
              {loading ? "Loading…" : `${filtered.length} item${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <a
            href="/post"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: isMobile ? "9px 18px" : "10px 20px", borderRadius: 99, background: "#2563EB", color: "#fff", fontWeight: 600, fontSize: isMobile ? 13 : 14, textDecoration: "none" }}
          >
            <PlusIcon /> Post Item
          </a>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: isMobile ? 20 : 24, background: "#F1F5F9", borderRadius: 10, padding: 4, width: "fit-content", maxWidth: "100%", overflowX: "auto" }}>
          {(["all", "found", "lost"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: isMobile ? "6px 14px" : "7px 20px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600, transition: "all 0.15s", whiteSpace: "nowrap",
                background: filter === tab ? "#fff" : "transparent",
                color: filter === tab ? "#0F172A" : "#64748B",
                boxShadow: filter === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                textTransform: "capitalize",
              }}
            >
              {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span style={{ marginLeft: 6, fontSize: 11, color: filter === tab ? "#2563EB" : "#94A3B8", fontWeight: 700 }}>
                {tab === "all" ? items.length : items.filter((i) => i.status === tab).length}
              </span>
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: gridColumns, gap: gridGap }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
                <div style={{ height: isMobile ? 130 : 180, background: "linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.2s infinite" }} />
                <div style={{ padding: isMobile ? 12 : 16 }}>
                  <div style={{ height: 14, background: "#F1F5F9", borderRadius: 4, marginBottom: 8, width: "70%" }} />
                  <div style={{ height: 12, background: "#F1F5F9", borderRadius: 4, width: "40%" }} />
                </div>
              </div>
            ))}
            <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: gridColumns, gap: gridGap }}>
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: "#fff", borderTop: "1px solid #E2E8F0", padding: isMobile ? "24px 16px" : "28px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: isMobile ? 16 : 12 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: "#1E3A8A", marginBottom: 2 }}>FoundLink</p>
            <p style={{ fontSize: 12, color: "#94A3B8" }}>© 2024 FoundLink. All rights reserved.</p>
          </div>
          <div style={{ display: "flex", gap: isMobile ? 12 : 20, flexWrap: "wrap" }}>
            {["Community Guidelines", "Safety Tips", "Privacy Policy", "Contact Support"].map((l) => (
              <a key={l} href="#" style={{ fontSize: isMobile ? 12 : 13, color: "#64748B", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
