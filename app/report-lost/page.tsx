"use client";
import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────
type FormData = {
  status: "lost" | "found";
  title: string;
  category: string;
  description: string;
  location: string;
  found_date: string;
  found_time: string;
  condition: string;
  verification_hint: string;
  is_high_value: boolean;
  photos: File[];
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const CameraIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
    <line x1="12" y1="10" x2="12" y2="10" strokeWidth="3" />
  </svg>
);
const LightbulbIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18" /><line x1="10" y1="22" x2="14" y2="22" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const MapPinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
);

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ["Electronics", "Pets", "Wallets", "Keys", "Bags", "Clothing", "Documents", "Jewelry", "Other"];
const CONDITIONS = ["Excellent", "Good", "Fair", "Poor"];
const STEPS = ["Item Details", "Location & Time", "Verification"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid #E2E8F0",
  borderRadius: 8,
  padding: "11px 14px",
  fontSize: 14,
  color: "#0F172A",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "'Inter', system-ui, sans-serif",
  transition: "border-color 0.15s",
};
const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#0F172A",
  marginBottom: 6,
  display: "block",
};

function InputField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={labelStyle}>{label}</label>
      {hint && <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 6 }}>{hint}</p>}
      {children}
    </div>
  );
}

// ─── Step 1: Item Details ─────────────────────────────────────────────────────
function StepOne({ form, setForm }: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) => f.size <= 5 * 1024 * 1024 && f.type.startsWith("image/"));
    setForm((prev) => ({ ...prev, photos: [...prev.photos, ...valid].slice(0, 5) }));
  }, [setForm]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "flex-start" }}>
      {/* Left: form */}
      <div>
        {/* Photo upload */}
        <InputField label="Add Item Photo (Optional)">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? "#2563EB" : "#CBD5E1"}`,
              borderRadius: 10,
              padding: "32px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: dragOver ? "#EFF6FF" : "#F8FAFC",
              transition: "all 0.15s",
            }}
          >
            <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => addFiles(e.target.files)} />
            {form.photos.length === 0 ? (
              <>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                    <line x1="12" y1="11" x2="12" y2="11" strokeWidth="3" />
                  </svg>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Click or drag to upload</p>
                <p style={{ fontSize: 12, color: "#94A3B8" }}>Supports JPG, PNG (Max 5MB)</p>
              </>
            ) : (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                {form.photos.map((f, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img src={URL.createObjectURL(f)} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
                    <button
                      onClick={(e) => { e.stopPropagation(); setForm((prev) => ({ ...prev, photos: prev.photos.filter((_, j) => j !== i) })); }}
                      style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "#EF4444", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
                    >
                      <XIcon />
                    </button>
                  </div>
                ))}
                {form.photos.length < 5 && (
                  <div style={{ width: 80, height: 80, border: "2px dashed #CBD5E1", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontSize: 24 }}>+</div>
                )}
              </div>
            )}
          </div>
        </InputField>

        <InputField label="Item Name">
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g., Golden Retriever, Leather Wallet"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
            onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
          />
        </InputField>

        <InputField label="Category">
          <select
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </InputField>

        <InputField label="Detailed Description">
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Describe unique features, brand, color, or markings that might help identify it..."
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
            onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
            onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
          />
        </InputField>

        <InputField label="Condition">
          <div style={{ display: "flex", gap: 8 }}>
            {CONDITIONS.map((c) => (
              <button
                key={c}
                onClick={() => setForm((p) => ({ ...p, condition: c }))}
                style={{
                  flex: 1, padding: "9px 0",
                  border: `1.5px solid ${form.condition === c ? "#2563EB" : "#E2E8F0"}`,
                  borderRadius: 8,
                  background: form.condition === c ? "#EFF6FF" : "#fff",
                  color: form.condition === c ? "#2563EB" : "#374151",
                  fontWeight: form.condition === c ? 600 : 400,
                  fontSize: 13, cursor: "pointer",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </InputField>

        <InputField label="High value item?">
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div
              onClick={() => setForm((p) => ({ ...p, is_high_value: !p.is_high_value }))}
              style={{ width: 42, height: 24, borderRadius: 99, position: "relative", cursor: "pointer", background: form.is_high_value ? "#2563EB" : "#E2E8F0", transition: "background 0.2s" }}
            >
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: form.is_high_value ? 21 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
            </div>
            <span style={{ fontSize: 14, color: "#374151" }}>Mark as high value (jewelry, electronics over $200, etc.)</span>
          </label>
        </InputField>
      </div>

      {/* Right: sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Tip */}
        <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LightbulbIcon />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1D4ED8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Helpful Tip</span>
          </div>
          <p style={{ fontSize: 13, color: "#1E40AF", lineHeight: 1.6, margin: 0 }}>
            Be as specific as possible! Mentioning unique scratches, engravings, or specific brand models helps our matching algorithm connect you with potential finders 30% faster.
          </p>
        </div>

        {/* Live preview */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ height: 140, background: "#F1F5F9", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {form.photos[0] ? (
              <img src={URL.createObjectURL(form.photos[0])} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <CameraIcon />
            )}
            <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "rgba(255,255,255,0.9)", color: "#374151", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 99 }}>
              LIVE PREVIEW
            </span>
          </div>
          <div style={{ padding: "12px 14px" }}>
            <div style={{ height: 12, background: "#E2E8F0", borderRadius: 4, marginBottom: 8, width: form.title ? "80%" : "60%" }} />
            <div style={{ height: 10, background: "#F1F5F9", borderRadius: 4, marginBottom: 6, width: "90%" }} />
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ height: 20, background: form.status === "lost" ? "#FEE2E2" : "#D1FAE5", borderRadius: 99, width: 50 }} />
              <div style={{ height: 20, background: "#F1F5F9", borderRadius: 99, width: 70 }} />
            </div>
          </div>
        </div>

        {/* Privacy note */}
        <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <ShieldIcon />
            <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6, margin: 0 }}>
              "Your safety is our priority. FoundLink never shares your exact address or private contact details with other users until you choose to reveal them in a secure message."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Location & Time ──────────────────────────────────────────────────
function StepTwo({ form, setForm }: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  return (
    <div style={{ maxWidth: 560 }}>
      <InputField label={form.status === "lost" ? "Last seen location" : "Where did you find it?"}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}><MapPinIcon /></span>
          <input
            value={form.location}
            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            placeholder="e.g., Golden Gate Park, Central Station"
            style={{ ...inputStyle, paddingLeft: 36 }}
            onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
            onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
          />
        </div>
      </InputField>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <InputField label={form.status === "lost" ? "Date lost" : "Date found"}>
          <input
            type="date"
            value={form.found_date}
            onChange={(e) => setForm((p) => ({ ...p, found_date: e.target.value }))}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
            onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
          />
        </InputField>
        <InputField label="Approximate time (optional)">
          <input
            type="time"
            value={form.found_time}
            onChange={(e) => setForm((p) => ({ ...p, found_time: e.target.value }))}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
            onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
          />
        </InputField>
      </div>

      <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: "12px 16px", marginTop: 8 }}>
        <p style={{ fontSize: 13, color: "#92400E", lineHeight: 1.6, margin: 0 }}>
          💡 Be as specific as possible with the location — it helps match items more accurately. You can use a landmark, street intersection, or building name.
        </p>
      </div>
    </div>
  );
}

// ─── Step 3: Verification ─────────────────────────────────────────────────────
function StepThree({ form, setForm }: { form: FormData; setForm: React.Dispatch<React.SetStateAction<FormData>> }) {
  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 12, padding: "16px 18px", marginBottom: 24 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#1D4ED8", marginBottom: 6 }}>Why add a verification hint?</p>
        <p style={{ fontSize: 13, color: "#1E40AF", lineHeight: 1.6, margin: 0 }}>
          A verification hint is a private detail about the item that only the real owner would know. It helps confirm someone is the rightful owner before you hand it over.
        </p>
      </div>

      <InputField
        label="Verification hint (private)"
        hint="This is only visible to you — not shown publicly. E.g. 'Has a crack on the back-left corner' or 'Contains a photo of a black labrador'"
      >
        <textarea
          value={form.verification_hint}
          onChange={(e) => setForm((p) => ({ ...p, verification_hint: e.target.value }))}
          placeholder="A detail only the real owner would know..."
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
          onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
          onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
        />
      </InputField>

      {/* Summary card */}
      <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: "18px 20px" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 14 }}>Summary</p>
        {[
          { label: "Item", value: form.title || "—" },
          { label: "Category", value: form.category || "—" },
          { label: "Status", value: form.status === "lost" ? "🔴 Lost" : "🟢 Found" },
          { label: "Location", value: form.location || "—" },
          { label: "Date", value: form.found_date || "—" },
          { label: "Condition", value: form.condition || "—" },
          { label: "Photos", value: form.photos.length > 0 ? `${form.photos.length} photo(s)` : "None" },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: 13, color: "#64748B" }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReportLostPage() {
  const supabase = createClient();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    status: "lost",
    title: "",
    category: "",
    description: "",
    location: "",
    found_date: new Date().toISOString().split("T")[0],
    found_time: "",
    condition: "",
    verification_hint: "",
    is_high_value: false,
    photos: [],
  });

  // Validation per step
  function canProceed() {
    if (step === 0) return form.title.trim().length > 0 && form.category.length > 0;
    if (step === 1) return form.location.trim().length > 0 && form.found_date.length > 0;
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in to report an item.");

      // Upload photos
      const photoUrls: string[] = [];
      for (const file of form.photos) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("item-photos").upload(path, file);
        if (uploadErr) throw uploadErr;
        const { data: { publicUrl } } = supabase.storage.from("item-photos").getPublicUrl(path);
        photoUrls.push(publicUrl);
      }

      const { error: insertErr } = await supabase.from("items").insert({
        user_id: user.id,
        title: form.title,
        category: form.category,
        description: form.description || null,
        status: form.status,
        location: form.location,
        found_date: form.found_date,
        found_time: form.found_time || null,
        condition: form.condition || null,
        verification_hint: form.verification_hint || null,
        is_high_value: form.is_high_value,
        photos: photoUrls.length > 0 ? photoUrls : null,
      });
      if (insertErr) throw insertErr;
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#F8FAFC", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", marginBottom: 10 }}>Report submitted!</h2>
          <p style={{ fontSize: 15, color: "#64748B", marginBottom: 28, lineHeight: 1.6 }}>
            Your {form.status} item has been posted. We'll notify you if someone reaches out.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <a href="/search" style={{ padding: "10px 24px", background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer", textDecoration: "none" }}>Browse items</a>
            <a href="/" style={{ padding: "10px 24px", background: "#fff", color: "#374151", border: "1.5px solid #E2E8F0", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer", textDecoration: "none" }}>Go home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700, fontSize: 20, color: "#1E3A8A", letterSpacing: "-0.5px" }}>FoundLink</span>
          <div style={{ display: "flex", gap: 28 }}>
            {["Home", "Search", "Post"].map((l) => (
              <a key={l} href={l === "Home" ? "/" : `/${l.toLowerCase()}`} style={{ fontSize: 14, color: l === "Post" ? "#2563EB" : "#475569", fontWeight: l === "Post" ? 600 : 400, textDecoration: l === "Post" ? "underline" : "none", textUnderlineOffset: 4 }}>{l}</a>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 99, padding: "6px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              <span style={{ fontSize: 13, color: "#94A3B8" }}>Search for items...</span>
            </div>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "#64748B", textDecoration: "none", marginBottom: 12 }}>
            <ArrowLeftIcon /> Back
          </a>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0F172A", margin: "0 0 8px", letterSpacing: "-1px" }}>
            Report {form.status === "lost" ? "Lost" : "Found"} Item
          </h1>

          {/* Status toggle */}
          <div style={{ display: "inline-flex", background: "#F1F5F9", borderRadius: 10, padding: 3, marginBottom: 24 }}>
            {(["lost", "found"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setForm((p) => ({ ...p, status: s }))}
                style={{
                  padding: "7px 24px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: form.status === s ? (s === "lost" ? "#EF4444" : "#059669") : "transparent",
                  color: form.status === s ? "#fff" : "#64748B",
                  fontWeight: 700, fontSize: 13, letterSpacing: "0.3px", textTransform: "uppercase",
                  transition: "all 0.15s",
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Step indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 8 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: i < step ? "#2563EB" : i === step ? "#2563EB" : "#E2E8F0",
                    fontSize: 13, fontWeight: 700,
                    color: i <= step ? "#fff" : "#94A3B8",
                    flexShrink: 0,
                  }}>
                    {i < step ? <CheckIcon /> : i + 1}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: i === step ? 600 : 400, color: i === step ? "#0F172A" : "#94A3B8", whiteSpace: "nowrap" }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < step ? "#2563EB" : "#E2E8F0", margin: "0 12px", transition: "background 0.3s" }} />
                )}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 8 }}>Step {step + 1} of {STEPS.length}</p>
        </div>

        {/* Step content */}
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: "32px" }}>
          {step === 0 && <StepOne form={form} setForm={setForm} />}
          {step === 1 && <StepTwo form={form} setForm={setForm} />}
          {step === 2 && <StepThree form={form} setForm={setForm} />}

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "12px 16px", marginTop: 20, color: "#DC2626", fontSize: 14 }}>
              {error}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, paddingTop: 24, borderTop: "1px solid #F1F5F9" }}>
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", border: "1.5px solid #E2E8F0", borderRadius: 8, background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                <ArrowLeftIcon /> Previous
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 28px", border: "none", borderRadius: 99,
                  background: canProceed() ? "#2563EB" : "#CBD5E1",
                  color: "#fff", fontSize: 14, fontWeight: 600, cursor: canProceed() ? "pointer" : "default",
                  transition: "background 0.15s",
                }}
              >
                Next Step <ArrowRightIcon />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 28px", border: "none", borderRadius: 99,
                  background: submitting ? "#CBD5E1" : "#2563EB",
                  color: "#fff", fontSize: 14, fontWeight: 600, cursor: submitting ? "default" : "pointer",
                }}
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #E2E8F0", background: "#fff", padding: "24px", marginTop: 40 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, color: "#1E3A8A", margin: "0 0 2px" }}>FoundLink</p>
            <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>© 2024 FoundLink. All rights reserved. Your local community lost and found.</p>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Community Guidelines", "Safety Tips", "Privacy Policy", "Contact Support", "How it Works"].map((l) => (
              <a key={l} href="#" style={{ fontSize: 13, color: "#64748B", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
