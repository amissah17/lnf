"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Profile { id: string; full_name: string; avatar_url: string | null; }
interface Item { id: string; title: string; status: string; location: string; found_date: string; photos: string[]; }
interface Conversation {
  id: string; item_id: string; finder_id: string; claimant_id: string; created_at: string;
  items: Item; other_user: Profile; last_message?: string; last_message_at?: string; unread_count?: number;
}
interface Message { id: string; conversation_id: string; sender_id: string; content: string; read: boolean; created_at: string; }

// ─── useIsMobile ──────────────────────────────────────────────────────────────
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
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const PlusCircleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);
const SmileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
  </svg>
);
const MoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
  </svg>
);
const EmptyMessageIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const CloseNavIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Avatar({ profile, size = 40 }: { profile: Profile | null; size?: number }) {
  if (!profile) return <div style={{ width: size, height: size, borderRadius: "50%", background: "#E2E8F0", flexShrink: 0 }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", background: "#EFF6FF", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, color: "#2563EB" }}>
      {profile.avatar_url
        ? <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : profile.full_name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  if (days < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function groupMessagesByDate(messages: Message[]) {
  const groups: { label: string; messages: Message[] }[] = [];
  let currentLabel = "";
  messages.forEach((msg) => {
    const date = new Date(msg.created_at);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
    const label = diff === 0 ? "TODAY" : diff === 1 ? "YESTERDAY" : date.toLocaleDateString([], { month: "long", day: "numeric" });
    if (label !== currentLabel) { currentLabel = label; groups.push({ label, messages: [] }); }
    groups[groups.length - 1].messages.push(msg);
  });
  return groups;
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ currentUser }: { currentUser: Profile | null }) {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "#fff", borderBottom: "1px solid #E2E8F0" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: 20, color: "#1E3A8A", letterSpacing: "-0.5px", textDecoration: "none" }}>LostandFound</Link>

        {isMobile ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/messages" style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #2563EB", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </Link>
            <Link href="/profile" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", overflow: "hidden" }}>
              {currentUser?.avatar_url ? <img src={currentUser.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserIcon />}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569" }}>
              {menuOpen ? <CloseNavIcon /> : <MenuIcon />}
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 32 }}>
              {[["Home", "/"], ["Search", "/search"], ["Post", "/post"]].map(([label, href]) => (
                <Link key={label} href={href} style={{ fontSize: 14, color: "#475569", textDecoration: "none" }}>{label}</Link>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Link href="/messages" style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #2563EB", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </Link>
              <Link href="/profile" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", overflow: "hidden" }}>
                {currentUser?.avatar_url ? <img src={currentUser.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserIcon />}
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div style={{ background: "#fff", borderTop: "1px solid #F1F5F9", padding: "12px 24px 20px" }}>
          {[["Home", "/"], ["Search", "/search"], ["Post", "/post"]].map(([label, href]) => (
            <Link key={label} href={href} onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "12px 0", fontSize: 15, color: "#475569", textDecoration: "none", borderBottom: "1px solid #F1F5F9" }}>{label}</Link>
          ))}
        </div>
      )}
    </nav>
  );
}

// ─── Conversation List Item ───────────────────────────────────────────────────
function ConvItem({ conv, active, onClick }: { conv: Conversation; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ width: "100%", display: "flex", gap: 12, padding: "14px 16px", border: "none", borderLeft: active ? "3px solid #2563EB" : "3px solid transparent", background: active ? "#F0F7FF" : "transparent", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
      <Avatar profile={conv.other_user} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>{conv.other_user?.full_name || "Unknown"}</p>
          <span style={{ fontSize: 11, color: "#94A3B8", flexShrink: 0, marginLeft: 8 }}>{conv.last_message_at ? formatTime(conv.last_message_at) : ""}</span>
        </div>
        <p style={{ fontSize: 12, color: "#2563EB", fontWeight: 600, margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          Re: {conv.items?.title}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 12, color: "#64748B", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 170 }}>
            {conv.last_message || "Start a conversation"}
          </p>
          {(conv.unread_count ?? 0) > 0 && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563EB", flexShrink: 0 }} />}
        </div>
      </div>
    </button>
  );
}

// ─── Item Reference Card ──────────────────────────────────────────────────────
function ItemCard({ item }: { item: Item }) {
  const date = new Date(item.found_date).toLocaleDateString([], { month: "short", day: "numeric" });
  return (
    <Link href={`/items/${item.id}`} style={{ textDecoration: "none" }}>
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center", maxWidth: 300, cursor: "pointer" }}
        onMouseOver={(e) => e.currentTarget.style.borderColor = "#2563EB"}
        onMouseOut={(e) => e.currentTarget.style.borderColor = "#E2E8F0"}>
        <div style={{ width: 52, height: 52, borderRadius: 8, overflow: "hidden", background: "#F1F5F9", flexShrink: 0 }}>
          {item.photos?.[0]
            ? <img src={item.photos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#CBD5E1", fontSize: 11 }}>No photo</div>}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: "#0F172A", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p>
          <p style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>{item.status === "lost" ? "Lost" : "Found"}: {date} · {item.location}</p>
          <p style={{ fontSize: 12, color: "#2563EB", fontWeight: 600 }}>View Post Details</p>
        </div>
      </div>
    </Link>
  );
}

// ─── Chat Thread ──────────────────────────────────────────────────────────────
function ChatThread({ conv, currentUserId, messages, onSend, onBack }: {
  conv: Conversation; currentUserId: string; messages: Message[]; onSend: (text: string) => void; onBack?: () => void;
}) {
  const isMobile = useIsMobile();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const groups = groupMessagesByDate(messages);
  const isFinderMe = conv.finder_id === currentUserId;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: isMobile ? "10px 14px" : "14px 20px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: isMobile ? 10 : 12, background: "#fff", flexShrink: 0 }}>
        {/* Back button on mobile */}
        {isMobile && onBack && (
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", display: "flex", alignItems: "center", padding: "4px 4px 4px 0", flexShrink: 0 }}>
            <BackIcon />
          </button>
        )}
        <Avatar profile={conv.other_user} size={isMobile ? 36 : 40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <p style={{ fontWeight: 700, fontSize: isMobile ? 14 : 15, color: "#0F172A", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.other_user?.full_name}</p>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: isFinderMe ? "#EFF6FF" : "#FEF3C7", color: isFinderMe ? "#2563EB" : "#D97706", textTransform: "uppercase", letterSpacing: "0.5px", flexShrink: 0 }}>
              {isFinderMe ? "Claimant" : "Finder"}
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#64748B", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Re: {conv.items?.title}</p>
        </div>
        {!isMobile && (
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><InfoIcon /></button>
            <button style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><MoreIcon /></button>
          </div>
        )}
        {isMobile && (
          <button style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}><MoreIcon /></button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "12px 12px 0" : "20px 20px 0" }}>
        {groups.map(({ label, messages: msgs }) => (
          <div key={label}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", background: "#fff", padding: "3px 12px", borderRadius: 99, border: "1px solid #E2E8F0" }}>{label}</span>
              <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            </div>
            {msgs.map((msg, i) => {
              const isMe = msg.sender_id === currentUserId;
              const showAvatar = !isMe && (i === 0 || msgs[i - 1]?.sender_id !== msg.sender_id);
              const time = new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              return (
                <div key={msg.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 8, marginBottom: 10, alignItems: "flex-end" }}>
                  {!isMe && (
                    <div style={{ width: isMobile ? 28 : 32, flexShrink: 0 }}>
                      {showAvatar && <Avatar profile={conv.other_user} size={isMobile ? 28 : 32} />}
                    </div>
                  )}
                  <div style={{ maxWidth: isMobile ? "78%" : "65%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                    <div style={{ padding: isMobile ? "10px 13px" : "11px 15px", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: isMe ? "#2563EB" : "#EFF6FF", color: isMe ? "#fff" : "#0F172A", fontSize: isMobile ? 13 : 14, lineHeight: 1.55 }}>
                      {msg.content}
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: "#94A3B8" }}>{time}</span>
                      {isMe && <span style={{ fontSize: 11, color: "#94A3B8" }}>· {msg.read ? "Read" : "Sent"}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        {conv.items && messages.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 16px" }}>
            <ItemCard item={conv.items} />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: "1px solid #E2E8F0", padding: isMobile ? "10px 12px 6px" : "12px 20px 8px", background: "#fff", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 99, padding: "6px 8px 6px 14px" }}>
          {!isMobile && <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#94A3B8", padding: 0, flexShrink: 0 }}><PlusCircleIcon /></button>}
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            style={{ flex: 1, border: "none", background: "transparent", fontSize: isMobile ? 13 : 14, color: "#0F172A", outline: "none", fontFamily: "inherit", minWidth: 0 }}
          />
          {!isMobile && <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0, color: "#94A3B8", flexShrink: 0 }}><SmileIcon /></button>}
          <button onClick={handleSend} disabled={!text.trim()} style={{ width: 36, height: 36, borderRadius: "50%", background: text.trim() ? "#2563EB" : "#E2E8F0", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: text.trim() ? "pointer" : "default", color: text.trim() ? "#fff" : "#94A3B8", flexShrink: 0, transition: "all 0.15s" }}>
            <SendIcon />
          </button>
        </div>
        <p style={{ fontSize: 11, color: "#94A3B8", textAlign: "center", marginTop: 8 }}>
          Safety Tip: Always meet in well-lit, public places for item returns.
        </p>
      </div>
    </div>
  );
}

// ─── Conversation List Panel ──────────────────────────────────────────────────
function ConvList({ conversations, loading, activeConvId, onSelect }: {
  conversations: Conversation[]; loading: boolean; activeConvId: string | null; onSelect: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", flexShrink: 0 }}>
        <h2 style={{ fontWeight: 700, fontSize: 18, color: "#0F172A", margin: 0 }}>Messages</h2>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}><FilterIcon /></button>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ padding: "14px 16px", display: "flex", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#F1F5F9", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 13, background: "#F1F5F9", borderRadius: 4, width: "60%", marginBottom: 8 }} />
                <div style={{ height: 11, background: "#F1F5F9", borderRadius: 4, width: "80%" }} />
              </div>
            </div>
          ))
        ) : conversations.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6 }}>No conversations yet. Claim a found item to start messaging!</p>
            <Link href="/search" style={{ display: "inline-block", marginTop: 12, fontSize: 13, color: "#2563EB", fontWeight: 600 }}>Browse Items →</Link>
          </div>
        ) : (
          conversations.map((conv) => (
            <div key={conv.id}>
              <ConvItem conv={conv} active={conv.id === activeConvId} onClick={() => onSelect(conv.id)} />
              <div style={{ height: 1, background: "#F1F5F9", margin: "0 16px" }} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#94A3B8", padding: 24 }}>
      <EmptyMessageIcon />
      <p style={{ fontSize: 15, fontWeight: 600, color: "#64748B" }}>Select a conversation</p>
      <p style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", maxWidth: 260, lineHeight: 1.6 }}>
        Choose a conversation from the list, or claim a found item to start messaging.
      </p>
      <Link href="/search" style={{ marginTop: 8, padding: "9px 20px", borderRadius: 99, background: "#2563EB", color: "#fff", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>Browse Items</Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const isMobile = useIsMobile();

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(searchParams.get("conversation"));
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [convLoading, setConvLoading] = useState(false);

  // On mobile: which "panel" is visible — "list" or "chat"
  const [mobileView, setMobileView] = useState<"list" | "chat">(activeConvId ? "chat" : "list");

  const activeConv = conversations.find((c) => c.id === activeConvId) || null;

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login?redirectTo=/messages"); return; }
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setCurrentUser(profile);
    }
    init();
  }, []);

  const loadConversations = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("conversations")
      .select(`id, item_id, finder_id, claimant_id, created_at, items(id, title, status, location, found_date, photos)`)
      .or(`finder_id.eq.${currentUser.id},claimant_id.eq.${currentUser.id}`)
      .order("created_at", { ascending: false });

    if (error || !data) { setLoading(false); return; }

    const enriched = await Promise.all(data.map(async (conv: any) => {
      const otherId = conv.finder_id === currentUser.id ? conv.claimant_id : conv.finder_id;
      const { data: otherUser } = await supabase.from("profiles").select("id, full_name, avatar_url").eq("id", otherId).single();
      const { data: lastMsg } = await supabase.from("messages").select("content, created_at, read, sender_id").eq("conversation_id", conv.id).order("created_at", { ascending: false }).limit(1).single();
      const { count } = await supabase.from("messages").select("*", { count: "exact", head: true }).eq("conversation_id", conv.id).eq("read", false).neq("sender_id", currentUser.id);
      return { ...conv, other_user: otherUser, last_message: lastMsg?.content, last_message_at: lastMsg?.created_at, unread_count: count || 0 };
    }));

    setConversations(enriched);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (!activeConvId) return;
    setConvLoading(true);
    supabase.from("messages").select("*").eq("conversation_id", activeConvId).order("created_at", { ascending: true })
      .then(({ data }) => { setMessages(data || []); setConvLoading(false); });

    if (currentUser) {
      supabase.from("messages").update({ read: true }).eq("conversation_id", activeConvId).neq("sender_id", currentUser.id).then(() => {});
    }

    const channel = supabase
      .channel(`messages:${activeConvId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeConvId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
        if (payload.new.sender_id !== currentUser?.id) {
          supabase.from("messages").update({ read: true }).eq("id", payload.new.id).then(() => {});
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConvId, currentUser]);

  const handleSend = async (content: string) => {
    if (!currentUser || !activeConvId) return;
    await supabase.from("messages").insert({ conversation_id: activeConvId, sender_id: currentUser.id, content });
    loadConversations();
  };

  const handleSelectConv = (id: string) => {
    setActiveConvId(id);
    router.replace(`/messages?conversation=${id}`);
    if (isMobile) setMobileView("chat");
  };

  const handleBack = () => {
    setMobileView("list");
  };

  // ── Chat viewport height (avoids mobile browser chrome issues) ──
  const chatHeight = "calc(100vh - 60px)";

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#F8FAFC", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar currentUser={currentUser} />

      {isMobile ? (
        // ── Mobile: single-panel, toggle between list and chat ──
        <div style={{ flex: 1, height: chatHeight, background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {mobileView === "list" || !activeConv ? (
            <ConvList conversations={conversations} loading={loading} activeConvId={activeConvId} onSelect={handleSelectConv} />
          ) : (
            convLoading ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 32, height: 32, border: "3px solid #E2E8F0", borderTopColor: "#2563EB", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <ChatThread conv={activeConv} currentUserId={currentUser?.id || ""} messages={messages} onSend={handleSend} onBack={handleBack} />
            )
          )}
        </div>
      ) : (
        // ── Desktop: side-by-side layout ──
        <div style={{ flex: 1, display: "flex", maxWidth: 1200, width: "100%", margin: "0 auto", height: chatHeight }}>
          {/* Left: conversation list */}
          <div style={{ width: 340, flexShrink: 0, borderRight: "1px solid #E2E8F0", background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ConvList conversations={conversations} loading={loading} activeConvId={activeConvId} onSelect={handleSelectConv} />
          </div>

          {/* Right: chat or empty */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#F8FAFC" }}>
            {activeConv && currentUser ? (
              convLoading ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 32, height: 32, border: "3px solid #E2E8F0", borderTopColor: "#2563EB", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : (
                <ChatThread conv={activeConv} currentUserId={currentUser.id} messages={messages} onSend={handleSend} />
              )
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      )}

      {/* Footer — hidden on mobile when in chat to maximize screen space */}
      {(!isMobile || mobileView === "list") && (
        <footer style={{ background: "#fff", borderTop: "1px solid #E2E8F0", padding: isMobile ? "16px" : "16px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: 8 }}>
            <p style={{ fontSize: 13, color: "#94A3B8" }}>© 2024 LostandFound. Your local community lost and found.</p>
            <div style={{ display: "flex", gap: isMobile ? 12 : 20, flexWrap: "wrap" }}>
              {[{ name: "Privacy Policy", url: "/privacy-policy" }, { name: "Contact Support", url: "/contact-support" }, { name: "Safety Tips", url: "/safety-tips" }].map((l) => (
                <Link key={l.name} href={l.url} style={{ fontSize: 13, color: "#64748B", textDecoration: "none" }}>{l.name}</Link>
              ))}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
