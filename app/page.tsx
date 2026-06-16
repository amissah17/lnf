"use client";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Icons (inline SVGs to avoid deps) ───────────────────────────────────────
const SearchIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);
const MapPinIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const PlusIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const MessageIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const UserIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// ─── Category icons ───────────────────────────────────────────────────────────
const categoryIcons = {
  Electronics: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  Pets: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.344-2.5M8 14v.5M16 14v.5M11.25 16.25h1.5L12 17z" />
      <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.313" />
    </svg>
  ),
  Wallets: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <path d="M1 10h22" />
    </svg>
  ),
  Keys: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3" />
    </svg>
  ),
  Bags: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const categories = ["Electronics", "Pets", "Wallets", "Keys", "Bags"];

// const recentItems = [
//   {
//     id: 1,
//     title: "Brown Leather Wallet",
//     location: "Central Park, NYC",
//     status: "found",
//     image:
//       "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80",
//   },
//   {
//     id: 2,
//     title: "Wireless Headphones",
//     location: "Union Station",
//     status: "found",
//     image:
//       "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
//   },
//   {
//     id: 3,
//     title: "Golden Retriever",
//     location: "Riverside Drive",
//     status: "lost",
//     image:
//       "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&q=80",
//   },
//   {
//     id: 4,
//     title: "Silver Keyring",
//     location: "Coffee House Plaza",
//     status: "found",
//     image:
//       "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
//   },
// ];

const footerLinks = {
  "": [
    "Community Guidelines",
    "Safety Tips",
    "Privacy Policy",
    "Contact Support",
    "How it Works",
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function Navbar({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#fff",
        borderBottom: "1px solid #E2E8F0",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <span
          style={{
            fontWeight: 700,
            fontSize: 20,
            color: "#1E3A8A",
            letterSpacing: "-0.5px",
          }}
        >
          FoundLink
        </span>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {[
            { name: "Home", url: "/" },
            { name: "Search", url: "/search" },
            { name: "Post", url: "/post" },
          ].map((alink) => (
            <Link
              key={alink.name}
              href={alink.url}
              style={{
                fontSize: 14,
                fontWeight: alink.name === "Home" ? 600 : 400,
                color: alink.name === "Home" ? "#2563EB" : "#475569",
                textDecoration: alink.name === "Home" ? "underline" : "none",
                textUnderlineOffset: 4,
              }}
            >
              {alink.name}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Search bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: 99,
              padding: "6px 14px",
            }}
          >
            <SearchIcon />
            <input
              placeholder="Search items..."
              style={{
                border: "none",
                background: "transparent",
                fontSize: 13,
                color: "#64748B",
                outline: "none",
                width: 140,
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value.trim();
                  router.push(
                    val ? `/search?q=${encodeURIComponent(val)}` : "/search",
                  );
                }
              }}
            />
          </div>
          <Link
            href="/messages"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px solid #E2E8F0",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#475569",
            }}
          >
            <MessageIcon />
          </Link>
          <Link
            href="/profile"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px solid #E2E8F0",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#475569",
            }}
          >
            <UserIcon />
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection({ search, setSearch, router }: { 
  search: string; 
  setSearch: (val: string) => void; 
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <section
      style={{
        background:
          "linear-gradient(160deg, #EFF6FF 0%, #F1F5F9 60%, #F8FAFC 100%)",
        padding: "80px 24px 72px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(36px, 5vw, 56px)",
          fontWeight: 800,
          color: "#0F172A",
          lineHeight: 1.1,
          letterSpacing: "-1.5px",
          margin: "0 0 16px",
        }}
      >
        Reconnect with what you've{" "}
        <span style={{ color: "#2563EB" }}>lost</span>
      </h1>
      <p
        style={{
          fontSize: 16,
          color: "#64748B",
          maxWidth: 520,
          margin: "0 auto 40px",
          lineHeight: 1.65,
        }}
      >
        FoundLink bridges the gap between lost items and their owners through
        community-powered discovery. Report found items or search for your
        belongings with ease.
      </p>

      {/* Search bar */}
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto 24px",
          display: "flex",
          gap: 0,
          background: "#fff",
          border: "1.5px solid #CBD5E1",
          borderRadius: 99,
          boxShadow: "0 4px 20px rgba(37,99,235,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            color: "#94A3B8",
          }}
        >
          <SearchIcon />
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for lost items (e.g. Blue Backpack, Golden Retriever…)"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 14,
            color: "#0F172A",
            padding: "14px 0",
            background: "transparent",
          }}
        />
        <button
          onClick={() => {
            if (search.trim())
              router.push(`/search?q=${encodeURIComponent(search.trim())}`);
            else router.push("/search");
          }}
          style={{
            background: "#2563EB",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            padding: "0 28px",
            fontWeight: 600,
            fontSize: 14,
            borderRadius: "0 99px 99px 0",
            transition: "background 0.15s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#1D4ED8")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#2563EB")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (search.trim())
                router.push(`/search?q=${encodeURIComponent(search.trim())}`);
              else router.push("/search");
            }
          }}
        >
          Search
        </button>
      </div>

      {/* Category pills */}
      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/categories/${cat}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              borderRadius: 99,
              border: "1.5px solid #CBD5E1",
              background: "#fff",
              fontSize: 13,
              color: "#374151",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "#2563EB";
              e.currentTarget.style.color = "#2563EB";
              e.currentTarget.style.background = "#EFF6FF";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "#CBD5E1";
              e.currentTarget.style.color = "#374151";
              e.currentTarget.style.background = "#fff";
            }}
          >
            {categoryIcons[cat]}
            {cat}
          </Link>
        ))}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: string  }) {
  const isFound = status === "found";
  return (
    <span
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        background: isFound ? "#059669" : "#EF4444",
        color: "#fff",
        fontSize: 10,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 99,
        textTransform: "uppercase",
        letterSpacing: "0.6px",
      }}
    >
      {isFound ? "Found" : "Lost"}
    </span>
  );
}

function ItemCard({ item }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid #E2E8F0",
        boxShadow: hovered
          ? "0 8px 30px rgba(37,99,235,0.12)"
          : "0 1px 4px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
    >
      <div style={{ position: "relative", height: 190, overflow: "hidden" }}>
        <img
          src={item.photos?.[0]}
          alt={item.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: hovered ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.3s ease",
          }}
        />
        <StatusBadge status={item.status} />
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <p
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: "#0F172A",
            margin: "0 0 6px",
          }}
        >
          {item.title}
        </p>
        <p
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            color: "#64748B",
            margin: "0 0 14px",
          }}
        >
          <MapPinIcon /> {item.location}
        </p>
        <button
          style={{
            width: "100%",
            padding: "9px 0",
            border: "1.5px solid #2563EB",
            borderRadius: 8,
            background: "transparent",
            color: "#2563EB",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#2563EB";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#2563EB";
          }}
        >
          <Link href={`/items/${item.id}`}>View Details</Link>
        </button>
      </div>
    </div>
  );
}

function RecentlyFoundSection({ items }) {
  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#0F172A",
              margin: "0 0 6px",
              letterSpacing: "-0.5px",
            }}
          >
            Recently Found
          </h2>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
            Check if your item has been spotted in the community lately.
          </p>
        </div>
        <Link
          href="/search"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            fontWeight: 600,
            color: "#2563EB",
            textDecoration: "none",
          }}
        >
          View all items <ArrowRightIcon />
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 20,
        }}
      >
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section
      style={{
        background: "#2563EB",
        padding: "72px 24px",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontSize: "clamp(24px, 3vw, 36px)",
          fontWeight: 800,
          color: "#fff",
          margin: "0 0 12px",
          letterSpacing: "-0.5px",
        }}
      >
        Found something that isn't yours?
      </h2>
      <p
        style={{
          fontSize: 15,
          color: "#BFDBFE",
          margin: "0 0 36px",
          lineHeight: 1.6,
        }}
      >
        Help your community by reporting found items. It only takes a minute to
        make someone's day.
      </p>
      <div
        style={{
          display: "flex",
          gap: 14,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/post"
          style={{
            padding: "13px 28px",
            borderRadius: 99,
            border: "2px solid #fff",
            background: "transparent",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.color = "#2563EB";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#fff";
          }}
        >
          Report a Found Item
        </Link>
        <Link
          href="/how-it-works"
          style={{
            padding: "13px 28px",
            borderRadius: 99,
            border: "2px solid rgba(255,255,255,0.4)",
            background: "transparent",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = "#fff";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
          }}
        >
          How it Works
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      style={{
        background: "#fff",
        borderTop: "1px solid #E2E8F0",
        padding: "32px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <p
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: "#1E3A8A",
              margin: "0 0 4px",
            }}
          >
            FoundLink
          </p>
          <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>
            © 2024 FoundLink. All rights reserved.
            <br />
            Your local community lost and found.
          </p>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            { name: "Community Guidelines", url: "/community-guidelines" },
            { name: "Safety Tips", url: "/safety-tips" },
            { name: "Privacy Policy", url: "/privacy-policy" },
            { name: "Contact Support", url: "/contact-support" },
            { name: "How it Works", url: "/how-it-works" },
          ].map((link) => (
            <Link
              key={link.name}
              href={link.url}
              style={{ fontSize: 13, color: "#64748B", textDecoration: "none" }}
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
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        width: 52,
        height: 52,
        borderRadius: "50%",
        background: "#2563EB",
        boxShadow: hovered
          ? "0 8px 24px rgba(37,99,235,0.45)"
          : "0 4px 12px rgba(37,99,235,0.3)",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        transform: hovered ? "scale(1.08)" : "scale(1)",
        transition: "all 0.15s",
        zIndex: 100,
      }}
    >
      <PlusIcon />
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const supabase = createClient();
  
const [recentItems, setRecentItems] = useState([]);

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
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#F8FAFC",
        minHeight: "100vh",
      }}
    >
      <Navbar router={router}/>
      <HeroSection search={search} setSearch={setSearch} router={router} />
      <RecentlyFoundSection items={recentItems} />
      <CTABanner />
      <Footer />
      <FAB />
    </div>
  );
}
