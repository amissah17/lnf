"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const MapPinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
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

// ─── Types ────────────────────────────────────────────────────────────────────
type Item = {
  id: number | string;
  title: string;
  location: string;
  status: string;
  photos?: string[] | null;
};

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
function Navbar({ router }: { router: ReturnType<typeof useRouter> }) {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "#fff", borderBottom: "1px solid #E2E8F0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <span style={{ fontWeight: 700, fontSize: 20, color: "#1E3A8A", letterSpacing: "-0.5px" }}>FoundLink</span>

        {isMobile ? (
          // Mobile: hamburger + icons
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/messages" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>
              <MessageIcon />
            </Link>
            <Link href="/profile" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>
              <UserIcon />
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569" }}>
              {menuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        ) : (
          // Desktop: nav links + search + icons
          <>
            <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
              {[{ name: "Home", url: "/" }, { name: "Search", url: "/search" }, { name: "Post", url: "/post" }].map((alink) => (
                <Link key={alink.name} href={alink.url} style={{ fontSize: 14, fontWeight: alink.name === "Home" ? 600 : 400, color: alink.name === "Home" ? "#2563EB" : "#475569", textDecoration: alink.name === "Home" ? "underline" : "none", textUnderlineOffset: 4 }}>
                  {alink.name}
                </Link>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 99, padding: "6px 14px" }}>
                <SearchIcon />
                <input
                  placeholder="Search items..."
                  style={{ border: "none", background: "transparent", fontSize: 13, color: "#64748B", outline: "none", width: 140 }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value.trim();
                      router.push(val ? `/search?q=${encodeURIComponent(val)}` : "/search");
                    }
                  }}
                />
              </div>
              <Link href="/messages" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>
                <MessageIcon />
              </Link>
              <Link href="/profile" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>
                <UserIcon />
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Mobile menu dropdown */}
      {isMobile && menuOpen && (
        <div style={{ background: "#fff", borderTop: "1px solid #F1F5F9", padding: "12px 24px 20px" }}>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 99, padding: "8px 16px", marginBottom: 16 }}>
            <SearchIcon />
            <input
              placeholder="Search items..."
              style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, color: "#64748B", outline: "none" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value.trim();
                  router.push(val ? `/search?q=${encodeURIComponent(val)}` : "/search");
                  setMenuOpen(false);
                }
              }}
            />
          </div>
          {/* Nav links */}
          {[{ name: "Home", url: "/" }, { name: "Search", url: "/search" }, { name: "Post", url: "/post" }].map((alink) => (
            <Link key={alink.name} href={alink.url} onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "12px 0", fontSize: 15, fontWeight: alink.name === "Home" ? 600 : 400, color: alink.name === "Home" ? "#2563EB" : "#475569", textDecoration: "none", borderBottom: "1px solid #F1F5F9" }}>
              {alink.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection({ search, setSearch, router }: { search: string; setSearch: (val: string) => void; router: ReturnType<typeof useRouter> }) {
  const isMobile = useIsMobile();

  return (
    <section style={{ background: "linear-gradient(160deg, #EFF6FF 0%, #F1F5F9 60%, #F8FAFC 100%)", padding: isMobile ? "48px 20px 40px" : "80px 24px 72px", textAlign: "center" }}>
      <h1 style={{ fontSize: isMobile ? "clamp(28px, 8vw, 40px)" : "clamp(36px, 5vw, 56px)", fontWeight: 800, color: "#0F172A", lineHeight: 1.1, letterSpacing: "-1.5px", margin: "0 0 16px" }}>
        Reconnect with what you've{" "}
        <span style={{ color: "#2563EB" }}>lost</span>
      </h1>
      <p style={{ fontSize: isMobile ? 14 : 16, color: "#64748B", maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.65, padding: isMobile ? "0 4px" : 0 }}>
        FoundLink bridges the gap between lost items and their owners through community-powered discovery. Report found items or search for your belongings with ease.
      </p>

      {/* Search bar */}
      <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", background: "#fff", border: "1.5px solid #CBD5E1", borderRadius: 99, boxShadow: "0 4px 20px rgba(37,99,235,0.08)", overflow: "hidden" }}>
        <div style={{ padding: "0 12px", display: "flex", alignItems: "center", color: "#94A3B8", flexShrink: 0 }}>
          <SearchIcon />
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isMobile ? "Search lost items…" : "Search for lost items (e.g. Blue Backpack, Golden Retriever…)"}
          style={{ flex: 1, border: "none", outline: "none", fontSize: isMobile ? 13 : 14, color: "#0F172A", padding: "12px 0", background: "transparent", minWidth: 0 }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`);
              else router.push("/search");
            }
          }}
        />
        <button
          onClick={() => { if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`); else router.push("/search"); }}
          style={{ background: "#2563EB", color: "#fff", border: "none", cursor: "pointer", padding: isMobile ? "0 16px" : "0 28px", fontWeight: 600, fontSize: isMobile ? 13 : 14, borderRadius: "0 99px 99px 0", transition: "background 0.15s", flexShrink: 0 }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#1D4ED8")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#2563EB")}
        >
          Search
        </button>
      </div>
    </section>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const isFound = status === "found";
  return (
    <span style={{ position: "absolute", top: 10, left: 10, background: isFound ? "#059669" : "#EF4444", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.6px" }}>
      {isFound ? "Found" : "Lost"}
    </span>
  );
}

// ─── Item Card ────────────────────────────────────────────────────────────────
function ItemCard({ item }: { item: Item }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid #E2E8F0", boxShadow: hovered ? "0 8px 30px rgba(37,99,235,0.12)" : "0 1px 4px rgba(0,0,0,0.05)", transform: hovered ? "translateY(-3px)" : "translateY(0)", transition: "all 0.2s ease", cursor: "pointer" }}
    >
      <div style={{ position: "relative", height: 190, overflow: "hidden" }}>
        {item.photos?.[0] ? (
          <img src={item.photos[0]} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", transform: hovered ? "scale(1.04)" : "scale(1)", transition: "transform 0.3s ease" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "#CBD5E1", fontSize: 13 }}>No photo</div>
        )}
        <StatusBadge status={item.status} />
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", margin: "0 0 6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</p>
        <p style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748B", margin: "0 0 14px" }}>
          <MapPinIcon /> {item.location}
        </p>
        <Link
          href={`/items/${item.id}`}
          style={{ display: "block", width: "100%", padding: "9px 0", border: "1.5px solid #2563EB", borderRadius: 8, background: "transparent", color: "#2563EB", fontWeight: 600, fontSize: 13, textAlign: "center", textDecoration: "none", transition: "all 0.15s" }}
          onMouseOver={(e) => { e.currentTarget.style.background = "#2563EB"; e.currentTarget.style.color = "#fff"; }}
          onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#2563EB"; }}
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

// ─── Recently Found ───────────────────────────────────────────────────────────
function RecentlyFoundSection({ items }: { items: Item[] }) {
  const isMobile = useIsMobile();

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "40px 16px" : "64px 24px" }}>
      <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "flex-end", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", marginBottom: isMobile ? 20 : 32, gap: isMobile ? 8 : 0 }}>
        <div>
          <h2 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, color: "#0F172A", margin: "0 0 6px", letterSpacing: "-0.5px" }}>Recently Found</h2>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>Check if your item has been spotted in the community lately.</p>
        </div>
        <Link href="/search" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "#2563EB", textDecoration: "none", flexShrink: 0 }}>
          View all items <ArrowRightIcon />
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(240px, 1fr))", gap: isMobile ? 12 : 20 }}>
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTABanner() {
  const isMobile = useIsMobile();

  return (
    <section style={{ background: "#2563EB", padding: isMobile ? "48px 20px" : "72px 24px", textAlign: "center" }}>
      <h2 style={{ fontSize: isMobile ? 22 : "clamp(24px, 3vw, 36px)", fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.5px" }}>
        Found something that isn't yours?
      </h2>
      <p style={{ fontSize: isMobile ? 14 : 15, color: "#BFDBFE", margin: "0 0 28px", lineHeight: 1.6 }}>
        Help your community by reporting found items. It only takes a minute to make someone's day.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/post" style={{ padding: isMobile ? "11px 22px" : "13px 28px", borderRadius: 99, border: "2px solid #fff", background: "transparent", color: "#fff", fontWeight: 600, fontSize: isMobile ? 13 : 14, textDecoration: "none" }}
          onMouseOver={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#2563EB"; }}
          onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}
        >
          Report a Found Item
        </Link>
        <Link href="/how-it-works" style={{ padding: isMobile ? "11px 22px" : "13px 28px", borderRadius: 99, border: "2px solid rgba(255,255,255,0.4)", background: "transparent", color: "#fff", fontWeight: 600, fontSize: isMobile ? 13 : 14, textDecoration: "none" }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = "#fff"; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
        >
          How it Works
        </Link>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const isMobile = useIsMobile();

  return (
    <footer style={{ background: "#fff", borderTop: "1px solid #E2E8F0", padding: isMobile ? "24px 16px" : "32px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 16 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 16, color: "#1E3A8A", margin: "0 0 4px" }}>FoundLink</p>
          <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>© 2024 FoundLink. All rights reserved.<br />Your local community lost and found.</p>
        </div>
        <div style={{ display: "flex", gap: isMobile ? 12 : 24, flexWrap: "wrap" }}>
          {[{ name: "Community Guidelines", url: "/community-guidelines" }, { name: "Safety Tips", url: "/safety-tips" }, { name: "Privacy Policy", url: "/privacy-policy" }, { name: "Contact Support", url: "/contact-support" }, { name: "How it Works", url: "/how-it-works" }].map((link) => (
            <Link key={link.name} href={link.url} style={{ fontSize: isMobile ? 12 : 13, color: "#64748B", textDecoration: "none" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#2563EB")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#64748B")}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── FAB ─────────────────────────────────────────────────────────────────────
function FAB() {
  const [hovered, setHovered] = useState(false);
  const isMobile = useIsMobile();

  return (
    <Link href="/post" style={{ position: "fixed", bottom: isMobile ? 20 : 32, right: isMobile ? 20 : 32, width: isMobile ? 48 : 52, height: isMobile ? 48 : 52, borderRadius: "50%", background: "#2563EB", boxShadow: hovered ? "0 8px 24px rgba(37,99,235,0.45)" : "0 4px 12px rgba(37,99,235,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transform: hovered ? "scale(1.08)" : "scale(1)", transition: "all 0.15s", zIndex: 100 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <PlusIcon />
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const supabase = createClient();
  const [recentItems, setRecentItems] = useState<Item[]>([]);

  useEffect(() => {
    async function fetchItems() {
      const { data } = await supabase
        .from("items")
        .select("id, title, location, status, photos")
        .order("created_at", { ascending: false })
        .limit(4);
      if (data) setRecentItems(data);
    }
    fetchItems();
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      <Navbar router={router} />
      <HeroSection search={search} setSearch={setSearch} router={router} />
      <RecentlyFoundSection items={recentItems} />
      <CTABanner />
      <Footer />
      <FAB />
    </div>
  );
}
