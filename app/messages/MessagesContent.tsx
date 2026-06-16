"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Profile { id: string; full_name: string; avatar_url: string | null; }
interface Item { id: string; title: string; status: string; location: string; found_date: string; photos: string[]; }
interface Conversation {
  id: string;
  item_id: string;
  finder_id: string;
  claimant_id: string;
  created_at: string;
  items: Item;
  other_user: Profile;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
}
interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
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
const MessageIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Avatar({ profile, size = 40 }: { profile: Profile | null; size?: number }) {
  if (!profile) return <div style={{ width: size, height: size, borderRadius: "50%", background: "#E2E8F0" }} />;
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
    if (label !== currentLabel) {
      currentLabel = label;
      groups.push({ label, messages: [] });
    }
    groups[groups.length - 1].messages.push(msg);
  });
  return groups;
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ currentUser }: { currentUser: Profile | null }) {
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "#fff", borderBottom: "1px solid #E2E8F0" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ fontWeight: 700, fontSize: 20, color: "#1E3A8A", letterSpacing: "-0.5px", textDecoration: "none" }}>FoundLink</a>
        <div style={{ display: "flex", gap: 32 }}>
          {[["Home", "/"], ["Search", "/search"], ["Post", "/post"]].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: 14, color: "#475569", textDecoration: "none" }}>{label}</a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a href="/messages" style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #2563EB", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </a>
          <a href="/profile" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", overflow: "hidden" }}>
            {currentUser?.avatar_url
              ? <img src={currentUser.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <UserIcon />}
          </a>
        </div>
      </div>
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
          <p style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", margin: 0 }}>{conv.other_user?.full_name || "Unknown"}</p>
          <span style={{ fontSize: 11, color: "#94A3B8", flexShrink: 0, marginLeft: 8 }}>
            {conv.last_message_at ? formatTime(conv.last_message_at) : ""}
          </span>
        </div>
        <p style={{ fontSize: 12, color: "#2563EB", fontWeight: 600, marginBottom: 3, margin: "0 0 3px" }}>
          Regarding: {conv.items?.title}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 12, color: "#64748B", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>
            {conv.last_message || "Start a conversation"}
          </p>
          {(conv.unread_count ?? 0) > 0 && (
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563EB", flexShrink: 0 }} />
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Item Reference Card ──────────────────────────────────────────────────────
function ItemCard({ item }: { item: Item }) {
  const date = new Date(item.found_date).toLocaleDateString([], { month: "short", day: "numeric" });
  return (
    <a href={`/items/${item.id}`} style={{ textDecoration: "none" }}>
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center", maxWidth: 300, cursor: "pointer" }}
        onMouseOver={(e) => e.currentTarget.style.borderColor = "#2563EB"}
        onMouseOut={(e) => e.currentTarget.style.borderColor = "#E2E8F0"}>
        <div style={{ width: 52, height: 52, borderRadius: 8, overflow: "hidden", background: "#F1F5F9", flexShrink: 0 }}>
          {item.photos?.[0]
            ? <img src={item.photos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#CBD5E1", fontSize: 11 }}>No photo</div>}
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 13, color: "#0F172A", marginBottom: 3 }}>{item.title}</p>
          <p style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>{item.status === "lost" ? "Lost" : "Found"}: {date} · {item.location}</p>
          <p style={{ fontSize: 12, color: "#2563EB", fontWeight: 600 }}>View Post Details</p>
        </div>
      </div>
    </a>
  );
}

// ─── Chat Thread ──────────────────────────────────────────────────────────────
function ChatThread({ conv, currentUserId, messages, onSend }: {
  conv: Conversation;
  currentUserId: string;
  messages: Message[];
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const groups = groupMessagesByDate(messages);
  const isFinderMe = conv.finder_id === currentUserId;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 12, background: "#fff", flexShrink: 0 }}>
        <Avatar profile={conv.other_user} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", margin: 0 }}>{conv.other_user?.full_name}</p>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: isFinderMe ? "#EFF6FF" : "#FEF3C7", color: isFinderMe ? "#2563EB" : "#D97706", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {isFinderMe ? "Claimant" : "Finder"}
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>Regarding: {conv.items?.title}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748B" }}><InfoIcon /></button>
          <button style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748B" }}><MoreIcon /></button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 0" }}>
        {groups.map(({ label, messages: msgs }) => (
          <div key={label}>
            {/* Date divider */}
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
                  {/* Avatar for other user */}
                  {!isMe && (
                    <div style={{ width: 32, flexShrink: 0 }}>
                      {showAvatar && <Avatar profile={conv.other_user} size={32} />}
                    </div>
                  )}
                  <div style={{ maxWidth: "65%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                    <div style={{
                      padding: "11px 15px", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      background: isMe ? "#2563EB" : "#EFF6FF",
                      color: isMe ? "#fff" : "#0F172A",
                      fontSize: 14, lineHeight: 1.55,
                    }}>
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

        {/* Item reference card — show once at top of thread */}
        {conv.items && messages.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 16px" }}>
            <ItemCard item={conv.items} />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: "1px solid #E2E8F0", padding: "12px 20px 8px", background: "#fff", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 99, padding: "6px 8px 6px 14px" }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#94A3B8", padding: 0, flexShrink: 0 }}><PlusCircleIcon /></button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, color: "#0F172A", outline: "none", fontFamily: "inherit" }}
          />
          <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0, color: "#94A3B8", flexShrink: 0 }}><SmileIcon /></button>
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            style={{ width: 36, height: 36, borderRadius: "50%", background: text.trim() ? "#2563EB" : "#E2E8F0", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: text.trim() ? "pointer" : "default", color: text.trim() ? "#fff" : "#94A3B8", flexShrink: 0, transition: "all 0.15s" }}
          >
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

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#94A3B8" }}>
      <MessageIcon />
      <p style={{ fontSize: 15, fontWeight: 600, color: "#64748B" }}>Select a conversation</p>
      <p style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", maxWidth: 260, lineHeight: 1.6 }}>
        Choose a conversation from the left, or claim a found item to start messaging.
      </p>
      <a href="/search" style={{ marginTop: 8, padding: "9px 20px", borderRadius: 99, background: "#2563EB", color: "#fff", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>Browse Items</a>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(searchParams.get("conversation"));
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [convLoading, setConvLoading] = useState(false);

  const activeConv = conversations.find((c) => c.id === activeConvId) || null;

  // ── Load current user ──
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login?redirectTo=/messages"); return; }
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setCurrentUser(profile);
    }
    init();
  }, []);

  // ── Load conversations ──
  const loadConversations = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("conversations")
      .select(`id, item_id, finder_id, claimant_id, created_at, items(id, title, status, location, found_date, photos)`)
      .or(`finder_id.eq.${currentUser.id},claimant_id.eq.${currentUser.id}`)
      .order("created_at", { ascending: false });

    if (error || !data) { setLoading(false); return; }

    // For each conversation, fetch the other user's profile + last message
    const enriched = await Promise.all(data.map(async (conv: any) => {
      const otherId = conv.finder_id === currentUser.id ? conv.claimant_id : conv.finder_id;
      const { data: otherUser } = await supabase.from("profiles").select("id, full_name, avatar_url").eq("id", otherId).single();
      const { data: lastMsg } = await supabase.from("messages").select("content, created_at, read, sender_id").eq("conversation_id", conv.id).order("created_at", { ascending: false }).limit(1).single();
      const { count } = await supabase.from("messages").select("*", { count: "exact", head: true }).eq("conversation_id", conv.id).eq("read", false).neq("sender_id", currentUser.id);

      return {
        ...conv,
        other_user: otherUser,
        last_message: lastMsg?.content,
        last_message_at: lastMsg?.created_at,
        unread_count: count || 0,
      };
    }));

    setConversations(enriched);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // ── Load messages for active conversation ──
  useEffect(() => {
    if (!activeConvId) return;
    setConvLoading(true);

    supabase.from("messages").select("*").eq("conversation_id", activeConvId).order("created_at", { ascending: true })
      .then(({ data }) => { setMessages(data || []); setConvLoading(false); });

    // Mark messages as read
    if (currentUser) {
      supabase.from("messages").update({ read: true }).eq("conversation_id", activeConvId).neq("sender_id", currentUser.id).then(() => {});
    }

    // ── Realtime subscription ──
    const channel = supabase
      .channel(`messages:${activeConvId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${activeConvId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
        // Mark as read if not sender
        if (payload.new.sender_id !== currentUser?.id) {
          supabase.from("messages").update({ read: true }).eq("id", payload.new.id).then(() => {});
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConvId, currentUser]);

  // ── Send message ──
  const handleSend = async (content: string) => {
    if (!currentUser || !activeConvId) return;
    await supabase.from("messages").insert({
      conversation_id: activeConvId,
      sender_id: currentUser.id,
      content,
    });
    // Refresh conversation list to update last message
    loadConversations();
  };

  const handleSelectConv = (id: string) => {
    setActiveConvId(id);
    router.replace(`/messages?conversation=${id}`);
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#F8FAFC", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar currentUser={currentUser} />

      <div style={{ flex: 1, display: "flex", maxWidth: 1200, width: "100%", margin: "0 auto", height: "calc(100vh - 60px)" }}>
        {/* Left: conversation list */}
        <div style={{ width: 340, flexShrink: 0, borderRight: "1px solid #E2E8F0", background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9" }}>
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
                <a href="/search" style={{ display: "inline-block", marginTop: 12, fontSize: 13, color: "#2563EB", fontWeight: 600 }}>Browse Items →</a>
              </div>
            ) : (
              conversations.map((conv) => (
                <div key={conv.id}>
                  <ConvItem conv={conv} active={conv.id === activeConvId} onClick={() => handleSelectConv(conv.id)} />
                  <div style={{ height: 1, background: "#F1F5F9", margin: "0 16px" }} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: chat thread */}
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

      {/* Footer */}
      <footer style={{ background: "#fff", borderTop: "1px solid #E2E8F0", padding: "16px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <p style={{ fontSize: 13, color: "#94A3B8" }}>© 2024 FoundLink. Your local community lost and found.</p>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy Policy", "Contact Support", "Safety Tips"].map((l) => (
              <a key={l} href="#" style={{ fontSize: 13, color: "#64748B", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
