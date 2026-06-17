"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

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

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ["Electronics", "Clothing", "Accessories", "Pets", "Wallets", "Keys", "Bags", "Documents", "Jewelry", "Other"];
const CONDITIONS = ["Excellent", "Good", "Fair", "Poor"];
const STATUSES = [{ value: "found", label: "Found" }, { value: "lost", label: "Lost" }];

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

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
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
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ query, setQuery, onSearch }: { query: string; setQuery: (q: string) => void; onSearch: () => void }) {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "#fff", borderBottom: "1px solid #E2E8F0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: 20, color: "#1E3A8A", letterSpacing: "-0.5px", textDecoration: "none", flexShrink: 0 }}>FoundLink</Link>

        {isMobile ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/messages" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>
              <MessageIcon />
            </Link>
            <Link href="/profile" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>
              <UserIcon />
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569" }}>
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 24, flexShrink: 0 }}>
              {[["Home", "/"], ["Search", "/search"], ["Post", "/post"]].map(([label, href]) => (
                <Link key={label} href={href} style={{ fontSize: 14, fontWeight: label === "Search" ? 600 : 400, color: label === "Search" ? "#2563EB" : "#475569", textDecoration: label === "Search" ? "underline" : "none", textUnderlineOffset: 4 }}>{label}</Link>
              ))}
            </div>
            {/* Desktop search bar */}
            <div style={{ flex: 1, maxWidth: 400, display: "flex", background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ padding: "0 12px", display: "flex", alignItems: "center", color: "#94A3B8" }}><SearchIcon /></div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                placeholder="Search items..."
                style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: "#0F172A", padding: "10px 0", outline: "none", fontFamily: "inherit" }}
              />
              <button onClick={onSearch} style={{ background: "#2563EB", color: "#fff", border: "none", padding: "0 16px", fontWeight: 600, fontSize: 13, cursor: "pointer", borderRadius: "0 99px 99px 0" }}>Search</button>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <Link href="/messages" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}><MessageIcon /></Link>
              <Link href="/profile" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}><UserIcon /></Link>
            </div>
          </>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{ background: "#fff", borderTop: "1px solid #F1F5F9", padding: "12px 24px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 99, padding: "8px 16px", marginBottom: 16 }}>
            <SearchIcon />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { onSearch(); setMenuOpen(false); } }}
              placeholder="Search items..."
              style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, color: "#64748B", outline: "none" }}
            />
          </div>
          {[["Home", "/"], ["Search", "/search"], ["Post", "/post"]].map(([label, href]) => (
            <Link key={label} href={href} onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "12px 0", fontSize: 15, fontWeight: label === "Search" ? 600 : 400, color: label === "Search" ? "#2563EB" : "#475569", textDecoration: "none", borderBottom: "1px solid #F1F5F9" }}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

// ─── Filter Panel Content (shared between sidebar & drawer) ───────────────────
function FilterPanelContent({ filters, setFilters, onReset }: {
  filters: { category: string; condition: string; status: string };
  setFilters: (f: any) => void;
  onReset: () => void;
}) {
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>{title}</p>
      {children}
    </div>
  );

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", display: "flex", alignItems: "center", gap: 6, margin: 0 }}><FilterIcon /> Filters</p>
        <button onClick={onReset} style={{ fontSize: 12, color: "#2563EB", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Reset all</button>
      </div>

      <Section title="Status">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[{ value: "", label: "All" }, ...STATUSES].map(({ value, label }) => (
            <label key={value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: filters.status === value ? "#2563EB" : "#374151", fontWeight: filters.status === value ? 600 : 400 }}>
              <input type="radio" name="status" checked={filters.status === value} onChange={() => setFilters((f: any) => ({ ...f, status: value }))} style={{ accentColor: "#2563EB" }} />
              {label}
            </label>
          ))}
        </div>
      </Section>

      <Section title="Category">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[{ value: "", label: "All Categories" }, ...CATEGORIES.map((c) => ({ value: c, label: c }))].map(({ value, label }) => (
            <label key={value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: filters.category === value ? "#2563EB" : "#374151", fontWeight: filters.category === value ? 600 : 400 }}>
              <input type="radio" name="category" checked={filters.category === value} onChange={() => setFilters((f: any) => ({ ...f, category: value }))} style={{ accentColor: "#2563EB" }} />
              {label}
            </label>
          ))}
        </div>
      </Section>

      <Section title="Condition">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[{ value: "", label: "Any" }, ...CONDITIONS.map((c) => ({ value: c, label: c }))].map(({ value, label }) => (
            <label key={value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: filters.condition === value ? "#2563EB" : "#374151", fontWeight: filters.condition === value ? 600 : 400 }}>
              <input type="radio" name="condition" checked={filters.condition === value} onChange={() => setFilters((f: any) => ({ ...f, condition: value }))} style={{ accentColor: "#2563EB" }} />
              {label}
            </label>
          ))}
        </div>
      </Section>
    </>
  );
}

// ─── Sidebar (desktop) ────────────────────────────────────────────────────────
function Sidebar({ filters, setFilters, onReset }: {
  filters: { category: string; condition: string; status: string };
  setFilters: (f: any) => void;
  onReset: () => void;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 20, position: "sticky", top: 76 }}>
      <FilterPanelContent filters={filters} setFilters={setFilters} onReset={onReset} />
    </div>
  );
}

// ─── Filter Drawer (mobile) ───────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilters, onReset }: {
  open: boolean;
  onClose: () => void;
  filters: { category: string; condition: string; status: string };
  setFilters: (f: any) => void;
  onReset: () => void;
}) {
  if (!open) return null;
  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 98 }} />
      {/* Drawer */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 20px 36px", zIndex: 99, maxHeight: "82vh", overflowY: "auto" }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, background: "#E2E8F0", borderRadius: 99, margin: "0 auto 20px" }} />
        <FilterPanelContent filters={filters} setFilters={setFilters} onReset={onReset} />
        <button
          onClick={onClose}
          style={{ width: "100%", padding: "12px 0", background: "#2563EB", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 4 }}
        >
          Show Results
        </button>
      </div>
    </>
  );
}

// ─── Item Card ────────────────────────────────────────────────────────────────
function ItemCard({ item }: { item: Item }) {
  const [hovered, setHovered] = useState(false);
  const isFound = item.status === "found";
  const date = new Date(item.found_date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <Link href={`/items/${item.id}`} style={{ textDecoration: "none", display: "block", minWidth: 0 }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "#fff", borderRadius: 14, overflow: "hidden",
          border: "1px solid #E2E8F0",
          boxShadow: hovered ? "0 8px 24px rgba(37,99,235,0.1)" : "0 1px 4px rgba(0,0,0,0.04)",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
          transition: "all 0.2s ease", cursor: "pointer",
          height: "100%",
        }}
      >
        <div style={{ position: "relative", height: 150, background: "#F1F5F9", overflow: "hidden", flexShrink: 0 }}>
          {item.photos?.[0] ? (
            <img src={item.photos[0]} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", transform: hovered ? "scale(1.04)" : "scale(1)", transition: "transform 0.3s" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#CBD5E1", fontSize: 12 }}>No photo</div>
          )}
          <span style={{ position: "absolute", top: 8, left: 8, background: isFound ? "#059669" : "#EF4444", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {isFound ? "Found" : "Lost"}
          </span>
        </div>
        <div style={{ padding: "10px 12px 12px" }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: "#0F172A", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{item.title}</p>
          <p style={{ fontSize: 10, color: "#94A3B8", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.category} · {date}</p>
          <p style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#64748B", marginBottom: 10, overflow: "hidden", minWidth: 0 }}>
            <span style={{ flexShrink: 0 }}><MapPinIcon /></span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.location}</span>
          </p>
          <div style={{ width: "100%", padding: "7px 0", border: "1.5px solid #2563EB", borderRadius: 8, background: "transparent", color: "#2563EB", fontWeight: 600, fontSize: 12, textAlign: "center" }}>
            View Details
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ query }: { query: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <SearchIcon />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>No items found</h3>
      <p style={{ fontSize: 14, color: "#64748B", maxWidth: 340, margin: "0 auto 24px", lineHeight: 1.6 }}>
        {query ? `No results for "${query}". Try different keywords or adjust your filters.` : "No items match your filters. Try resetting them."}
      </p>
      <Link href="/post" style={{ display: "inline-block", padding: "10px 24px", borderRadius: 99, background: "#2563EB", color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
        Report a Found Item
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const isMobile = useIsMobile();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    condition: "",
    status: "",
  });
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("items")
      .select("id, title, category, description, status, location, found_date, photos, condition", { count: "exact" })
      .order("created_at", { ascending: false });

    if (query.trim()) {
      q = q.textSearch("title", query.trim(), { type: "websearch", config: "english" });
    }
    if (filters.category) q = q.eq("category", filters.category);
    if (filters.condition) q = q.eq("condition", filters.condition);
    if (filters.status) q = q.eq("status", filters.status);

    const { data, error, count } = await q.limit(24);
    if (!error && data) { setItems(data); setTotal(count || 0); }
    setLoading(false);
  }, [query, filters]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filters.category) params.set("category", filters.category);
    router.push(`/search?${params.toString()}`);
    fetchItems();
  };

  const resetFilters = () => {
    setFilters({ category: "", condition: "", status: "" });
    setQuery("");
  };

  const activeFilters = [
    filters.category && { key: "category", label: filters.category },
    filters.condition && { key: "condition", label: filters.condition },
    filters.status && { key: "status", label: filters.status === "found" ? "Found" : "Lost" },
  ].filter(Boolean) as { key: string; label: string }[];

  // Responsive grid columns
  const gridCols = isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)";

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      <Navbar query={query} setQuery={setQuery} onSearch={handleSearch} />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "20px 16px 64px" : "32px 24px 64px", boxSizing: "border-box", overflowX: "hidden" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 12, marginBottom: 20, flexDirection: isMobile ? "column" : "row" }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px", marginBottom: 4 }}>
              {query ? `Results for "${query}"` : "Browse All Items"}
            </h1>
            <p style={{ fontSize: 14, color: "#64748B" }}>
              {loading ? "Searching…" : `${total} item${total !== 1 ? "s" : ""} found`}
            </p>
          </div>

          {/* Mobile: Filter button */}
          {isMobile && (
            <button
              onClick={() => setDrawerOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 99, border: "1.5px solid #E2E8F0", background: "#fff", fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}
            >
              <FilterIcon />
              Filters
              {activeFilters.length > 0 && (
                <span style={{ background: "#2563EB", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99, minWidth: 16, textAlign: "center" }}>
                  {activeFilters.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {activeFilters.map(({ key, label }) => (
              <span key={key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 99, background: "#EFF6FF", border: "1px solid #BFDBFE", fontSize: 12, color: "#2563EB", fontWeight: 600 }}>
                {label}
                <button onClick={() => setFilters((f: any) => ({ ...f, [key]: "" }))} style={{ background: "none", border: "none", cursor: "pointer", color: "#2563EB", display: "flex", padding: 0 }}><XIcon /></button>
              </span>
            ))}
          </div>
        )}

        {/* Body: sidebar + results (desktop) / results only (mobile) */}
        {isMobile ? (
          // Mobile: full-width results grid
          <div style={{ minWidth: 0 }}>
            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 10 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden", minWidth: 0 }}>
                    <div style={{ height: 150, background: "linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.2s infinite" }} />
                    <div style={{ padding: 12 }}>
                      <div style={{ height: 13, background: "#F1F5F9", borderRadius: 4, marginBottom: 8, width: "70%" }} />
                      <div style={{ height: 11, background: "#F1F5F9", borderRadius: 4, width: "40%" }} />
                    </div>
                  </div>
                ))}
                <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
              </div>
            ) : items.length === 0 ? (
              <EmptyState query={query} />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 10 }}>
                {items.map((item) => <ItemCard key={item.id} item={item} />)}
              </div>
            )}
          </div>
        ) : (
          // Desktop: sidebar + results
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24, alignItems: "start" }}>
            <Sidebar filters={filters} setFilters={setFilters} onReset={resetFilters} />
            <div>
              {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 16 }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
                      <div style={{ height: 180, background: "linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.2s infinite" }} />
                      <div style={{ padding: 16 }}>
                        <div style={{ height: 14, background: "#F1F5F9", borderRadius: 4, marginBottom: 8, width: "70%" }} />
                        <div style={{ height: 12, background: "#F1F5F9", borderRadius: 4, width: "40%" }} />
                      </div>
                    </div>
                  ))}
                  <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
                </div>
              ) : items.length === 0 ? (
                <EmptyState query={query} />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 16 }}>
                  {items.map((item) => <ItemCard key={item.id} item={item} />)}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onReset={resetFilters}
      />

      {/* Footer */}
      <footer style={{ background: "#fff", borderTop: "1px solid #E2E8F0", padding: isMobile ? "24px 16px" : "28px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: isMobile ? 16 : 15, color: "#1E3A8A", marginBottom: 2 }}>FoundLink</p>
            <p style={{ fontSize: 12, color: "#94A3B8" }}>© 2024 FoundLink. All rights reserved.</p>
          </div>
          <div style={{ display: "flex", gap: isMobile ? 12 : 20, flexWrap: "wrap" }}>
            {[{name:"Community Guidelines", url:"/community-guidelines"}, {name:"Safety Tips", url:"/safety-tips"}, {name:"Privacy Policy", url:"/privacy-policy"}, {name:"Contact Support", url:"/contact-support"}].map((l) => (
              <Link key={l.name} href={l.url} style={{ fontSize: isMobile ? 12 : 13, color: "#64748B", textDecoration: "none" }}>{l.name}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
