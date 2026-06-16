"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Item {
  id: string;
  title: string;
  category: string;
  description: string;
  condition: string;
  status: string;
  location: string;
  found_date: string;
  found_time: string;
  verification_hint: string;
  photos: string[];
  is_high_value: boolean;
  created_at: string;
  user_id: string;
  profiles: { full_name: string; avatar_url: string | null };
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const MapPinIcon = ({ color = "#2563EB" }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const HandIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
  </svg>
);
const MessageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "#fff", borderBottom: "1px solid #E2E8F0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ fontWeight: 700, fontSize: 20, color: "#1E3A8A", letterSpacing: "-0.5px", textDecoration: "none" }}>FoundLink</a>
        <div style={{ display: "flex", gap: 32 }}>
          {[["Home", "/"], ["Search", "/search"], ["Post", "/post"]].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: 14, color: "#475569", textDecoration: "none" }}>{label}</a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/messages" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>
            <MessageIcon />
          </a>
          <a href="/auth/login" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>
            <UserIcon />
          </a>
        </div>
      </div>
    </nav>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: "#fff", borderTop: "1px solid #E2E8F0", padding: "28px 24px", marginTop: 64 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, color: "#1E3A8A", marginBottom: 2 }}>FoundLink</p>
          <p style={{ fontSize: 12, color: "#94A3B8" }}>© 2024 FoundLink. All rights reserved. Your local community lost and found.</p>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {["Community Guidelines", "Safety Tips", "Privacy Policy", "Contact Support", "How it Works"].map((l) => (
            <a key={l} href="#" style={{ fontSize: 13, color: "#64748B", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── Image Gallery ────────────────────────────────────────────────────────────
function ImageGallery({ photos, status }: { photos: string[]; status: string }) {
  const [active, setActive] = useState(0);
  const isFound = status === "found";

  return (
    <div>
      {/* Main image */}
      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", aspectRatio: "4/3", background: "#F1F5F9", marginBottom: 12 }}>
        {photos[active] ? (
          <img src={photos[active]} alt="Item" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontSize: 14 }}>No image</div>
        )}
        {/* Status badge */}
        <span style={{
          position: "absolute", top: 14, right: 14,
          background: isFound ? "#059669" : "#EF4444",
          color: "#fff", fontSize: 11, fontWeight: 700,
          padding: "4px 12px", borderRadius: 99,
          textTransform: "uppercase", letterSpacing: "0.6px",
        }}>
          {isFound ? "Found" : "Lost"}
        </span>
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div style={{ display: "flex", gap: 10 }}>
          {photos.map((url, i) => (
            <button key={i} onClick={() => setActive(i)} style={{
              width: 80, height: 64, borderRadius: 8, overflow: "hidden", padding: 0, border: `2px solid ${active === i ? "#2563EB" : "#E2E8F0"}`, cursor: "pointer", flexShrink: 0,
            }}>
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Claim Modal ──────────────────────────────────────────────────────────────
function ClaimModal({ item, onClose, onSubmit }: { item: Item; onClose: () => void; onSubmit: (msg: string) => void }) {
  const [message, setMessage] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 460, width: "100%" }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Claim this item</h3>
        <p style={{ fontSize: 14, color: "#64748B", marginBottom: 20, lineHeight: 1.6 }}>
          Send a message to the finder. Be ready to verify ownership.
        </p>
        {item.verification_hint && (
          <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "12px 14px", marginBottom: 20, display: "flex", gap: 8 }}>
            <InfoIcon />
            <p style={{ fontSize: 13, color: "#1E40AF", lineHeight: 1.55 }}>
              <strong>Verification required:</strong> {item.verification_hint}
            </p>
          </div>
        )}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe how you can prove this is yours…"
          style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: 14, fontFamily: "inherit", minHeight: 100, resize: "vertical", outline: "none", marginBottom: 16 }}
          onFocus={(e) => e.target.style.borderColor = "#2563EB"}
          onBlur={(e) => e.target.style.borderColor = "#E2E8F0"}
        />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 99, border: "1.5px solid #E2E8F0", background: "#fff", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onSubmit(message)} disabled={!message.trim()} style={{ padding: "10px 20px", borderRadius: 99, border: "none", background: message.trim() ? "#2563EB" : "#CBD5E1", color: "#fff", fontWeight: 600, fontSize: 14, cursor: message.trim() ? "pointer" : "not-allowed" }}>Send Message</button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    async function load() {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Fetch item with poster's profile
      const { data, error } = await supabase
        .from("items")
        .select("*, profiles(full_name, avatar_url)")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        router.push("/");
        return;
      }

      setItem(data);

      // Compute time ago
      const diff = Date.now() - new Date(data.created_at).getTime();
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(hours / 24);
      setTimeAgo(days > 0 ? `${days} day${days > 1 ? "s" : ""} ago` : hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""} ago` : "Just now");

      setLoading(false);
    }
    load();
  }, [params.id]);

  const handleClaim = async (message: string) => {
    if (!currentUser) {
      router.push(`/auth/login?redirectTo=/items/${params.id}`);
      return;
    }

    setClaimLoading(true);
    setClaimError("");

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("item_id", item!.id)
        .eq("claimant_id", currentUser.id)
        .single();

      let conversationId = existing?.id;

      if (!conversationId) {
        // Create new conversation
        const { data: conv, error: convError } = await supabase
          .from("conversations")
          .insert({
            item_id: item!.id,
            finder_id: item!.user_id,
            claimant_id: currentUser.id,
          })
          .select("id")
          .single();

        if (convError) throw convError;
        conversationId = conv.id;
      }

      // Send the first message
      const { error: msgError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          content: message,
        });

      if (msgError) throw msgError;

      setShowClaimModal(false);
      router.push(`/messages?conversation=${conversationId}`);
    } catch (err: any) {
      setClaimError(err.message || "Something went wrong.");
    } finally {
      setClaimLoading(false);
    }
  };

  if (loading) return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", background: "#F8FAFC" }}>
      <Navbar />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #E2E8F0", borderTopColor: "#2563EB", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#64748B", fontSize: 14 }}>Loading item…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (!item) return null;

  const isOwner = currentUser?.id === item.user_id;
  const formattedDate = new Date(item.found_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      <Navbar />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 13, color: "#64748B" }}>
          <a href="/search" style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", textDecoration: "none" }}>
            <ArrowLeftIcon /> Back to Search
          </a>
          <span>/</span>
          <span>{item.category}</span>
          <span>/</span>
          <span style={{ color: "#0F172A", fontWeight: 500 }}>Found: {item.title}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <ImageGallery photos={item.photos || []} status={item.status} />

            {/* Description */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 14 }}>Description</h2>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.75, marginBottom: item.verification_hint ? 20 : 0 }}>
                {item.description || "No description provided."}
              </p>

              {item.verification_hint && (
                <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "14px 16px", display: "flex", gap: 10, marginTop: 16 }}>
                  <div style={{ marginTop: 1, flexShrink: 0 }}><InfoIcon /></div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, color: "#1E40AF", marginBottom: 4 }}>Verification Requirement</p>
                    <p style={{ fontSize: 13, color: "#1E40AF", lineHeight: 1.55 }}>{item.verification_hint}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Found Location */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>Found Location</h2>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#2563EB", fontWeight: 500 }}>
                  <MapPinIcon /> {item.location}
                </span>
              </div>
              <div style={{ height: 200, borderRadius: 12, background: "linear-gradient(135deg, #DBEAFE 0%, #E0F2FE 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, color: "#94A3B8", border: "1px solid #E2E8F0" }}>
                <MapPinIcon color="#94A3B8" />
                <p style={{ fontSize: 13 }}>{item.location}</p>
                <p style={{ fontSize: 12 }}>Map integration coming soon</p>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 76 }}>
            {/* Item info card */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px", marginBottom: 12 }}>{item.title}</h1>

              {/* Tags */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                <span style={{ background: "#EFF6FF", color: "#2563EB", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 99 }}>{item.category}</span>
                {item.condition && <span style={{ background: "#F0FDF4", color: "#16A34A", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 99 }}>{item.condition}</span>}
                {item.is_high_value && <span style={{ background: "#FFF7ED", color: "#EA580C", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 99 }}>High Value</span>}
              </div>

              {/* Meta */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 20, borderBottom: "1px solid #F1F5F9", marginBottom: 20 }}>
                {[
                  { icon: <CalendarIcon />, text: `Found on ${formattedDate}` },
                  { icon: <ClockIcon />, text: `Reported ${timeAgo}` },
                  { icon: <UserIcon />, text: `Found by ${item.profiles?.full_name || "Anonymous"}` },
                ].map(({ icon, text }, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569" }}>
                    {icon} {text}
                  </div>
                ))}
              </div>

              {/* CTAs */}
              {!isOwner && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button
                    onClick={() => {
                      if (!currentUser) { router.push(`/auth/login?redirectTo=/items/${item.id}`); return; }
                      setShowClaimModal(true);
                    }}
                    style={{ width: "100%", padding: "13px 0", borderRadius: 10, background: "#2563EB", border: "none", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.15s" }}
                    onMouseOver={(e) => e.currentTarget.style.background = "#1D4ED8"}
                    onMouseOut={(e) => e.currentTarget.style.background = "#2563EB"}
                  >
                    <HandIcon /> This is Mine
                  </button>
                  <button
                    onClick={() => {
                      if (!currentUser) { router.push(`/auth/login?redirectTo=/items/${item.id}`); return; }
                      setShowClaimModal(true);
                    }}
                    style={{ width: "100%", padding: "12px 0", borderRadius: 10, background: "#fff", border: "1.5px solid #2563EB", color: "#2563EB", fontWeight: 600, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    <MessageIcon /> Message Finder
                  </button>
                </div>
              )}

              {isOwner && (
                <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "12px 14px" }}>
                  <p style={{ fontSize: 13, color: "#16A34A", fontWeight: 600, textAlign: "center" }}>This is your listing</p>
                </div>
              )}

              {claimError && (
                <div style={{ marginTop: 12, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 6, alignItems: "center" }}>
                  <AlertIcon /><p style={{ fontSize: 13, color: "#DC2626", margin: 0 }}>{claimError}</p>
                </div>
              )}
            </div>

            {/* Safety tips */}
            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <ShieldIcon />
                <p style={{ fontWeight: 700, fontSize: 14, color: "#166534" }}>Safety Tips</p>
              </div>
              <p style={{ fontSize: 13, color: "#15803D", marginBottom: 10 }}>Stay safe during your meeting.</p>
              <ul style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "Meet in a well-lit, busy public place like a police station or cafe.",
                  "Bring a friend or let someone know your location and meeting time.",
                  "Never share financial details or pay for shipping/returns in advance.",
                ].map((tip, i) => (
                  <li key={i} style={{ fontSize: 13, color: "#15803D", lineHeight: 1.55 }}>{tip}</li>
                ))}
              </ul>
            </div>

            {/* Ref & report */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
              <p style={{ fontSize: 12, color: "#94A3B8" }}>Ref ID: FL-{item.id.slice(0, 8).toUpperCase()}</p>
              <button style={{ background: "none", border: "none", color: "#EF4444", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <AlertIcon /> Report Listing
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {showClaimModal && (
        <ClaimModal item={item} onClose={() => setShowClaimModal(false)} onSubmit={handleClaim} />
      )}
    </div>
  );
}
