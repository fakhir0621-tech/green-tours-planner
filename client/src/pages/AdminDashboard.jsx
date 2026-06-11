import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://localhost:5000/api";

const FALLBACK_STATS = {
  totalUsers: 0, totalTours: 0, totalBookings: 0, totalRevenue: 0,
};

const STATUS_COLORS = {
  confirmed: { bg: "#dcfce7", color: "#16a34a" },
  pending:   { bg: "#fef9c3", color: "#ca8a04" },
  cancelled: { bg: "#fee2e2", color: "#dc2626" },
  rejected:  { bg: "#fee2e2", color: "#dc2626" },
};

const PAYMENT_METHOD_INFO = {
  easypaisa: { name: "EasyPaisa", color: "#00a651", bg: "#e8f8f0", icon: "📱" },
  jazzcash:  { name: "JazzCash",  color: "#cc0000", bg: "#fff0f0", icon: "💳" },
  bank:      { name: "Bank Transfer", color: "#1a56db", bg: "#eff6ff", icon: "🏦" },
};

const CATEGORIES = ["Adventure", "Nature", "Culture", "Beach", "Family", "Trekking", "Wildlife", "City", "Religious", "Other"];

const EMPTY_FORM = {
  tourName: "", location: "", price: "", duration: "",
  description: "", category: "Adventure", availableSeats: "10",
  virtualTourLink: "", images: ["", "", ""],
  itinerary: [{ day: 1, description: "" }],
  virtualTourScenes: [{ title: "", imageUrl: "", description: "" }],
};

const GROQ_MODELS = [
  { id: "llama-3.3-70b-versatile",   label: "Llama 3.3 70B Versatile",   desc: "Best quality — recommended for production",     badge: "⭐ Recommended" },
  { id: "llama-3.1-8b-instant",      label: "Llama 3.1 8B Instant",      desc: "Fastest responses, lower resource usage",       badge: "⚡ Fast" },
  { id: "llama-3.2-90b-text-preview",label: "Llama 3.2 90B Text Preview", desc: "Largest model, highest quality reasoning",      badge: "🔬 Preview" },
  { id: "mixtral-8x7b-32768",        label: "Mixtral 8x7B",              desc: "Long context window (32k tokens)",              badge: "📖 Long Context" },
  { id: "gemma2-9b-it",              label: "Gemma 2 9B",                desc: "Google's efficient instruction-tuned model",    badge: "🎯 Efficient" },
];

// ============================================================
// ---- SIMPLE BAR CHART ----
// ============================================================
function BarChart({ data, color = "#16a34a", height = 160, label = "" }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div>
      {label && <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--gray-600)", marginBottom: "12px" }}>{label}</p>}
      <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: `${height}px` }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
              <div title={`${d.label}: ${d.value}`} style={{ width: "100%", height: `${Math.max((d.value / max) * 100, 2)}%`, background: `linear-gradient(to top, ${color}, ${color}99)`, borderRadius: "4px 4px 0 0", transition: "height 0.5s ease", cursor: "default", minHeight: "4px" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.8"} onMouseLeave={e => e.currentTarget.style.opacity = "1"} />
            </div>
            <span style={{ fontSize: "10px", color: "var(--gray-400)", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", maxWidth: "100%" }}>{d.label}</span>
            <span style={{ fontSize: "10px", fontWeight: "600", color: color }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- DONUT CHART ----
function DonutChart({ segments, size = 160 }) {
  if (!segments || segments.length === 0) return null;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;
  let cumulative = 0;
  const cx = size / 2, cy = size / 2, r = size * 0.36, innerR = size * 0.22;
  const polarToCartesian = (cx, cy, r, angle) => {
    const rad = (angle - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const arcPath = (startAngle, endAngle) => {
    const s = polarToCartesian(cx, cy, r, startAngle);
    const e = polarToCartesian(cx, cy, r, endAngle);
    const si = polarToCartesian(cx, cy, innerR, startAngle);
    const ei = polarToCartesian(cx, cy, innerR, endAngle);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} L ${ei.x} ${ei.y} A ${innerR} ${innerR} 0 ${large} 0 ${si.x} ${si.y} Z`;
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {segments.map((seg, i) => {
          const angle = (seg.value / total) * 360;
          const start = cumulative;
          cumulative += angle;
          return (
            <path key={i} d={arcPath(start, start + angle - 0.5)} fill={seg.color} opacity="0.9"
              style={{ transition: "opacity 0.2s", cursor: "default" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "1"}
              onMouseLeave={e => e.currentTarget.style.opacity = "0.9"}>
              <title>{seg.label}: {seg.value} ({Math.round(seg.value / total * 100)}%)</title>
            </path>
          );
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--gray-800)">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill="var(--gray-400)">total</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: "var(--gray-600)", flex: 1 }}>{seg.label}</span>
            <span style={{ fontSize: "12px", fontWeight: "600", color: seg.color }}>{seg.value}</span>
            <span style={{ fontSize: "11px", color: "var(--gray-400)" }}>({Math.round(seg.value / total * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- MINI STAT CARD ----
function StatCard({ icon, label, value, color, sub }) {
  return (
    <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", transition: "all 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.10)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"; }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{icon}</div>
        <div>
          <p style={{ fontSize: "12px", color: "var(--gray-400)", fontWeight: "500" }}>{label}</p>
          <p style={{ fontSize: "22px", fontWeight: "700", color: color, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{value}</p>
        </div>
      </div>
      {sub && <p style={{ fontSize: "11px", color: "var(--gray-400)" }}>{sub}</p>}
    </div>
  );
}

// ============================================================
// ---- TOUR FORM MODAL ----
// ============================================================
function TourFormModal({ editingTour, onClose, onSaved, token }) {
  const isEdit = !!editingTour;
  const [form, setForm] = useState(() => {
    if (isEdit) {
      return {
        tourName: editingTour.tourName || "", location: editingTour.location || "",
        price: String(editingTour.price || ""), duration: editingTour.duration || "",
        description: editingTour.description || "", category: editingTour.category || "Adventure",
        availableSeats: String(editingTour.availableSeats || "10"), virtualTourLink: editingTour.virtualTourLink || "",
        images: editingTour.images?.length > 0 ? [...editingTour.images, "", ""].slice(0, 3) : ["", "", ""],
        itinerary: editingTour.itinerary?.length > 0 ? editingTour.itinerary.map(d => ({ day: d.day, description: d.description })) : [{ day: 1, description: "" }],
        virtualTourScenes: editingTour.virtualTourScenes?.length > 0 ? editingTour.virtualTourScenes.map(s => ({ title: s.title || "", imageUrl: s.imageUrl || "", description: s.description || "" })) : [{ title: "", imageUrl: "", description: "" }],
      };
    }
    return { ...EMPTY_FORM, images: ["", "", ""], itinerary: [{ day: 1, description: "" }], virtualTourScenes: [{ title: "", imageUrl: "", description: "" }] };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSection, setActiveSection] = useState("basic");

  const inputStyle = { width: "100%", padding: "10px 13px", border: "1.5px solid #e5e7eb", borderRadius: "9px", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", color: "#1f2937", background: "white", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" };
  const labelStyle = { display: "block", fontSize: "12px", fontWeight: "600", color: "#4b5563", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" };
  const setField = (key, val) => { setForm(prev => ({ ...prev, [key]: val })); setError(""); };
  const setImage = (index, val) => { const imgs = [...form.images]; imgs[index] = val; setForm(prev => ({ ...prev, images: imgs })); };
  const addItineraryDay = () => { setForm(prev => ({ ...prev, itinerary: [...prev.itinerary, { day: prev.itinerary.length + 1, description: "" }] })); };
  const removeItineraryDay = (index) => { const updated = form.itinerary.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 })); setForm(prev => ({ ...prev, itinerary: updated })); };
  const setItineraryDesc = (index, val) => { const updated = form.itinerary.map((d, i) => i === index ? { ...d, description: val } : d); setForm(prev => ({ ...prev, itinerary: updated })); };
  const addVirtualScene = () => { setForm(prev => ({ ...prev, virtualTourScenes: [...prev.virtualTourScenes, { title: "", imageUrl: "", description: "" }] })); };
  const removeVirtualScene = (index) => { setForm(prev => ({ ...prev, virtualTourScenes: prev.virtualTourScenes.filter((_, i) => i !== index) })); };
  const setVirtualScene = (index, field, val) => { const updated = form.virtualTourScenes.map((s, i) => i === index ? { ...s, [field]: val } : s); setForm(prev => ({ ...prev, virtualTourScenes: updated })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tourName.trim()) { setError("Tour name is required."); setActiveSection("basic"); return; }
    if (!form.location.trim()) { setError("Location is required."); setActiveSection("basic"); return; }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) { setError("Please enter a valid price."); setActiveSection("basic"); return; }
    setSaving(true); setError("");
    const payload = {
      tourName: form.tourName.trim(), location: form.location.trim(), price: Number(form.price), duration: form.duration.trim(),
      description: form.description.trim(), category: form.category, availableSeats: Number(form.availableSeats) || 10,
      virtualTourLink: form.virtualTourLink.trim(), images: form.images.filter(img => img.trim() !== ""),
      itinerary: form.itinerary.filter(d => d.description.trim() !== ""),
      virtualTourScenes: form.virtualTourScenes.filter(s => s.imageUrl.trim() !== "").map(s => ({ title: s.title.trim() || "Scene", imageUrl: s.imageUrl.trim(), description: s.description.trim() })),
    };
    try {
      const url = isEdit ? `${BASE_URL}/tours/${editingTour._id}` : `${BASE_URL}/tours/add`;
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save tour.");
      const saved = data.tour || data.updatedTour || data;
      setSuccess(isEdit ? "Tour updated! ✅" : "Tour added! ✅");
      setTimeout(() => { onSaved(saved, isEdit); }, 900);
    } catch (err) { setError(err.message || "Something went wrong."); }
    finally { setSaving(false); }
  };

  const SECTIONS = [
    { key: "basic", label: "Basic Info", icon: "📋" }, { key: "details", label: "Details", icon: "📝" },
    { key: "images", label: "Images", icon: "🖼️" }, { key: "itinerary", label: "Itinerary", icon: "🗓️" },
    { key: "virtual", label: "360° Tour", icon: "🌐" },
  ];

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px", backdropFilter: "blur(3px)" }}>
      <div style={{ background: "white", borderRadius: "20px", width: "100%", maxWidth: "680px", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ background: "linear-gradient(135deg, #14532d, #052e16)", padding: "22px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: "10px", letterSpacing: "3px", color: "#4ade80", fontWeight: "600", textTransform: "uppercase", marginBottom: "4px" }}>{isEdit ? "EDITING TOUR" : "NEW TOUR"}</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "700", color: "white" }}>{isEdit ? editingTour.tourName : "Add a New Tour"}</h2>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", width: "36px", height: "36px", borderRadius: "50%", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ display: "flex", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", flexShrink: 0, overflowX: "auto" }}>
          {SECTIONS.map(s => (
            <button key={s.key} onClick={() => setActiveSection(s.key)} style={{ flex: 1, minWidth: "fit-content", padding: "12px 16px", border: "none", borderBottom: activeSection === s.key ? "2px solid #16a34a" : "2px solid transparent", background: activeSection === s.key ? "#f0fdf4" : "transparent", color: activeSection === s.key ? "#16a34a" : "#6b7280", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", whiteSpace: "nowrap" }}>{s.icon} {s.label}</button>
          ))}
        </div>
        {(error || success) && (
          <div style={{ padding: "10px 28px", flexShrink: 0, background: error ? "#fef2f2" : "#f0fdf4", borderBottom: `1px solid ${error ? "#fecaca" : "#bbf7d0"}` }}>
            <p style={{ fontSize: "13px", fontWeight: "500", color: error ? "#dc2626" : "#16a34a" }}>{error ? `⚠️ ${error}` : success}</p>
          </div>
        )}
        <div style={{ overflowY: "auto", flex: 1 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ padding: "24px 28px" }}>
              {activeSection === "basic" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Tour Name *</label><input type="text" value={form.tourName} onChange={e => setField("tourName", e.target.value)} placeholder="e.g. Hunza Valley Adventure" style={inputStyle} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} /></div>
                    <div><label style={labelStyle}>Location *</label><input type="text" value={form.location} onChange={e => setField("location", e.target.value)} placeholder="e.g. Hunza, Pakistan" style={inputStyle} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} /></div>
                    <div><label style={labelStyle}>Category</label><select value={form.category} onChange={e => setField("category", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label style={labelStyle}>Price (Rs.) *</label><input type="number" value={form.price} onChange={e => setField("price", e.target.value)} placeholder="e.g. 25000" min="0" style={inputStyle} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} /></div>
                    <div><label style={labelStyle}>Duration</label><input type="text" value={form.duration} onChange={e => setField("duration", e.target.value)} placeholder="e.g. 5 Days" style={inputStyle} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} /></div>
                    <div><label style={labelStyle}>Available Seats</label><input type="number" value={form.availableSeats} onChange={e => setField("availableSeats", e.target.value)} placeholder="e.g. 20" min="1" style={inputStyle} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} /></div>
                  </div>
                </div>
              )}
              {activeSection === "details" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div><label style={labelStyle}>Tour Description</label><textarea value={form.description} onChange={e => setField("description", e.target.value)} placeholder="Describe the tour experience..." rows={7} style={{ ...inputStyle, resize: "vertical", lineHeight: "1.7" }} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} /><p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "5px" }}>{form.description.length} characters</p></div>
                  <div><label style={labelStyle}>Virtual Tour Link (optional)</label><input type="url" value={form.virtualTourLink} onChange={e => setField("virtualTourLink", e.target.value)} placeholder="https://..." style={inputStyle} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} /></div>
                </div>
              )}
              {activeSection === "images" && (
                <div>
                  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px", lineHeight: "1.7", background: "#f0fdf4", padding: "12px 14px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>💡 Paste direct image URLs. Use Unsplash or Imgur for free hosting.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {form.images.map((img, index) => (
                      <div key={index}>
                        <label style={labelStyle}>Image {index + 1} {index === 0 ? "(Main / Cover) *" : "(Optional)"}</label>
                        <input type="url" value={img} onChange={e => setImage(index, e.target.value)} placeholder="https://images.unsplash.com/..." style={inputStyle} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
                        {img.trim() !== "" && (<div style={{ marginTop: "8px", height: "100px", borderRadius: "8px", overflow: "hidden", border: "1px solid #e5e7eb" }}><img src={img} alt={`Preview ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; e.target.parentElement.innerHTML = '<div style="height:100%;display:flex;align-items:center;justify-content:center;background:#fef2f2;color:#dc2626;font-size:12px;">⚠️ Invalid image URL</div>'; }} /></div>)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeSection === "itinerary" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div><p style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>Day-by-Day Itinerary</p><p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>Optional</p></div>
                    <button type="button" onClick={addItineraryDay} style={{ background: "#f0fdf4", color: "#16a34a", border: "1.5px solid #bbf7d0", padding: "8px 16px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>+ Add Day</button>
                  </div>
                  {form.itinerary.length === 0 && (<div style={{ textAlign: "center", padding: "40px", background: "#f9fafb", borderRadius: "12px", border: "1.5px dashed #e5e7eb" }}><p style={{ fontSize: "32px", marginBottom: "8px" }}>🗓️</p><p style={{ fontSize: "14px", color: "#9ca3af" }}>No itinerary yet. Click "+ Add Day".</p></div>)}
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {form.itinerary.map((day, index) => (
                      <div key={index} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#16a34a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", flexShrink: 0, marginTop: "2px" }}>{day.day}</div>
                        <div style={{ flex: 1 }}><textarea value={day.description} onChange={e => setItineraryDesc(index, e.target.value)} placeholder={`Day ${day.day} — describe activities...`} rows={2} style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} /></div>
                        {form.itinerary.length > 1 && (<button type="button" onClick={() => removeItineraryDay(index)} style={{ background: "#fef2f2", color: "#dc2626", border: "1.5px solid #fecaca", width: "32px", height: "32px", borderRadius: "50%", fontSize: "14px", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px" }}>✕</button>)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeSection === "virtual" && (
                <div>
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "14px 16px", marginBottom: "20px" }}>
                    <p style={{ fontSize: "13px", color: "#166534", fontWeight: "600", marginBottom: "4px" }}>🌐 Virtual 3D Tour Scenes</p>
                    <p style={{ fontSize: "12px", color: "#16a34a", lineHeight: "1.6" }}>Add equirectangular 360° panorama images (2:1 ratio). Free sources: <strong>flickr.com/groups/equirectangular</strong>, <strong>polyhaven.com</strong></p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div><p style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>Scenes ({form.virtualTourScenes.length})</p><p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>{form.virtualTourScenes.filter(s => s.imageUrl.trim()).length} with images</p></div>
                    <button type="button" onClick={addVirtualScene} style={{ background: "#f0fdf4", color: "#16a34a", border: "1.5px solid #bbf7d0", padding: "8px 16px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>+ Add Scene</button>
                  </div>
                  {form.virtualTourScenes.length === 0 && (<div style={{ textAlign: "center", padding: "40px", background: "#f9fafb", borderRadius: "12px", border: "1.5px dashed #e5e7eb" }}><p style={{ fontSize: "32px", marginBottom: "8px" }}>🌐</p><p style={{ fontSize: "14px", color: "#9ca3af" }}>No scenes yet. Click "+ Add Scene".</p></div>)}
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {form.virtualTourScenes.map((scene, idx) => (
                      <div key={idx} style={{ background: "#f9fafb", border: `1.5px solid ${scene.imageUrl.trim() ? "#bbf7d0" : "#e5e7eb"}`, borderRadius: "12px", padding: "18px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: scene.imageUrl.trim() ? "#16a34a" : "#9ca3af", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700" }}>{idx + 1}</div>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>Scene {idx + 1}{scene.title.trim() && ` — ${scene.title}`}</span>
                            {scene.imageUrl.trim() && <span style={{ fontSize: "10px", background: "#dcfce7", color: "#16a34a", padding: "2px 8px", borderRadius: "50px", fontWeight: "600" }}>✅ Ready</span>}
                          </div>
                          {form.virtualTourScenes.length > 1 && (<button type="button" onClick={() => removeVirtualScene(idx)} style={{ background: "#fef2f2", color: "#dc2626", border: "1.5px solid #fecaca", width: "28px", height: "28px", borderRadius: "50%", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>)}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div><label style={labelStyle}>Scene Title</label><input type="text" value={scene.title} onChange={e => setVirtualScene(idx, "title", e.target.value)} placeholder="e.g. Mountain View" style={inputStyle} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} /></div>
                          <div>
                            <label style={labelStyle}>360° Panorama Image URL *</label>
                            <input type="url" value={scene.imageUrl} onChange={e => setVirtualScene(idx, "imageUrl", e.target.value)} placeholder="https://example.com/panorama.jpg" style={{ ...inputStyle, borderColor: scene.imageUrl.trim() ? "#16a34a" : "#e5e7eb" }} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = scene.imageUrl.trim() ? "#16a34a" : "#e5e7eb"} />
                            {scene.imageUrl.trim() && (<div style={{ marginTop: "8px", height: "80px", borderRadius: "6px", overflow: "hidden", border: "1px solid #e5e7eb" }}><img src={scene.imageUrl} alt="Panorama preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; e.target.parentElement.innerHTML = '<div style="height:100%;display:flex;align-items:center;justify-content:center;background:#fef2f2;color:#dc2626;font-size:12px;">⚠️ Invalid</div>'; }} /></div>)}
                          </div>
                          <div><label style={labelStyle}>Scene Description (optional)</label><input type="text" value={scene.description} onChange={e => setVirtualScene(idx, "description", e.target.value)} placeholder="e.g. Views from Fairy Meadows" style={inputStyle} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: "16px 28px", borderTop: "1px solid #e5e7eb", background: "#f9fafb", display: "flex", gap: "12px", justifyContent: "flex-end", flexShrink: 0 }}>
              <button type="button" onClick={onClose} style={{ background: "white", color: "#6b7280", border: "1.5px solid #e5e7eb", padding: "11px 24px", borderRadius: "50px", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ background: saving ? "#86efac" : "#16a34a", color: "white", border: "none", padding: "11px 32px", borderRadius: "50px", fontSize: "14px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                {saving ? (<><div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Saving...</>) : (isEdit ? "💾 Save Changes" : "🌿 Add Tour")}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ============================================================
// ---- USER ACTION MODAL ----
// ============================================================
function UserActionModal({ targetUser, action, onClose, onDone, token }) {
  const [reason, setReason] = useState("");
  const [days, setDays] = useState("7");
  const [notes, setNotes] = useState(targetUser?.moderationNotes || "");
  const [newRole, setNewRole] = useState(targetUser?.role || "traveler");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const ACTION_CONFIG = {
    ban:       { title: "Ban User",           color: "#dc2626", icon: "🚫", needsReason: true,  needsDays: false, needsRole: false, needsNotes: false },
    suspend:   { title: "Suspend User",       color: "#d97706", icon: "⏸️", needsReason: true,  needsDays: true,  needsRole: false, needsNotes: false },
    flag:      { title: "Flag as Suspicious", color: "#7c3aed", icon: "🚩", needsReason: true,  needsDays: false, needsRole: false, needsNotes: false },
    role:      { title: "Change Role",        color: "#1d4ed8", icon: "👑", needsReason: false, needsDays: false, needsRole: true,  needsNotes: false },
    notes:     { title: "Moderation Notes",   color: "#0891b2", icon: "📝", needsReason: false, needsDays: false, needsRole: false, needsNotes: true  },
    reset:     { title: "Reset User Access",  color: "#16a34a", icon: "🔓", needsReason: false, needsDays: false, needsRole: false, needsNotes: false },
    unban:     { title: "Lift Ban",           color: "#16a34a", icon: "✅", needsReason: false, needsDays: false, needsRole: false, needsNotes: false },
    unsuspend: { title: "Lift Suspension",    color: "#16a34a", icon: "▶️", needsReason: false, needsDays: false, needsRole: false, needsNotes: false },
    unflag:    { title: "Remove Flag",        color: "#16a34a", icon: "✅", needsReason: false, needsDays: false, needsRole: false, needsNotes: false },
    delete:    { title: "Delete Account",     color: "#dc2626", icon: "🗑️", needsReason: false, needsDays: false, needsRole: false, needsNotes: false },
  };
  const cfg = ACTION_CONFIG[action] || {};
  const ENDPOINT_MAP = { ban: `/users/ban/`, unban: `/users/unban/`, suspend: `/users/suspend/`, unsuspend: `/users/unsuspend/`, flag: `/users/flag/`, unflag: `/users/unflag/`, reset: `/users/reset/`, notes: `/users/notes/`, role: `/users/role/`, delete: `/users/` };
  const handleConfirm = async () => {
    if (cfg.needsReason && !reason.trim()) { setError("Please enter a reason."); return; }
    if (cfg.needsRole && !newRole) { setError("Please select a role."); return; }
    setLoading(true); setError("");
    try {
      const endpoint = BASE_URL + ENDPOINT_MAP[action] + targetUser._id;
      const method = action === "delete" ? "DELETE" : "PUT";
      const body = {};
      if (cfg.needsReason) body.reason = reason.trim();
      if (cfg.needsDays) body.days = Number(days);
      if (cfg.needsRole) body.role = newRole;
      if (cfg.needsNotes) body.notes = notes;
      const res = await fetch(endpoint, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: method !== "DELETE" ? JSON.stringify(body) : undefined });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Action failed.");
      onDone(targetUser._id, action, data.user || null);
    } catch (err) { setError(err.message || "Something went wrong."); }
    finally { setLoading(false); }
  };
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "20px", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "white", borderRadius: "18px", width: "100%", maxWidth: "460px", boxShadow: "0 24px 60px rgba(0,0,0,0.25)", overflow: "hidden" }}>
        <div style={{ background: cfg.color + "12", borderBottom: `1px solid ${cfg.color}25`, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "22px" }}>{cfg.icon}</span>
            <div><p style={{ fontSize: "16px", fontWeight: "700", color: cfg.color }}>{cfg.title}</p><p style={{ fontSize: "12px", color: "#6b7280", marginTop: "1px" }}>{targetUser?.name || targetUser?.email}</p></div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#9ca3af" }}>✕</button>
        </div>
        <div style={{ padding: "22px 24px" }}>
          {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>⚠️ {error}</div>}
          {!cfg.needsReason && !cfg.needsDays && !cfg.needsRole && !cfg.needsNotes && (<p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.7" }}>{action === "delete" ? `Permanently delete ${targetUser?.name}'s account?` : action === "reset" ? `Clear all bans and flags for ${targetUser?.name}?` : action === "unban" ? `Lift the ban for ${targetUser?.name}?` : action === "unsuspend" ? `End the suspension for ${targetUser?.name}?` : `Remove the flag from ${targetUser?.name}?`}</p>)}
          {cfg.needsReason && (<div style={{ marginBottom: "16px" }}><label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#4b5563", marginBottom: "6px", textTransform: "uppercase" }}>Reason *</label><textarea value={reason} onChange={e => { setReason(e.target.value); setError(""); }} rows={3} style={{ width: "100%", padding: "10px 13px", border: "1.5px solid #e5e7eb", borderRadius: "9px", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", color: "#1f2937", background: "white", outline: "none", resize: "none", lineHeight: "1.6", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = cfg.color} onBlur={e => e.target.style.borderColor = "#e5e7eb"} /></div>)}
          {cfg.needsDays && (<div style={{ marginBottom: "16px" }}><label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#4b5563", marginBottom: "8px", textTransform: "uppercase" }}>Duration</label><div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>{[{ val: "1", label: "1 Day" }, { val: "3", label: "3 Days" }, { val: "7", label: "1 Week" }, { val: "14", label: "2 Weeks" }, { val: "30", label: "1 Month" }].map(d => (<button key={d.val} type="button" onClick={() => setDays(d.val)} style={{ padding: "7px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", border: days === d.val ? `2px solid ${cfg.color}` : "1.5px solid #e5e7eb", background: days === d.val ? cfg.color + "15" : "white", color: days === d.val ? cfg.color : "#6b7280", cursor: "pointer" }}>{d.label}</button>))}</div></div>)}
          {cfg.needsRole && (<div style={{ marginBottom: "16px" }}><label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#4b5563", marginBottom: "8px", textTransform: "uppercase" }}>New Role</label><div style={{ display: "flex", gap: "10px" }}>{["traveler", "admin"].map(r => (<button key={r} type="button" onClick={() => setNewRole(r)} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: newRole === r ? `2px solid ${cfg.color}` : "1.5px solid #e5e7eb", background: newRole === r ? cfg.color + "12" : "white", color: newRole === r ? cfg.color : "#6b7280", fontSize: "13px", fontWeight: "600", cursor: "pointer", textTransform: "capitalize" }}>{r === "admin" ? "👑 Admin" : "🧳 Traveler"}</button>))}</div></div>)}
          {cfg.needsNotes && (<div style={{ marginBottom: "8px" }}><label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#4b5563", marginBottom: "6px", textTransform: "uppercase" }}>Internal Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} style={{ width: "100%", padding: "10px 13px", border: "1.5px solid #e5e7eb", borderRadius: "9px", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", color: "#1f2937", background: "white", outline: "none", resize: "vertical", lineHeight: "1.6", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = cfg.color} onBlur={e => e.target.style.borderColor = "#e5e7eb"} /></div>)}
        </div>
        <div style={{ padding: "14px 24px", background: "#f9fafb", borderTop: "1px solid #e5e7eb", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "white", color: "#6b7280", border: "1.5px solid #e5e7eb", padding: "10px 22px", borderRadius: "50px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>Cancel</button>
          <button onClick={handleConfirm} disabled={loading} style={{ background: loading ? "#d1d5db" : cfg.color, color: "white", border: "none", padding: "10px 24px", borderRadius: "50px", fontSize: "13px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
            {loading ? (<><div style={{ width: "13px", height: "13px", border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Processing...</>) : `${cfg.icon} Confirm`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ---- MAIN ADMIN DASHBOARD ----
// ============================================================
export default function AdminDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab]                 = useState("overview");
  const [stats, setStats]                         = useState(FALLBACK_STATS);
  const [users, setUsers]                         = useState([]);
  const [tours, setTours]                         = useState([]);
  const [bookings, setBookings]                   = useState([]);
  const [allReviews, setAllReviews]               = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [deletingId, setDeletingId]               = useState(null);
  const [verifyingId, setVerifyingId]             = useState(null);
  const [adminNote, setAdminNote]                 = useState("");
  const [noteTarget, setNoteTarget]               = useState(null);
  const [previewScreenshot, setPreviewScreenshot] = useState(null);
  const [showTourForm, setShowTourForm]           = useState(false);
  const [editingTour, setEditingTour]             = useState(null);
  const [modFilter, setModFilter]                 = useState("all");
  const [modSearch, setModSearch]                 = useState("");
  const [modAction, setModAction]                 = useState(null);
  const [blockedUsers, setBlockedUsers]           = useState(() => {
    try { return JSON.parse(localStorage.getItem("gt_blocked_users") || "[]"); } catch { return []; }
  });

  // ---- KB STATE ----
  const [kb, setKb]                 = useState([]);
  const [kbLoading, setKbLoading]   = useState(false);
  const [kbNewQ, setKbNewQ]         = useState("");
  const [kbNewA, setKbNewA]         = useState("");
  const [kbEditIndex, setKbEditIndex] = useState(null);
  const [kbEditQ, setKbEditQ]       = useState("");
  const [kbEditA, setKbEditA]       = useState("");
  const [kbSaving, setKbSaving]     = useState(false);
  const [kbMsg, setKbMsg]           = useState("");

  // ---- AI MODEL STATE ----
  const [aiModel, setAiModel]               = useState("llama-3.3-70b-versatile");
  const [aiTemp, setAiTemp]                 = useState(0.7);
  const [aiMaxTokens, setAiMaxTokens]       = useState(500);
  const [aiSystemPrompt, setAiSystemPrompt] = useState("");
  const [aiSaving, setAiSaving]             = useState(false);
  const [aiMsg, setAiMsg]                   = useState("");
  const [aiTestInput, setAiTestInput]       = useState("");
  const [aiTestReply, setAiTestReply]       = useState("");
  const [aiTesting, setAiTesting]           = useState(false);

  // ---- SUPPORT MESSAGES STATE (NEW) ----
  const [supportMessages, setSupportMessages] = useState([]);
  const [supportLoading, setSupportLoading]   = useState(false);
  const [replyingId, setReplyingId]           = useState(null);
  const [replyText, setReplyText]             = useState("");
  const [replyTarget, setReplyTarget]         = useState(null);
  const [supportMsg, setSupportMsg]           = useState("");

  useEffect(() => {
    if (!user)                 { navigate("/login"); return; }
    if (user.role !== "admin") { navigate("/");      return; }
    fetchAll();
    fetchKB();
    fetchSupport(); // NEW
    window.scrollTo(0, 0);
  }, [user, navigate]);

  // ---- FETCH KB ----
  const fetchKB = async () => {
    setKbLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/chatbot/kb`);
      const data = await res.json();
      setKb(data.kb || []);
    } catch {}
    finally { setKbLoading(false); }
  };

  // ---- FETCH SUPPORT MESSAGES (NEW) ----
  const fetchSupport = async () => {
    setSupportLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/support/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSupportMessages(Array.isArray(data) ? data : []);
      }
    } catch {}
    finally { setSupportLoading(false); }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [uRes, tRes, bRes, rRes] = await Promise.allSettled([
        fetch(`${BASE_URL}/users/all`,    { headers }).then(r => r.json()),
        fetch(`${BASE_URL}/tours`,        { headers }).then(r => r.json()),
        fetch(`${BASE_URL}/bookings/all`, { headers }).then(r => r.json()),
        fetch(`${BASE_URL}/reviews`,      { headers }).then(r => r.json()),
      ]);
      const userList    = uRes.status === "fulfilled" ? (Array.isArray(uRes.value) ? uRes.value : uRes.value.users || []) : [];
      const tourList    = tRes.status === "fulfilled" ? (tRes.value.tours || tRes.value.data || (Array.isArray(tRes.value) ? tRes.value : [])) : [];
      const bookingList = bRes.status === "fulfilled" ? (bRes.value.bookings || bRes.value.data || (Array.isArray(bRes.value) ? bRes.value : [])) : [];
      const reviewList  = rRes.status === "fulfilled" ? (rRes.value.reviews || rRes.value.data || (Array.isArray(rRes.value) ? rRes.value : [])) : [];
      setUsers(userList); setTours(tourList); setBookings(bookingList); setAllReviews(reviewList);
      const revenue = bookingList.filter(b => (b.status || "").toLowerCase() === "confirmed").reduce((sum, b) => sum + (b.totalPrice || 0), 0);
      setStats({ totalUsers: userList.length, totalTours: tourList.length, totalBookings: bookingList.length, totalRevenue: revenue });
    } catch {}
    finally { setLoading(false); }
  };

  const openAddTour  = ()     => { setEditingTour(null); setShowTourForm(true); };
  const openEditTour = (tour) => { setEditingTour(tour); setShowTourForm(true); };
  const handleTourSaved = (savedTour, isEdit) => {
    if (isEdit) { setTours(prev => prev.map(t => t._id === savedTour._id ? savedTour : t)); }
    else { setTours(prev => [savedTour, ...prev]); setStats(prev => ({ ...prev, totalTours: prev.totalTours + 1 })); }
    setShowTourForm(false); setEditingTour(null);
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    setDeletingId(id);
    try { await fetch(`${BASE_URL}/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); setUsers(prev => prev.filter(u => u._id !== id)); }
    catch {} finally { setDeletingId(null); }
  };
  const deleteTour = async (id) => {
    if (!window.confirm("Delete this tour permanently?")) return;
    setDeletingId(id);
    try { await fetch(`${BASE_URL}/tours/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); setTours(prev => prev.filter(t => t._id !== id)); setStats(prev => ({ ...prev, totalTours: Math.max(0, prev.totalTours - 1) })); }
    catch {} finally { setDeletingId(null); }
  };
  const updateBookingStatus = async (id, status) => {
    try { await fetch(`${BASE_URL}/bookings/status/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) }); setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b)); }
    catch {}
  };
  const verifyPayment = async (id, action) => {
    setVerifyingId(id);
    try {
      await fetch(`${BASE_URL}/bookings/verify/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ action, adminNote: noteTarget === id ? adminNote : "" }) });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, paymentStatus: action === "approve" ? "Verified" : "Rejected", status: action === "approve" ? "Confirmed" : "Rejected", adminNote: noteTarget === id ? adminNote : b.adminNote } : b));
      setAdminNote(""); setNoteTarget(null);
    } catch {} finally { setVerifyingId(null); }
  };
  const deleteReview = async (id) => {
    if (!window.confirm("Delete this review permanently?")) return;
    setDeletingId(id);
    try { await fetch(`${BASE_URL}/reviews/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); }
    catch {} finally { setAllReviews(prev => prev.filter(r => r._id !== id)); setDeletingId(null); }
  };
  const toggleBlockUser = (userId, userName) => {
    const isBlocked = blockedUsers.includes(userId);
    if (!window.confirm(isBlocked ? `Unblock ${userName}?` : `Block ${userName} from reviews?`)) return;
    const updated = isBlocked ? blockedUsers.filter(id => id !== userId) : [...blockedUsers, userId];
    setBlockedUsers(updated); localStorage.setItem("gt_blocked_users", JSON.stringify(updated));
  };
  const handleModerationDone = (userId, action, updatedUser) => {
    if (action === "delete") { setUsers(prev => prev.filter(u => u._id !== userId)); }
    else if (updatedUser) { setUsers(prev => prev.map(u => u._id === userId ? { ...u, ...updatedUser } : u)); }
    setModAction(null);
  };

  // ---- KB ACTIONS ----
  const kbAddEntry = async () => {
    if (!kbNewQ.trim() || !kbNewA.trim()) return;
    setKbSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/chatbot/kb`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ q: kbNewQ.trim(), a: kbNewA.trim() }),
      });
      const data = await res.json();
      setKb(data.kb || []); setKbNewQ(""); setKbNewA("");
      setKbMsg("✅ Entry added! Chatbot will now use this."); setTimeout(() => setKbMsg(""), 3000);
    } catch { setKbMsg("❌ Failed to add entry."); setTimeout(() => setKbMsg(""), 3000); }
    finally { setKbSaving(false); }
  };
  const kbUpdateEntry = async (index) => {
    if (!kbEditQ.trim() || !kbEditA.trim()) return;
    setKbSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/chatbot/kb/${index}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ q: kbEditQ.trim(), a: kbEditA.trim() }),
      });
      const data = await res.json();
      setKb(data.kb || []); setKbEditIndex(null);
      setKbMsg("✅ Entry updated!"); setTimeout(() => setKbMsg(""), 3000);
    } catch { setKbMsg("❌ Failed to update."); setTimeout(() => setKbMsg(""), 3000); }
    finally { setKbSaving(false); }
  };
  const kbDeleteEntry = async (index) => {
    if (!window.confirm("Delete this FAQ entry?")) return;
    try {
      const res = await fetch(`${BASE_URL}/chatbot/kb/${index}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setKb(data.kb || []);
      setKbMsg("✅ Entry deleted."); setTimeout(() => setKbMsg(""), 3000);
    } catch { setKbMsg("❌ Failed to delete."); setTimeout(() => setKbMsg(""), 3000); }
  };

  // ---- AI TEST ----
  const handleAiTest = async () => {
    if (!aiTestInput.trim()) return;
    setAiTesting(true); setAiTestReply("");
    try {
      const res = await fetch(`${BASE_URL}/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: aiTestInput.trim(), history: [] }),
      });
      const data = await res.json();
      setAiTestReply(data.reply || "No response.");
    } catch { setAiTestReply("❌ Connection failed. Check that your server is running."); }
    finally { setAiTesting(false); }
  };

  const pendingPayments  = bookings.filter(b => (b.paymentStatus || "").toLowerCase() === "pending" && b.transactionId);
  const bannedCount      = users.filter(u => u.isBanned).length;
  const suspendedCount   = users.filter(u => u.isSuspended && !u.isBanned).length;
  const flaggedCount     = users.filter(u => u.isFlagged && !u.isBanned).length;
  const moderationAlerts = bannedCount + suspendedCount + flaggedCount;

  // ---- Support open count for tab badge (NEW) ----
  const openSupportCount = supportMessages.filter(m => m.status === "open").length;

  const analyticsData = (() => {
    const confirmed = bookings.filter(b => (b.status || "").toLowerCase() === "confirmed").length;
    const pending   = bookings.filter(b => (b.status || "").toLowerCase() === "pending").length;
    const cancelled = bookings.filter(b => (b.status || "").toLowerCase() === "cancelled").length;
    const rejected  = bookings.filter(b => (b.status || "").toLowerCase() === "rejected").length;
    const now = new Date();
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthlyBookings = Array.from({ length: 6 }, (_, i) => { const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1); const count = bookings.filter(b => { const bd = new Date(b.createdAt || b.bookingDate); return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear(); }).length; return { label: monthNames[d.getMonth()], value: count }; });
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => { const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1); const rev = bookings.filter(b => { const bd = new Date(b.createdAt || b.bookingDate); return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear() && (b.status || "").toLowerCase() === "confirmed"; }).reduce((sum, b) => sum + (b.totalPrice || 0), 0); return { label: monthNames[d.getMonth()], value: Math.round(rev / 1000) }; });
    const tourBookingCount = {}; bookings.forEach(b => { const name = b.tour?.tourName || "Unknown"; tourBookingCount[name] = (tourBookingCount[name] || 0) + 1; });
    const topTours = Object.entries(tourBookingCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, value]) => ({ label: label.slice(0, 12), value }));
    const customerCount = {}; bookings.forEach(b => { const name = b.user?.name || "Unknown"; const id = b.user?._id || name; if (!customerCount[id]) customerCount[id] = { name, count: 0, spent: 0 }; customerCount[id].count++; customerCount[id].spent += b.totalPrice || 0; });
    const topCustomers = Object.values(customerCount).sort((a, b) => b.count - a.count).slice(0, 5);
    const categoryCount = {}; tours.forEach(t => { const cat = t.category || "Other"; categoryCount[cat] = (categoryCount[cat] || 0) + 1; });
    const categoryColors = ["#16a34a","#0891b2","#7c3aed","#db6b1f","#dc2626","#ca8a04","#059669","#1d4ed8"];
    const categorySegments = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value], i) => ({ label, value, color: categoryColors[i % categoryColors.length] }));
    const ratingDist = [1, 2, 3, 4, 5].map(r => ({ label: `${r}★`, value: allReviews.filter(rev => (rev.rating || 5) === r).length }));
    const pmCount = { easypaisa: 0, jazzcash: 0, bank: 0 }; bookings.forEach(b => { if (b.paymentMethod && pmCount[b.paymentMethod] !== undefined) pmCount[b.paymentMethod]++; });
    const paymentSegments = [{ label: "EasyPaisa", value: pmCount.easypaisa, color: "#00a651" }, { label: "JazzCash", value: pmCount.jazzcash, color: "#cc0000" }, { label: "Bank Transfer", value: pmCount.bank, color: "#1a56db" }].filter(s => s.value > 0);
    const avgRating = allReviews.length > 0 ? (allReviews.reduce((s, r) => s + (r.rating || 5), 0) / allReviews.length).toFixed(1) : "N/A";
    const conversionRate = bookings.length > 0 ? Math.round((confirmed / bookings.length) * 100) : 0;
    return { confirmed, pending, cancelled, rejected, monthlyBookings, monthlyRevenue, topTours, topCustomers, categorySegments, ratingDist, paymentSegments, avgRating, conversionRate };
  })();

  const TABS = [
    { key: "overview",   icon: "📊", label: "Overview" },
    { key: "analytics",  icon: "📈", label: "Analytics" },
    { key: "moderation", icon: "🛡️", label: `Moderation${moderationAlerts > 0 ? ` (${moderationAlerts})` : ""}` },
    { key: "payments",   icon: "💰", label: `Payments${pendingPayments.length > 0 ? ` (${pendingPayments.length})` : ""}` },
    { key: "users",      icon: "👥", label: `Users (${users.length})` },
    { key: "tours",      icon: "🗺️", label: `Tours (${tours.length})` },
    { key: "bookings",   icon: "📋", label: `Bookings (${bookings.length})` },
    { key: "reviews",    icon: "⭐", label: `Reviews (${allReviews.length})` },
    { key: "kb",         icon: "🧠", label: `KB (${kb.length})` },
    { key: "ai",         icon: "🤖", label: "AI Model" },
    // ---- NEW: Support tab ----
    { key: "support",    icon: "💬", label: `Support${openSupportCount > 0 ? ` (${openSupportCount})` : ""}` },
  ];

  const thStyle = { padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "var(--gray-400)", letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid var(--gray-100)", background: "var(--gray-50)", whiteSpace: "nowrap" };
  const tdStyle = { padding: "14px 16px", fontSize: "14px", color: "var(--gray-700)", borderBottom: "1px solid var(--gray-50)", verticalAlign: "middle" };
  const inputBase = { width: "100%", padding: "10px 13px", border: "1.5px solid #e5e7eb", borderRadius: "9px", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", color: "#1f2937", background: "white", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" };
  const labelBase = { display: "block", fontSize: "12px", fontWeight: "600", color: "#4b5563", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" };

  const getUserStatus = (u) => {
    if (u.isBanned)    return { label: "Banned",    color: "#dc2626", bg: "#fee2e2", icon: "🚫" };
    if (u.isSuspended && u.suspendedUntil && new Date(u.suspendedUntil) > new Date()) return { label: "Suspended", color: "#d97706", bg: "#fef9c3", icon: "⏸️" };
    if (u.isFlagged)   return { label: "Flagged",   color: "#7c3aed", bg: "#ede9fe", icon: "🚩" };
    if (u.role === "admin") return { label: "Admin", color: "#1d4ed8", bg: "#eff6ff", icon: "👑" };
    return { label: "Active", color: "#16a34a", bg: "#dcfce7", icon: "✅" };
  };
  const filteredForModeration = users.filter(u => {
    const q = modSearch.toLowerCase();
    const matchSearch = !q || (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
    const matchFilter = modFilter === "all" ? true : modFilter === "banned" ? u.isBanned : modFilter === "suspended" ? (u.isSuspended && !u.isBanned) : modFilter === "flagged" ? (u.isFlagged && !u.isBanned) : modFilter === "admin" ? u.role === "admin" : modFilter === "active" ? (!u.isBanned && !u.isSuspended && !u.isFlagged) : true;
    return matchSearch && matchFilter;
  });

  if (loading) return (
    <div style={{ paddingTop: "70px", textAlign: "center", padding: "160px 0" }}>
      <div style={{ width: "48px", height: "48px", border: "4px solid var(--green-100)", borderTop: "4px solid var(--green-500)", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "var(--gray-400)" }}>Loading dashboard...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ paddingTop: "70px", background: "var(--off-white)", minHeight: "100vh" }}>

      {showTourForm && <TourFormModal editingTour={editingTour} onClose={() => { setShowTourForm(false); setEditingTour(null); }} onSaved={handleTourSaved} token={token} />}
      {modAction && <UserActionModal targetUser={modAction.user} action={modAction.action} onClose={() => setModAction(null)} onDone={handleModerationDone} token={token} />}
      {previewScreenshot && (
        <div onClick={() => setPreviewScreenshot(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, cursor: "pointer", padding: "20px" }}>
          <img src={previewScreenshot} alt="Payment screenshot" onClick={e => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: "12px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }} />
          <button onClick={() => setPreviewScreenshot(null)} style={{ position: "fixed", top: "16px", right: "16px", background: "white", border: "none", borderRadius: "50%", width: "40px", height: "40px", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>✕</button>
        </div>
      )}

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, var(--green-800), var(--green-900))", padding: "48px 6% 36px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "240px", height: "240px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <p style={{ fontSize: "11px", letterSpacing: "3px", color: "var(--green-400)", fontWeight: "600", textTransform: "uppercase", marginBottom: "10px" }}>ADMIN PANEL</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 3vw, 38px)", fontWeight: "700", color: "white", marginBottom: "6px" }}>Dashboard</h1>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px" }}>Welcome back, {user?.name || user?.username || "Admin"} 👋</p>
      </div>

      <div style={{ padding: "36px 6%" }}>

        {/* TABS */}
        <div style={{ display: "flex", background: "white", borderRadius: "14px", overflow: "hidden", border: "1px solid var(--gray-100)", marginBottom: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflowX: "auto" }}>
          {TABS.map((tab, i) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex: 1, minWidth: "fit-content", padding: "15px 12px", border: "none", borderRight: i < TABS.length - 1 ? "1px solid var(--gray-100)" : "none", background: activeTab === tab.key ? "var(--green-50)" : "white", color: activeTab === tab.key ? "var(--green-700)" : "var(--gray-500)", fontSize: "12px", fontWeight: activeTab === tab.key ? "600" : "400", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", whiteSpace: "nowrap", position: "relative" }}>
              {tab.icon} {tab.label}
              {tab.key === "payments" && pendingPayments.length > 0 && <span style={{ position: "absolute", top: "8px", right: "8px", width: "7px", height: "7px", borderRadius: "50%", background: "#dc2626" }} />}
              {tab.key === "moderation" && moderationAlerts > 0 && <span style={{ position: "absolute", top: "8px", right: "8px", width: "7px", height: "7px", borderRadius: "50%", background: "#d97706" }} />}
              {/* NEW: support dot indicator */}
              {tab.key === "support" && openSupportCount > 0 && <span style={{ position: "absolute", top: "8px", right: "8px", width: "7px", height: "7px", borderRadius: "50%", background: "#0891b2" }} />}
            </button>
          ))}
        </div>

        {/* ---- OVERVIEW TAB ---- */}
        {activeTab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px", marginBottom: "36px" }}>
              {[{ icon: "👥", label: "Total Users", val: stats.totalUsers, color: "#0891b2" }, { icon: "🗺️", label: "Total Tours", val: stats.totalTours, color: "#7c3aed" }, { icon: "📋", label: "Total Bookings", val: stats.totalBookings, color: "#db6b1f" }, { icon: "💰", label: "Total Revenue", val: `Rs. ${Number(stats.totalRevenue).toLocaleString()}`, color: "#16a34a" }].map((s) => (
                <div key={s.label} style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", transition: "all 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"; }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: s.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "14px" }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: "700", color: s.color, marginBottom: "4px" }}>{s.val}</div>
                  <div style={{ fontSize: "13px", color: "var(--gray-400)", fontWeight: "500" }}>{s.label}</div>
                </div>
              ))}
            </div>
            {moderationAlerts > 0 && (
              <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ fontSize: "20px" }}>🛡️</span><div><p style={{ fontSize: "14px", fontWeight: "700", color: "#92400e" }}>{bannedCount > 0 && `${bannedCount} banned`}{bannedCount > 0 && (suspendedCount > 0 || flaggedCount > 0) && " · "}{suspendedCount > 0 && `${suspendedCount} suspended`}{suspendedCount > 0 && flaggedCount > 0 && " · "}{flaggedCount > 0 && `${flaggedCount} flagged`}</p><p style={{ fontSize: "12px", color: "#a16207" }}>Review moderation actions</p></div></div>
                <button onClick={() => setActiveTab("moderation")} style={{ background: "#d97706", color: "white", border: "none", padding: "8px 20px", borderRadius: "50px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Open Moderation →</button>
              </div>
            )}
            {pendingPayments.length > 0 && (
              <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: "12px", padding: "16px 20px", marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ fontSize: "20px" }}>⏳</span><div><p style={{ fontSize: "14px", fontWeight: "700", color: "#92400e" }}>{pendingPayments.length} payment{pendingPayments.length > 1 ? "s" : ""} awaiting verification</p><p style={{ fontSize: "12px", color: "#a16207" }}>Review screenshots and approve or reject bookings</p></div></div>
                <button onClick={() => setActiveTab("payments")} style={{ background: "#ca8a04", color: "white", border: "none", padding: "8px 20px", borderRadius: "50px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Verify Now →</button>
              </div>
            )}
            {/* NEW: Support alert on overview */}
            {openSupportCount > 0 && (
              <div style={{ background: "#e0f2fe", border: "1px solid #bae6fd", borderRadius: "12px", padding: "16px 20px", marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ fontSize: "20px" }}>💬</span><div><p style={{ fontSize: "14px", fontWeight: "700", color: "#0369a1" }}>{openSupportCount} support message{openSupportCount > 1 ? "s" : ""} awaiting reply</p><p style={{ fontSize: "12px", color: "#0284c7" }}>Users are waiting for responses to their contact messages</p></div></div>
                <button onClick={() => setActiveTab("support")} style={{ background: "#0891b2", color: "white", border: "none", padding: "8px 20px", borderRadius: "50px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Reply Now →</button>
              </div>
            )}
            <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--gray-100)" }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: "700", color: "var(--gray-800)" }}>Recent Bookings</h3>
                <button onClick={() => setActiveTab("bookings")} style={{ background: "var(--green-50)", color: "var(--green-700)", border: "1.5px solid var(--green-200)", padding: "7px 16px", borderRadius: "50px", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>View All →</button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Customer", "Tour", "Amount", "Payment", "Status"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                  <tbody>
                    {bookings.slice(0, 5).map((b) => { const status = (b.status || "pending").toLowerCase(); const sc = STATUS_COLORS[status] || STATUS_COLORS.pending; const pm = PAYMENT_METHOD_INFO[b.paymentMethod] || {}; return (<tr key={b._id} onMouseEnter={e => e.currentTarget.style.background = "var(--gray-50)"} onMouseLeave={e => e.currentTarget.style.background = "white"}><td style={tdStyle}>{b.user?.name || "N/A"}</td><td style={tdStyle}>{b.tour?.tourName || "N/A"}</td><td style={{ ...tdStyle, fontWeight: "600", color: "var(--green-700)" }}>Rs. {Number(b.totalPrice || 0).toLocaleString()}</td><td style={tdStyle}>{pm.name ? <span style={{ background: pm.bg, color: pm.color, padding: "2px 10px", borderRadius: "50px", fontSize: "11px", fontWeight: "600" }}>{pm.icon} {pm.name}</span> : "—"}</td><td style={tdStyle}><span style={{ background: sc.bg, color: sc.color, padding: "3px 12px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", textTransform: "capitalize" }}>{status}</span></td></tr>); })}
                    {bookings.length === 0 && <tr><td colSpan="5" style={{ ...tdStyle, textAlign: "center", padding: "40px", color: "var(--gray-400)" }}>No bookings yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---- ANALYTICS TAB ---- */}
        {activeTab === "analytics" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
              <div><h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "4px" }}>📈 Analytics Report</h2><p style={{ fontSize: "13px", color: "var(--gray-400)" }}>Real-time insights from your database.</p></div>
              <button onClick={() => { const report = { generatedAt: new Date().toLocaleString(), totalUsers: stats.totalUsers, totalTours: stats.totalTours, totalBookings: stats.totalBookings, totalRevenue: `Rs. ${stats.totalRevenue.toLocaleString()}`, confirmedBookings: analyticsData.confirmed, pendingBookings: analyticsData.pending, cancelledBookings: analyticsData.cancelled, conversionRate: `${analyticsData.conversionRate}%`, averageRating: analyticsData.avgRating, totalReviews: allReviews.length }; const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `GTP-Analytics-${new Date().toISOString().split("T")[0]}.json`; a.click(); URL.revokeObjectURL(url); }} style={{ background: "var(--green-600)", color: "white", border: "none", padding: "10px 22px", borderRadius: "50px", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px", boxShadow: "0 4px 12px rgba(22,163,74,0.3)" }}>⬇️ Export Report</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              <StatCard icon="📋" label="Total Bookings" value={stats.totalBookings} color="#db6b1f" />
              <StatCard icon="✅" label="Confirmed" value={analyticsData.confirmed} color="#16a34a" sub={`${analyticsData.conversionRate}% conversion`} />
              <StatCard icon="⏳" label="Pending" value={analyticsData.pending} color="#ca8a04" />
              <StatCard icon="❌" label="Cancelled/Rejected" value={analyticsData.cancelled + analyticsData.rejected} color="#dc2626" />
              <StatCard icon="💰" label="Total Revenue" value={`Rs. ${Math.round(stats.totalRevenue / 1000)}K`} color="#16a34a" sub="confirmed bookings" />
              <StatCard icon="⭐" label="Avg Rating" value={analyticsData.avgRating} color="#f59e0b" sub={`${allReviews.length} reviews`} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}><h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "20px" }}>📅 Monthly Bookings</h3>{analyticsData.monthlyBookings.every(d => d.value === 0) ? <div style={{ textAlign: "center", padding: "40px 0", color: "var(--gray-400)" }}>No data yet</div> : <BarChart data={analyticsData.monthlyBookings} color="#db6b1f" height={140} />}</div>
              <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}><h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "4px" }}>💰 Monthly Revenue (Rs. '000)</h3><p style={{ fontSize: "11px", color: "var(--gray-400)", marginBottom: "16px" }}>Confirmed bookings only</p>{analyticsData.monthlyRevenue.every(d => d.value === 0) ? <div style={{ textAlign: "center", padding: "40px 0", color: "var(--gray-400)" }}>No data yet</div> : <BarChart data={analyticsData.monthlyRevenue} color="#16a34a" height={140} />}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}><h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "20px" }}>📋 Booking Status</h3><DonutChart size={140} segments={[{ label: "Confirmed", value: analyticsData.confirmed, color: "#16a34a" }, { label: "Pending", value: analyticsData.pending, color: "#ca8a04" }, { label: "Cancelled", value: analyticsData.cancelled, color: "#dc2626" }, { label: "Rejected", value: analyticsData.rejected, color: "#9ca3af" }].filter(s => s.value > 0)} />{bookings.length === 0 && <p style={{ textAlign: "center", color: "var(--gray-400)", fontSize: "13px" }}>No bookings yet</p>}</div>
              <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}><h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "20px" }}>🗺️ Tour Categories</h3>{analyticsData.categorySegments.length > 0 ? <DonutChart size={140} segments={analyticsData.categorySegments} /> : <p style={{ textAlign: "center", color: "var(--gray-400)", fontSize: "13px", paddingTop: "40px" }}>No tours yet</p>}</div>
              <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}><h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "20px" }}>💳 Payment Methods</h3>{analyticsData.paymentSegments.length > 0 ? <DonutChart size={140} segments={analyticsData.paymentSegments} /> : <p style={{ textAlign: "center", color: "var(--gray-400)", fontSize: "13px", paddingTop: "40px" }}>No payment data</p>}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}><h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "20px" }}>⭐ Rating Distribution</h3>{allReviews.length === 0 ? <div style={{ textAlign: "center", padding: "40px 0", color: "var(--gray-400)" }}>No reviews yet</div> : <BarChart data={analyticsData.ratingDist} color="#f59e0b" height={120} />}</div>
              <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}><h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "20px" }}>🏆 Most Booked Tours</h3>{analyticsData.topTours.length === 0 ? <div style={{ textAlign: "center", padding: "40px 0", color: "var(--gray-400)" }}>No data yet</div> : <BarChart data={analyticsData.topTours} color="#7c3aed" height={120} />}</div>
            </div>
            <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-100)" }}><h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: "700", color: "var(--gray-800)" }}>👑 Top Customers</h3><p style={{ fontSize: "13px", color: "var(--gray-400)", marginTop: "4px" }}>Ranked by number of bookings</p></div>
              {analyticsData.topCustomers.length === 0 ? <div style={{ textAlign: "center", padding: "40px", color: "var(--gray-400)" }}>No customer data yet</div> : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Rank", "Customer", "Bookings", "Total Spent"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                  <tbody>
                    {analyticsData.topCustomers.map((c, i) => (
                      <tr key={i} onMouseEnter={e => e.currentTarget.style.background = "var(--gray-50)"} onMouseLeave={e => e.currentTarget.style.background = "white"}>
                        <td style={tdStyle}><span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "50%", background: i === 0 ? "#fef9c3" : i === 1 ? "#f3f4f6" : i === 2 ? "#fef2f2" : "var(--gray-50)", color: i === 0 ? "#ca8a04" : i === 1 ? "#6b7280" : i === 2 ? "#dc2626" : "var(--gray-400)", fontSize: "13px", fontWeight: "700" }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</span></td>
                        <td style={tdStyle}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--green-600)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "white", flexShrink: 0 }}>{c.name[0]?.toUpperCase()}</div><span style={{ fontWeight: "500", color: "var(--gray-800)" }}>{c.name}</span></div></td>
                        <td style={tdStyle}><span style={{ background: "var(--green-50)", color: "var(--green-700)", padding: "3px 12px", borderRadius: "50px", fontSize: "12px", fontWeight: "600" }}>{c.count} booking{c.count > 1 ? "s" : ""}</span></td>
                        <td style={{ ...tdStyle, fontWeight: "700", color: "#16a34a" }}>Rs. {Number(c.spent).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ---- MODERATION TAB ---- */}
        {activeTab === "moderation" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px", marginBottom: "28px" }}>
              {[{ label: "Total Users", val: users.length, color: "#0891b2", bg: "#e0f2fe", icon: "👥" }, { label: "Active", val: users.filter(u => !u.isBanned && !u.isSuspended && !u.isFlagged).length, color: "#16a34a", bg: "#dcfce7", icon: "✅" }, { label: "Banned", val: bannedCount, color: "#dc2626", bg: "#fee2e2", icon: "🚫" }, { label: "Suspended", val: suspendedCount, color: "#d97706", bg: "#fef9c3", icon: "⏸️" }, { label: "Flagged", val: flaggedCount, color: "#7c3aed", bg: "#ede9fe", icon: "🚩" }, { label: "Admins", val: users.filter(u => u.role === "admin").length, color: "#1d4ed8", bg: "#eff6ff", icon: "👑" }].map(s => (
                <div key={s.label} style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "14px", padding: "18px 16px", textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.04)", cursor: "pointer", transition: "all 0.2s" }}
                  onClick={() => setModFilter(s.label.toLowerCase().replace(" users", "").replace("total", "all"))}
                  onMouseEnter={e => { e.currentTarget.style.background = s.bg; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ fontSize: "24px", marginBottom: "6px" }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: "700", color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: "11px", color: "var(--gray-400)", fontWeight: "500", marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid var(--gray-100)", padding: "18px 20px", marginBottom: "20px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <input type="text" placeholder="🔍 Search by name or email..." value={modSearch} onChange={e => setModSearch(e.target.value)} style={{ flex: 1, minWidth: "200px", padding: "9px 14px", border: "1.5px solid var(--gray-200)", borderRadius: "50px", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", outline: "none", color: "var(--gray-700)" }} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "var(--gray-200)"} />
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {[{ key: "all", label: "All" }, { key: "active", label: "✅ Active" }, { key: "banned", label: "🚫 Banned" }, { key: "suspended", label: "⏸️ Suspended" }, { key: "flagged", label: "🚩 Flagged" }, { key: "admin", label: "👑 Admins" }].map(f => (
                  <button key={f.key} onClick={() => setModFilter(f.key)} style={{ padding: "7px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", border: modFilter === f.key ? "2px solid #16a34a" : "1.5px solid var(--gray-200)", background: modFilter === f.key ? "#f0fdf4" : "white", color: modFilter === f.key ? "#16a34a" : "var(--gray-600)", cursor: "pointer", transition: "all 0.15s" }}>{f.label}</button>
                ))}
              </div>
            </div>
            {filteredForModeration.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", background: "white", borderRadius: "16px", border: "1px solid var(--gray-100)" }}><div style={{ fontSize: "48px", marginBottom: "12px" }}>👥</div><p style={{ color: "var(--gray-400)", fontSize: "15px" }}>No users match your filter.</p></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {filteredForModeration.map(u => {
                  const status = getUserStatus(u); const isCurrentAdmin = u._id === user?._id;
                  const suspEndDate = u.suspendedUntil ? new Date(u.suspendedUntil) : null;
                  const isSuspActive = u.isSuspended && suspEndDate && suspEndDate > new Date();
                  return (
                    <div key={u._id} style={{ background: "white", border: `1px solid ${u.isBanned ? "#fecaca" : u.isSuspended ? "#fde68a" : u.isFlagged ? "#ddd6fe" : "var(--gray-100)"}`, borderRadius: "14px", padding: "20px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", opacity: u.isBanned ? 0.85 : 1, transition: "box-shadow 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"} onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", flex: 1, minWidth: "200px" }}>
                          <div style={{ width: "46px", height: "46px", borderRadius: "50%", flexShrink: 0, background: u.isBanned ? "#dc2626" : u.role === "admin" ? "#1d4ed8" : "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "700", color: "white" }}>{(u.name || "U")[0].toUpperCase()}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "3px" }}>
                              <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--gray-800)" }}>{u.name}{isCurrentAdmin && <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "400", marginLeft: "6px" }}>(you)</span>}</span>
                              <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 9px", borderRadius: "50px", background: status.bg, color: status.color }}>{status.icon} {status.label}</span>
                              {u.isFlagged && !u.isBanned && <span style={{ fontSize: "11px", fontWeight: "600", padding: "2px 9px", borderRadius: "50px", background: "#ede9fe", color: "#7c3aed" }}>🚩 Flagged</span>}
                            </div>
                            <p style={{ fontSize: "12px", color: "var(--gray-500)", marginBottom: "3px" }}>✉️ {u.email}</p>
                            {u.phone && <p style={{ fontSize: "12px", color: "var(--gray-400)" }}>📞 {u.phone}</p>}
                            <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                              {u.isBanned && <p style={{ fontSize: "12px", color: "#dc2626", background: "#fef2f2", padding: "4px 10px", borderRadius: "6px", display: "inline-block" }}>🚫 Ban reason: {u.banReason || "Not specified"}</p>}
                              {isSuspActive && <p style={{ fontSize: "12px", color: "#d97706", background: "#fef9c3", padding: "4px 10px", borderRadius: "6px", display: "inline-block" }}>⏸️ Suspended until {suspEndDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} — {u.suspendReason || "Not specified"}</p>}
                              {u.isFlagged && <p style={{ fontSize: "12px", color: "#7c3aed", background: "#ede9fe", padding: "4px 10px", borderRadius: "6px", display: "inline-block" }}>🚩 Flag reason: {u.flagReason || "Not specified"}</p>}
                              {u.moderationNotes && <p style={{ fontSize: "12px", color: "#0891b2", background: "#e0f2fe", padding: "4px 10px", borderRadius: "6px", display: "inline-block" }}>📝 Note: {u.moderationNotes}</p>}
                            </div>
                          </div>
                        </div>
                        {!isCurrentAdmin ? (
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "flex-start", flexShrink: 0 }}>
                            {u.isBanned ? <button onClick={() => setModAction({ user: u, action: "unban" })} style={{ background: "#dcfce7", color: "#16a34a", border: "1.5px solid #86efac", padding: "6px 13px", borderRadius: "50px", fontSize: "11px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}>✅ Unban</button> : <button onClick={() => setModAction({ user: u, action: "ban" })} style={{ background: "#fef2f2", color: "#dc2626", border: "1.5px solid #fecaca", padding: "6px 13px", borderRadius: "50px", fontSize: "11px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "white"; }} onMouseLeave={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#dc2626"; }}>🚫 Ban</button>}
                            {isSuspActive ? <button onClick={() => setModAction({ user: u, action: "unsuspend" })} style={{ background: "#dcfce7", color: "#16a34a", border: "1.5px solid #86efac", padding: "6px 13px", borderRadius: "50px", fontSize: "11px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}>▶️ Unsuspend</button> : !u.isBanned && <button onClick={() => setModAction({ user: u, action: "suspend" })} style={{ background: "#fef9c3", color: "#d97706", border: "1.5px solid #fde68a", padding: "6px 13px", borderRadius: "50px", fontSize: "11px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.background = "#d97706"; e.currentTarget.style.color = "white"; }} onMouseLeave={e => { e.currentTarget.style.background = "#fef9c3"; e.currentTarget.style.color = "#d97706"; }}>⏸️ Suspend</button>}
                            {u.isFlagged ? <button onClick={() => setModAction({ user: u, action: "unflag" })} style={{ background: "#dcfce7", color: "#16a34a", border: "1.5px solid #86efac", padding: "6px 13px", borderRadius: "50px", fontSize: "11px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}>✅ Unflag</button> : <button onClick={() => setModAction({ user: u, action: "flag" })} style={{ background: "#ede9fe", color: "#7c3aed", border: "1.5px solid #ddd6fe", padding: "6px 13px", borderRadius: "50px", fontSize: "11px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.background = "#7c3aed"; e.currentTarget.style.color = "white"; }} onMouseLeave={e => { e.currentTarget.style.background = "#ede9fe"; e.currentTarget.style.color = "#7c3aed"; }}>🚩 Flag</button>}
                            <button onClick={() => setModAction({ user: u, action: "role" })} style={{ background: "#eff6ff", color: "#1d4ed8", border: "1.5px solid #bfdbfe", padding: "6px 13px", borderRadius: "50px", fontSize: "11px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.color = "white"; }} onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#1d4ed8"; }}>👑 Role</button>
                            {(u.isBanned || u.isSuspended || u.isFlagged) && <button onClick={() => setModAction({ user: u, action: "reset" })} style={{ background: "#f0fdf4", color: "#16a34a", border: "1.5px solid #bbf7d0", padding: "6px 13px", borderRadius: "50px", fontSize: "11px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}>🔓 Reset</button>}
                            <button onClick={() => setModAction({ user: u, action: "notes" })} style={{ background: "#e0f2fe", color: "#0891b2", border: "1.5px solid #bae6fd", padding: "6px 13px", borderRadius: "50px", fontSize: "11px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}>📝 Notes</button>
                            <button onClick={() => setModAction({ user: u, action: "delete" })} style={{ background: "none", color: "#9ca3af", border: "1.5px solid #e5e7eb", padding: "6px 13px", borderRadius: "50px", fontSize: "11px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "#dc2626"; }} onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.borderColor = "#e5e7eb"; }}>🗑️ Delete</button>
                          </div>
                        ) : <span style={{ fontSize: "12px", color: "var(--gray-400)", fontStyle: "italic", alignSelf: "center" }}>Your account — protected</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ---- PAYMENTS TAB ---- */}
        {activeTab === "payments" && (
          <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-100)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div><h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "4px" }}>Payment Verification</h3><p style={{ fontSize: "13px", color: "var(--gray-400)" }}>Review payment screenshots and approve or reject bookings.</p></div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ background: "#fef9c3", color: "#92400e", padding: "5px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", border: "1px solid #fde68a" }}>⏳ {pendingPayments.length} pending</span>
                <span style={{ background: "#dcfce7", color: "#16a34a", padding: "5px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", border: "1px solid #86efac" }}>✅ {bookings.filter(b => b.paymentStatus === "Verified").length} verified</span>
              </div>
            </div>
            {bookings.filter(b => b.transactionId).length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}><div style={{ fontSize: "48px", marginBottom: "12px" }}>💳</div><p style={{ color: "var(--gray-400)", fontSize: "15px" }}>No payment bookings yet.</p></div>
            ) : (
              <div>
                {bookings.filter(b => b.transactionId).map((b, i, arr) => {
                  const isPending  = (b.paymentStatus || "").toLowerCase() === "pending";
                  const isVerified = (b.paymentStatus || "").toLowerCase() === "verified";
                  const isRejected = (b.paymentStatus || "").toLowerCase() === "rejected";
                  const pm = PAYMENT_METHOD_INFO[b.paymentMethod] || { name: b.paymentMethod, color: "#6b7280", bg: "#f9fafb", icon: "💳" };
                  return (
                    <div key={b._id} style={{ padding: "24px", borderBottom: i < arr.length - 1 ? "1px solid var(--gray-50)" : "none", opacity: isRejected ? 0.65 : 1, transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--gray-50)"} onMouseLeave={e => e.currentTarget.style.background = "white"}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                            <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: "700", color: "var(--gray-800)" }}>{b.tour?.tourName || "Tour"}</h4>
                            <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 10px", borderRadius: "50px", background: isPending ? "#fef9c3" : isVerified ? "#dcfce7" : "#fee2e2", color: isPending ? "#92400e" : isVerified ? "#16a34a" : "#dc2626" }}>{isPending ? "⏳ Pending" : isVerified ? "✅ Verified" : "❌ Rejected"}</span>
                          </div>
                          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "12px", color: "var(--gray-500)" }}>👤 {b.user?.name || "N/A"}</span>
                            <span style={{ fontSize: "12px", color: "var(--gray-500)" }}>✉️ {b.user?.email || "N/A"}</span>
                            <span style={{ fontSize: "12px", color: "var(--gray-500)" }}>👥 {b.numberOfPeople || 1} guest{(b.numberOfPeople || 1) > 1 ? "s" : ""}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "#16a34a" }}>Rs. {Number(b.totalPrice || 0).toLocaleString()}</div>
                          <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 10px", borderRadius: "50px", background: pm.bg, color: pm.color, display: "inline-block", marginTop: "4px" }}>{pm.icon} {pm.name}</span>
                        </div>
                      </div>
                      <div style={{ background: "var(--gray-50)", borderRadius: "10px", padding: "14px 16px", marginBottom: "16px", display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center", border: "1px solid var(--gray-100)" }}>
                        <div><p style={{ fontSize: "11px", color: "var(--gray-400)", marginBottom: "2px" }}>Transaction ID</p><p style={{ fontSize: "15px", fontWeight: "700", color: "var(--gray-800)" }}>{b.transactionId}</p></div>
                        {b.paymentScreenshot && (<div><p style={{ fontSize: "11px", color: "var(--gray-400)", marginBottom: "4px" }}>Screenshot</p><img src={b.paymentScreenshot} alt="Payment proof" onClick={() => setPreviewScreenshot(b.paymentScreenshot)} style={{ width: "90px", height: "66px", objectFit: "cover", borderRadius: "8px", border: "2px solid var(--gray-200)", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => { e.target.style.borderColor = "#16a34a"; e.target.style.transform = "scale(1.05)"; }} onMouseLeave={e => { e.target.style.borderColor = "var(--gray-200)"; e.target.style.transform = "scale(1)"; }} title="Click to enlarge" /></div>)}
                        {b.adminNote && <div><p style={{ fontSize: "11px", color: "var(--gray-400)", marginBottom: "2px" }}>Admin Note</p><p style={{ fontSize: "13px", color: "var(--gray-700)" }}>{b.adminNote}</p></div>}
                      </div>
                      {isPending && (
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                          <input type="text" placeholder="Add a note (optional)..." value={noteTarget === b._id ? adminNote : ""} onChange={e => { setNoteTarget(b._id); setAdminNote(e.target.value); }} onFocus={() => setNoteTarget(b._id)} style={{ flex: 1, minWidth: "200px", padding: "9px 14px", border: "1.5px solid var(--gray-200)", borderRadius: "50px", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", outline: "none", color: "var(--gray-700)" }} />
                          <button onClick={() => verifyPayment(b._id, "approve")} disabled={verifyingId === b._id} style={{ background: verifyingId === b._id ? "#86efac" : "#16a34a", color: "white", border: "none", padding: "10px 22px", borderRadius: "50px", fontSize: "13px", fontWeight: "600", cursor: verifyingId === b._id ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>{verifyingId === b._id ? "Processing..." : "✅ Approve"}</button>
                          <button onClick={() => verifyPayment(b._id, "reject")} disabled={verifyingId === b._id} style={{ background: "none", color: "#dc2626", border: "1.5px solid #fecaca", padding: "10px 22px", borderRadius: "50px", fontSize: "13px", fontWeight: "600", cursor: verifyingId === b._id ? "not-allowed" : "pointer", whiteSpace: "nowrap" }} onMouseEnter={e => { if (verifyingId !== b._id) { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "white"; } }} onMouseLeave={e => { if (verifyingId !== b._id) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#dc2626"; } }}>❌ Reject</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ---- USERS TAB ---- */}
        {activeTab === "users" && (
          <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: "700", color: "var(--gray-800)" }}>All Users</h3>
              <span style={{ background: "var(--green-50)", color: "var(--green-700)", padding: "5px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "600" }}>{users.length} total</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Name", "Email", "Role", "Joined", "Actions"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                  {users.length === 0 ? <tr><td colSpan="5" style={{ ...tdStyle, textAlign: "center", padding: "40px", color: "var(--gray-400)" }}>No users found</td></tr>
                  : users.map((u) => (
                    <tr key={u._id} onMouseEnter={e => e.currentTarget.style.background = "var(--gray-50)"} onMouseLeave={e => e.currentTarget.style.background = "white"}>
                      <td style={tdStyle}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ width: "32px", height: "32px", borderRadius: "50%", background: u.role === "admin" ? "#d97706" : "var(--green-600)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "white", flexShrink: 0 }}>{(u.name || "U")[0].toUpperCase()}</div><span style={{ fontWeight: "500", color: "var(--gray-800)" }}>{u.name}</span></div></td>
                      <td style={{ ...tdStyle, color: "var(--gray-500)" }}>{u.email}</td>
                      <td style={tdStyle}><span style={{ background: u.role === "admin" ? "#fef3c7" : "var(--gray-100)", color: u.role === "admin" ? "#d97706" : "var(--gray-600)", padding: "3px 12px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", textTransform: "capitalize" }}>{u.role || "traveler"}</span></td>
                      <td style={{ ...tdStyle, color: "var(--gray-500)" }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}</td>
                      <td style={tdStyle}><button onClick={() => deleteUser(u._id)} disabled={deletingId === u._id || u.role === "admin"} style={{ background: "none", color: u.role === "admin" ? "var(--gray-300)" : "#dc2626", border: `1.5px solid ${u.role === "admin" ? "var(--gray-200)" : "#fecaca"}`, padding: "5px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "500", cursor: u.role === "admin" ? "not-allowed" : "pointer" }}>{deletingId === u._id ? "Deleting..." : u.role === "admin" ? "Protected" : "Delete"}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---- TOURS TAB ---- */}
        {activeTab === "tours" && (
          <div>
            <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-100)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div><h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "4px" }}>All Tours</h3><p style={{ fontSize: "13px", color: "var(--gray-400)" }}>{tours.length} tour{tours.length !== 1 ? "s" : ""} · Add, edit or delete directly</p></div>
                <button onClick={openAddTour} style={{ background: "#16a34a", color: "white", border: "none", padding: "10px 22px", borderRadius: "50px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(22,163,74,0.3)", display: "flex", alignItems: "center", gap: "7px" }} onMouseEnter={e => { e.currentTarget.style.background = "#15803d"; e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseLeave={e => { e.currentTarget.style.background = "#16a34a"; e.currentTarget.style.transform = "translateY(0)"; }}>🌿 Add New Tour</button>
              </div>
              {tours.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}><div style={{ fontSize: "52px", marginBottom: "14px" }}>🗺️</div><h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "var(--gray-800)", marginBottom: "8px" }}>No tours yet</h3><button onClick={openAddTour} style={{ background: "#16a34a", color: "white", border: "none", padding: "12px 28px", borderRadius: "50px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>🌿 Add New Tour</button></div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr>{["Tour", "Location", "Category", "Price", "Seats", "360°", "Actions"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                    <tbody>
                      {tours.map((t) => (
                        <tr key={t._id} onMouseEnter={e => e.currentTarget.style.background = "var(--gray-50)"} onMouseLeave={e => e.currentTarget.style.background = "white"}>
                          <td style={tdStyle}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}>{(t.images?.[0] || t.photo) && <img src={t.images?.[0] || t.photo} alt={t.tourName} style={{ width: "44px", height: "36px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }} />}<div><p style={{ fontWeight: "600", color: "var(--gray-800)", fontSize: "13px" }}>{t.tourName || t.title || t.name}</p>{t.duration && <p style={{ fontSize: "11px", color: "var(--gray-400)", marginTop: "1px" }}>🕐 {t.duration}</p>}</div></div></td>
                          <td style={{ ...tdStyle, color: "var(--gray-500)" }}>📍 {t.location || "N/A"}</td>
                          <td style={tdStyle}><span style={{ background: "var(--green-50)", color: "var(--green-700)", padding: "3px 12px", borderRadius: "50px", fontSize: "12px", fontWeight: "600" }}>{t.category || "Tour"}</span></td>
                          <td style={{ ...tdStyle, fontWeight: "700", color: "#16a34a" }}>Rs. {Number(t.price || 0).toLocaleString()}</td>
                          <td style={{ ...tdStyle, textAlign: "center" }}><span style={{ fontSize: "12px", fontWeight: "600", color: (t.availableSeats || 0) <= 5 ? "#dc2626" : "var(--gray-600)" }}>{t.availableSeats ?? "—"}</span></td>
                          <td style={{ ...tdStyle, textAlign: "center" }}>{t.virtualTourScenes?.filter(s => s.imageUrl).length > 0 ? <span style={{ fontSize: "11px", background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: "50px", fontWeight: "600" }}>🌐 {t.virtualTourScenes.filter(s => s.imageUrl).length}</span> : <span style={{ fontSize: "11px", color: "var(--gray-300)" }}>—</span>}</td>
                          <td style={tdStyle}><div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            <Link to={`/tours/${t._id}`} target="_blank" style={{ background: "var(--green-50)", color: "var(--green-700)", border: "1.5px solid var(--green-200)", padding: "5px 10px", borderRadius: "50px", fontSize: "11px", fontWeight: "500", textDecoration: "none", whiteSpace: "nowrap" }}>👁️ View</Link>
                            <button onClick={() => openEditTour(t)} style={{ background: "#eff6ff", color: "#1d4ed8", border: "1.5px solid #bfdbfe", padding: "5px 10px", borderRadius: "50px", fontSize: "11px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }} onMouseEnter={e => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.color = "white"; }} onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#1d4ed8"; }}>✏️ Edit</button>
                            <button onClick={() => deleteTour(t._id)} disabled={deletingId === t._id} style={{ background: deletingId === t._id ? "var(--gray-100)" : "#fef2f2", color: deletingId === t._id ? "var(--gray-400)" : "#dc2626", border: `1.5px solid ${deletingId === t._id ? "var(--gray-200)" : "#fecaca"}`, padding: "5px 10px", borderRadius: "50px", fontSize: "11px", fontWeight: "600", cursor: deletingId === t._id ? "not-allowed" : "pointer", whiteSpace: "nowrap" }} onMouseEnter={e => { if (deletingId !== t._id) { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "white"; } }} onMouseLeave={e => { if (deletingId !== t._id) { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#dc2626"; } }}>{deletingId === t._id ? "..." : "🗑️ Delete"}</button>
                          </div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---- BOOKINGS TAB ---- */}
        {activeTab === "bookings" && (
          <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: "700", color: "var(--gray-800)" }}>All Bookings</h3>
              <span style={{ background: "var(--green-50)", color: "var(--green-700)", padding: "5px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "600" }}>{bookings.length} total</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["Customer", "Tour", "Travel Date", "Guests", "Amount", "Payment", "Status", "Update"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                  {bookings.length === 0 ? <tr><td colSpan="8" style={{ ...tdStyle, textAlign: "center", padding: "40px", color: "var(--gray-400)" }}>No bookings yet</td></tr>
                  : bookings.map((b) => {
                    const status = (b.status || "pending").toLowerCase(); const sc = STATUS_COLORS[status] || STATUS_COLORS.pending; const pm = PAYMENT_METHOD_INFO[b.paymentMethod] || {};
                    return (
                      <tr key={b._id} onMouseEnter={e => e.currentTarget.style.background = "var(--gray-50)"} onMouseLeave={e => e.currentTarget.style.background = "white"}>
                        <td style={tdStyle}>{b.user?.name || "N/A"}</td>
                        <td style={{ ...tdStyle, maxWidth: "140px" }}><span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.tour?.tourName || "N/A"}</span></td>
                        <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{b.travelDate ? new Date(b.travelDate).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}</td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>{b.numberOfPeople || 1}</td>
                        <td style={{ ...tdStyle, fontWeight: "600", color: "var(--green-700)", whiteSpace: "nowrap" }}>Rs. {Number(b.totalPrice || 0).toLocaleString()}</td>
                        <td style={tdStyle}>{pm.name ? <span style={{ background: pm.bg, color: pm.color, padding: "2px 10px", borderRadius: "50px", fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap" }}>{pm.icon} {pm.name}</span> : <span style={{ color: "var(--gray-300)" }}>—</span>}</td>
                        <td style={tdStyle}><span style={{ background: sc.bg, color: sc.color, padding: "3px 12px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", textTransform: "capitalize", whiteSpace: "nowrap" }}>{status}</span></td>
                        <td style={tdStyle}><select value={b.status || "Pending"} onChange={e => updateBookingStatus(b._id, e.target.value)} style={{ padding: "5px 10px", border: "1.5px solid var(--gray-200)", borderRadius: "8px", fontSize: "12px", fontFamily: "'DM Sans', sans-serif", color: "var(--gray-700)", background: "white", cursor: "pointer", outline: "none" }}><option value="Pending">Pending</option><option value="Confirmed">Confirmed</option><option value="Cancelled">Cancelled</option><option value="Rejected">Rejected</option></select></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---- REVIEWS TAB ---- */}
        {activeTab === "reviews" && (
          <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--gray-100)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div><h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "4px" }}>All Reviews</h3><p style={{ fontSize: "13px", color: "var(--gray-400)" }}>Delete reviews or block users from submitting new ones.</p></div>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ background: "var(--green-50)", color: "var(--green-700)", padding: "5px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "600" }}>{allReviews.length} reviews</span>
                {blockedUsers.length > 0 && <span style={{ background: "#fee2e2", color: "#dc2626", padding: "5px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "600" }}>{blockedUsers.length} blocked</span>}
              </div>
            </div>
            {allReviews.length === 0 ? <div style={{ textAlign: "center", padding: "60px 0" }}><div style={{ fontSize: "48px", marginBottom: "12px" }}>⭐</div><p style={{ color: "var(--gray-400)", fontSize: "15px" }}>No reviews yet.</p></div>
            : allReviews.map((review, i) => {
              const userId = review.userId?._id || review.user || review.userId; const userName = review.userId?.name || review.userName || "Unknown";
              const tourName = review.tourId?.tourName || review.tourId?.title || review.tourName || "N/A";
              const isBlocked = blockedUsers.includes(userId); const rating = review.rating || 5;
              return (
                <div key={review._id} style={{ padding: "22px 24px", borderBottom: i < allReviews.length - 1 ? "1px solid var(--gray-50)" : "none", display: "grid", gridTemplateColumns: "1fr auto", gap: "20px", alignItems: "start", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--gray-50)"} onMouseLeave={e => e.currentTarget.style.background = "white"}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                      <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: isBlocked ? "#dc2626" : "var(--green-600)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "white", flexShrink: 0 }}>{userName[0]?.toUpperCase()}</div>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--gray-800)" }}>{userName}</span>
                      {isBlocked && <span style={{ fontSize: "11px", fontWeight: "600", background: "#fee2e2", color: "#dc2626", padding: "2px 8px", borderRadius: "50px" }}>🚫 Blocked</span>}
                      <span style={{ fontSize: "13px", color: "#f59e0b", letterSpacing: "1px" }}>{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>
                    </div>
                    <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--green-600)", marginBottom: "6px" }}>🌿 {tourName}</p>
                    <p style={{ fontSize: "14px", color: "var(--gray-600)", lineHeight: "1.75", fontStyle: "italic", marginBottom: "6px" }}>"{review.comment}"</p>
                    <p style={{ fontSize: "12px", color: "var(--gray-400)" }}>{review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                    <button onClick={() => deleteReview(review._id)} disabled={deletingId === review._id} style={{ background: deletingId === review._id ? "var(--gray-100)" : "#fef2f2", color: deletingId === review._id ? "var(--gray-400)" : "#dc2626", border: `1.5px solid ${deletingId === review._id ? "var(--gray-200)" : "#fecaca"}`, padding: "7px 16px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", cursor: deletingId === review._id ? "not-allowed" : "pointer", whiteSpace: "nowrap" }} onMouseEnter={e => { if (deletingId !== review._id) { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "white"; } }} onMouseLeave={e => { if (deletingId !== review._id) { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#dc2626"; } }}>{deletingId === review._id ? "..." : "🗑️ Delete"}</button>
                    <button onClick={() => toggleBlockUser(userId, userName)} style={{ background: isBlocked ? "#dcfce7" : "#fef9c3", color: isBlocked ? "#16a34a" : "#ca8a04", border: `1.5px solid ${isBlocked ? "#86efac" : "#fde68a"}`, padding: "7px 16px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}>{isBlocked ? "✅ Unblock" : "🚫 Block"}</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ---- KNOWLEDGE BASE TAB ---- */}
        {activeTab === "kb" && (
          <div>
            <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", padding: "24px 28px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "4px" }}>🧠 Chatbot Knowledge Base</h3>
                  <p style={{ fontSize: "13px", color: "var(--gray-400)" }}>Every entry you add here is injected into the chatbot's context automatically. Changes take effect immediately — no restart needed.</p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "5px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "600" }}>{kb.length} entries</span>
                  <button onClick={fetchKB} style={{ background: "var(--gray-50)", color: "var(--gray-600)", border: "1px solid var(--gray-200)", padding: "5px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>🔄 Refresh</button>
                </div>
              </div>
              {kbMsg && (
                <div style={{ background: kbMsg.startsWith("✅") ? "#f0fdf4" : "#fef2f2", border: `1px solid ${kbMsg.startsWith("✅") ? "#bbf7d0" : "#fecaca"}`, color: kbMsg.startsWith("✅") ? "#16a34a" : "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                  {kbMsg}
                </div>
              )}
              <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "20px", border: "1px solid var(--gray-100)" }}>
                <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--gray-700)", marginBottom: "14px" }}>➕ Add New FAQ Entry</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={labelBase}>Question</label>
                    <input type="text" value={kbNewQ} onChange={e => setKbNewQ(e.target.value)} placeholder="e.g. What documents do I need for a tour?" style={inputBase} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
                  </div>
                  <div>
                    <label style={labelBase}>Answer</label>
                    <textarea value={kbNewA} onChange={e => setKbNewA(e.target.value)} placeholder="e.g. You only need a valid CNIC or passport..." rows={3} style={{ ...inputBase, resize: "vertical", lineHeight: "1.6" }} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
                  </div>
                  <button disabled={kbSaving || !kbNewQ.trim() || !kbNewA.trim()} onClick={kbAddEntry}
                    style={{ alignSelf: "flex-start", background: kbSaving || !kbNewQ.trim() || !kbNewA.trim() ? "#e5e7eb" : "#16a34a", color: kbSaving || !kbNewQ.trim() || !kbNewA.trim() ? "#9ca3af" : "white", border: "none", padding: "10px 24px", borderRadius: "50px", fontSize: "13px", fontWeight: "600", cursor: kbSaving || !kbNewQ.trim() || !kbNewA.trim() ? "not-allowed" : "pointer" }}>
                    {kbSaving ? "Adding..." : "➕ Add Entry"}
                  </button>
                </div>
              </div>
            </div>
            {kbLoading ? (
              <div style={{ textAlign: "center", padding: "40px", background: "white", borderRadius: "16px", border: "1px solid var(--gray-100)" }}>
                <div style={{ width: "32px", height: "32px", border: "3px solid var(--green-100)", borderTop: "3px solid var(--green-500)", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
                <p style={{ color: "var(--gray-400)" }}>Loading knowledge base...</p>
              </div>
            ) : kb.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", background: "white", borderRadius: "16px", border: "1px solid var(--gray-100)" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🧠</div>
                <p style={{ color: "var(--gray-400)", fontSize: "15px" }}>No FAQ entries yet. Add your first one above.</p>
                <p style={{ color: "var(--gray-300)", fontSize: "13px", marginTop: "8px" }}>The chatbot has built-in defaults — add more to customize it.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {kb.map((entry, index) => (
                  <div key={index} style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "14px", padding: "20px 22px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)", transition: "box-shadow 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"} onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.04)"}>
                    {kbEditIndex === index ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div>
                          <label style={labelBase}>Question</label>
                          <input type="text" value={kbEditQ} onChange={e => setKbEditQ(e.target.value)} style={{ ...inputBase, borderColor: "#16a34a" }} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "#16a34a"} />
                        </div>
                        <div>
                          <label style={labelBase}>Answer</label>
                          <textarea value={kbEditA} onChange={e => setKbEditA(e.target.value)} rows={3} style={{ ...inputBase, resize: "vertical", lineHeight: "1.6", borderColor: "#16a34a" }} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "#16a34a"} />
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => kbUpdateEntry(index)} disabled={kbSaving} style={{ background: kbSaving ? "#86efac" : "#16a34a", color: "white", border: "none", padding: "8px 20px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", cursor: kbSaving ? "not-allowed" : "pointer" }}>{kbSaving ? "Saving..." : "💾 Save"}</button>
                          <button onClick={() => setKbEditIndex(null)} style={{ background: "var(--gray-100)", color: "var(--gray-600)", border: "none", padding: "8px 18px", borderRadius: "50px", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                            <span style={{ fontSize: "14px", fontWeight: "700", color: "#16a34a", flexShrink: 0, marginTop: "1px" }}>Q</span>
                            <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--gray-800)", lineHeight: "1.5" }}>{entry.q}</p>
                          </div>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                            <span style={{ fontSize: "14px", fontWeight: "700", color: "#0891b2", flexShrink: 0, marginTop: "1px" }}>A</span>
                            <p style={{ fontSize: "13px", color: "var(--gray-600)", lineHeight: "1.7" }}>{entry.a}</p>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                          <button onClick={() => { setKbEditIndex(index); setKbEditQ(entry.q); setKbEditA(entry.a); }} style={{ background: "#eff6ff", color: "#1d4ed8", border: "1.5px solid #bfdbfe", padding: "5px 12px", borderRadius: "50px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }} onMouseEnter={e => { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.color = "white"; }} onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#1d4ed8"; }}>✏️ Edit</button>
                          <button onClick={() => kbDeleteEntry(index)} style={{ background: "#fef2f2", color: "#dc2626", border: "1.5px solid #fecaca", padding: "5px 12px", borderRadius: "50px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }} onMouseEnter={e => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "white"; }} onMouseLeave={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#dc2626"; }}>🗑️ Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---- AI MODEL TAB ---- */}
        {activeTab === "ai" && (
          <div>
            <div style={{ background: "linear-gradient(135deg, #14532d, #052e16)", borderRadius: "16px", padding: "28px 32px", marginBottom: "24px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
              <p style={{ fontSize: "11px", letterSpacing: "3px", color: "#4ade80", fontWeight: "600", textTransform: "uppercase", marginBottom: "8px" }}>AI CONFIGURATION</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "white", marginBottom: "6px" }}>🤖 AI Model Settings</h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "13px" }}>Configure which Llama model powers your chatbot and test it live. Changes here affect the chatbot for all users immediately.</p>
            </div>
            {aiMsg && (
              <div style={{ background: aiMsg.startsWith("✅") ? "#f0fdf4" : "#fef2f2", border: `1px solid ${aiMsg.startsWith("✅") ? "#bbf7d0" : "#fecaca"}`, color: aiMsg.startsWith("✅") ? "#16a34a" : "#dc2626", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", marginBottom: "20px", fontWeight: "500" }}>
                {aiMsg}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "6px" }}>🧬 Select Model</h3>
                <p style={{ fontSize: "12px", color: "var(--gray-400)", marginBottom: "20px" }}>All models run on Groq — free and fast. Select based on your needs.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {GROQ_MODELS.map(m => (
                    <div key={m.id} onClick={() => setAiModel(m.id)} style={{ padding: "14px 16px", borderRadius: "12px", border: aiModel === m.id ? "2px solid #16a34a" : "1.5px solid #e5e7eb", background: aiModel === m.id ? "#f0fdf4" : "white", cursor: "pointer", transition: "all 0.15s" }}
                      onMouseEnter={e => { if (aiModel !== m.id) e.currentTarget.style.borderColor = "#bbf7d0"; }}
                      onMouseLeave={e => { if (aiModel !== m.id) e.currentTarget.style.borderColor = "#e5e7eb"; }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: `2px solid ${aiModel === m.id ? "#16a34a" : "#e5e7eb"}`, background: aiModel === m.id ? "#16a34a" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {aiModel === m.id && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white" }} />}
                          </div>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: aiModel === m.id ? "#16a34a" : "var(--gray-800)" }}>{m.label}</span>
                        </div>
                        <span style={{ fontSize: "10px", fontWeight: "600", padding: "2px 8px", borderRadius: "50px", background: aiModel === m.id ? "#dcfce7" : "var(--gray-100)", color: aiModel === m.id ? "#16a34a" : "var(--gray-500)" }}>{m.badge}</span>
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--gray-400)", marginLeft: "24px" }}>{m.desc}</p>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "16px", padding: "12px 14px", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                  <p style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600" }}>Currently active: {GROQ_MODELS.find(m => m.id === aiModel)?.label || aiModel}</p>
                  <p style={{ fontSize: "11px", color: "#4ade80", marginTop: "2px" }}>⚠️ Note: To permanently change the model, update <code style={{ background: "#dcfce7", padding: "1px 4px", borderRadius: "3px" }}>chatController.js</code> model field. This selector shows your preference.</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", padding: "22px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "4px" }}>🌡️ Temperature: <span style={{ color: "#16a34a" }}>{aiTemp}</span></h3>
                  <p style={{ fontSize: "12px", color: "var(--gray-400)", marginBottom: "14px" }}>Lower = more focused. Higher = more creative. Recommended: 0.6–0.8</p>
                  <input type="range" min="0" max="1" step="0.1" value={aiTemp} onChange={e => setAiTemp(parseFloat(e.target.value))} style={{ width: "100%", accentColor: "#16a34a", height: "6px", cursor: "pointer" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                    <span style={{ fontSize: "11px", color: "var(--gray-400)" }}>0.0 — Precise</span>
                    <span style={{ fontSize: "11px", color: "var(--gray-400)" }}>1.0 — Creative</span>
                  </div>
                </div>
                <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", padding: "22px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "4px" }}>📏 Max Response Length: <span style={{ color: "#16a34a" }}>{aiMaxTokens} tokens</span></h3>
                  <p style={{ fontSize: "12px", color: "var(--gray-400)", marginBottom: "14px" }}>~{Math.round(aiMaxTokens * 0.75)} words. 300–600 is ideal for chat.</p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {[200, 300, 500, 700, 1000].map(v => (
                      <button key={v} onClick={() => setAiMaxTokens(v)} style={{ padding: "7px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", border: aiMaxTokens === v ? "2px solid #16a34a" : "1.5px solid #e5e7eb", background: aiMaxTokens === v ? "#f0fdf4" : "white", color: aiMaxTokens === v ? "#16a34a" : "var(--gray-600)", cursor: "pointer" }}>{v}</button>
                    ))}
                  </div>
                </div>
                <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", padding: "22px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "14px" }}>📋 Current Config</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[{ label: "Model", val: GROQ_MODELS.find(m => m.id === aiModel)?.label || aiModel }, { label: "Temperature", val: aiTemp }, { label: "Max Tokens", val: `${aiMaxTokens} (~${Math.round(aiMaxTokens * 0.75)} words)` }, { label: "KB Entries", val: `${kb.length} entries active` }].map(item => (
                      <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--gray-50)" }}>
                        <span style={{ fontSize: "12px", color: "var(--gray-500)" }}>{item.label}</span>
                        <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--gray-800)" }}>{item.val}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--gray-400)", marginTop: "12px", lineHeight: "1.6" }}>
                    💡 To apply temperature and max tokens changes permanently, update <code style={{ background: "#f3f4f6", padding: "1px 4px", borderRadius: "3px" }}>chatController.js</code> lines: <code style={{ background: "#f3f4f6", padding: "1px 4px", borderRadius: "3px" }}>temperature</code> and <code style={{ background: "#f3f4f6", padding: "1px 4px", borderRadius: "3px" }}>max_tokens</code>.
                  </p>
                </div>
              </div>
            </div>
            <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", padding: "24px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "4px" }}>📝 Custom System Prompt Override</h3>
              <p style={{ fontSize: "13px", color: "var(--gray-400)", marginBottom: "16px" }}>Optionally add extra instructions appended to the main system prompt. Useful for seasonal campaigns, special promotions, or tone adjustments. Leave empty to use defaults.</p>
              <textarea value={aiSystemPrompt} onChange={e => setAiSystemPrompt(e.target.value)} placeholder="e.g. For the next 2 weeks, always mention our Eid Special 20% discount on all tours..." rows={5} style={{ ...inputBase, resize: "vertical", lineHeight: "1.7" }} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                <p style={{ fontSize: "11px", color: "var(--gray-400)" }}>{aiSystemPrompt.length} characters · Add this to your KB entries instead for permanent effect</p>
                {aiSystemPrompt && <button onClick={() => setAiSystemPrompt("")} style={{ background: "none", color: "#9ca3af", border: "1px solid #e5e7eb", padding: "4px 12px", borderRadius: "50px", fontSize: "11px", cursor: "pointer" }}>Clear</button>}
              </div>
            </div>
            <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "4px" }}>🧪 Live Chatbot Tester</h3>
              <p style={{ fontSize: "13px", color: "var(--gray-400)", marginBottom: "20px" }}>Send a test message to see exactly how the chatbot responds right now. Uses your live backend — no mock data.</p>
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                <input type="text" value={aiTestInput} onChange={e => setAiTestInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !aiTesting && handleAiTest()} placeholder="e.g. What tours do you have under Rs. 20,000?" style={{ ...inputBase, flex: 1 }} onFocus={e => e.target.style.borderColor = "#16a34a"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
                <button onClick={handleAiTest} disabled={aiTesting || !aiTestInput.trim()} style={{ background: aiTesting || !aiTestInput.trim() ? "#e5e7eb" : "#16a34a", color: aiTesting || !aiTestInput.trim() ? "#9ca3af" : "white", border: "none", padding: "10px 24px", borderRadius: "50px", fontSize: "13px", fontWeight: "600", cursor: aiTesting || !aiTestInput.trim() ? "not-allowed" : "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "8px" }}>
                  {aiTesting ? (<><div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #9ca3af", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Testing...</>) : "🚀 Test Bot"}
                </button>
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
                <span style={{ fontSize: "11px", color: "var(--gray-400)", alignSelf: "center", marginRight: "4px" }}>Quick:</span>
                {["What tours do you offer?", "How do I book?", "What is your cancellation policy?", "Suggest a tour under Rs. 30,000", "Do you have group discounts?"].map(q => (
                  <button key={q} onClick={() => setAiTestInput(q)} style={{ padding: "4px 12px", borderRadius: "50px", fontSize: "11px", fontWeight: "500", border: "1px solid #e5e7eb", background: "var(--gray-50)", color: "var(--gray-600)", cursor: "pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.borderColor = "#bbf7d0"; e.currentTarget.style.color = "#16a34a"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "var(--gray-50)"; e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "var(--gray-600)"; }}>
                    {q}
                  </button>
                ))}
              </div>
              {aiTesting && (
                <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ display: "flex", gap: "4px" }}>{[0, 1, 2].map(i => (<span key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#16a34a", display: "inline-block", animation: "bounce-dot 1.2s infinite", animationDelay: `${i * 0.2}s` }} />))}</div>
                  <span style={{ fontSize: "13px", color: "var(--gray-400)" }}>Bot is thinking...</span>
                </div>
              )}
              {!aiTesting && aiTestReply && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #4ade80, #16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0 }}>🌿</div>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#16a34a" }}>GreenTours Assistant</span>
                  </div>
                  <p style={{ fontSize: "14px", color: "var(--gray-700)", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{aiTestReply}</p>
                  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <button onClick={() => { setAiTestReply(""); setAiTestInput(""); }} style={{ background: "none", color: "var(--gray-400)", border: "1px solid var(--gray-200)", padding: "4px 12px", borderRadius: "50px", fontSize: "11px", cursor: "pointer" }}>Clear</button>
                    <button onClick={handleAiTest} style={{ background: "none", color: "#16a34a", border: "1px solid #bbf7d0", padding: "4px 12px", borderRadius: "50px", fontSize: "11px", cursor: "pointer" }}>🔄 Try Again</button>
                  </div>
                </div>
              )}
              {!aiTesting && !aiTestReply && (
                <div style={{ background: "#f9fafb", border: "1px dashed #e5e7eb", borderRadius: "12px", padding: "32px", textAlign: "center" }}>
                  <p style={{ fontSize: "32px", marginBottom: "8px" }}>💬</p>
                  <p style={{ fontSize: "14px", color: "var(--gray-400)" }}>Enter a message above and click "Test Bot" to see the chatbot response.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ---- NEW: SUPPORT MESSAGES TAB ---- */}
        {/* ============================================================ */}
        {activeTab === "support" && (
          <div>
            <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", padding: "22px 28px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "4px" }}>💬 Support Messages</h3>
                <p style={{ fontSize: "13px", color: "var(--gray-400)" }}>Messages submitted through the Contact page by registered users.</p>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ background: "#fef9c3", color: "#92400e", padding: "5px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", border: "1px solid #fde68a" }}>
                  ⏳ {supportMessages.filter(m => m.status === "open").length} open
                </span>
                <span style={{ background: "#dcfce7", color: "#16a34a", padding: "5px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", border: "1px solid #86efac" }}>
                  ✅ {supportMessages.filter(m => m.status === "replied").length} replied
                </span>
                <button onClick={fetchSupport} style={{ background: "var(--gray-50)", color: "var(--gray-600)", border: "1px solid var(--gray-200)", padding: "5px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>🔄 Refresh</button>
              </div>
            </div>

            {supportMsg && (
              <div style={{ background: supportMsg.startsWith("✅") ? "#f0fdf4" : "#fef2f2", border: `1px solid ${supportMsg.startsWith("✅") ? "#bbf7d0" : "#fecaca"}`, color: supportMsg.startsWith("✅") ? "#16a34a" : "#dc2626", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", marginBottom: "20px", fontWeight: "500" }}>
                {supportMsg}
              </div>
            )}

            {supportLoading ? (
              <div style={{ textAlign: "center", padding: "60px 0", background: "white", borderRadius: "16px", border: "1px solid var(--gray-100)" }}>
                <div style={{ width: "36px", height: "36px", border: "3px solid var(--green-100)", borderTop: "3px solid var(--green-500)", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
                <p style={{ color: "var(--gray-400)" }}>Loading messages...</p>
              </div>
            ) : supportMessages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", background: "white", borderRadius: "16px", border: "1px solid var(--gray-100)" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>💬</div>
                <p style={{ color: "var(--gray-400)", fontSize: "15px" }}>No support messages yet.</p>
                <p style={{ color: "var(--gray-300)", fontSize: "13px", marginTop: "6px" }}>Messages submitted through the Contact page will appear here.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {supportMessages.map(msg => {
                  const STATUS_BADGE = {
                    open:    { label: "Open",    bg: "#fef9c3", color: "#92400e", border: "#fde68a", icon: "⏳" },
                    replied: { label: "Replied", bg: "#dcfce7", color: "#16a34a", border: "#86efac", icon: "✅" },
                    closed:  { label: "Closed",  bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb", icon: "🔒" },
                    blocked: { label: "Blocked", bg: "#fee2e2", color: "#dc2626", border: "#fecaca", icon: "🚫" },
                  };
                  const s = STATUS_BADGE[msg.status] || STATUS_BADGE.open;
                  const isReplying = replyTarget === msg._id;

                  return (
                    <div key={msg._id} style={{ background: "white", border: `1.5px solid ${msg.status === "open" ? "#fde68a" : msg.status === "blocked" ? "#fecaca" : "var(--gray-100)"}`, borderRadius: "14px", overflow: "hidden", boxShadow: msg.status === "open" ? "0 4px 16px rgba(202,138,4,0.1)" : "0 2px 8px rgba(0,0,0,0.05)", transition: "box-shadow 0.2s" }}>
                      {/* MESSAGE HEADER */}
                      <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--gray-50)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1, minWidth: "200px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: msg.status === "blocked" ? "#dc2626" : "var(--green-600)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "700", color: "white", flexShrink: 0 }}>
                              {(msg.name || "U")[0].toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "3px" }}>
                                <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--gray-800)" }}>{msg.name}</span>
                                <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 9px", borderRadius: "50px", background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                                  {s.icon} {s.label}
                                </span>
                              </div>
                              <p style={{ fontSize: "12px", color: "var(--gray-500)" }}>✉️ {msg.email}</p>
                              {msg.subject && <p style={{ fontSize: "12px", color: "var(--gray-400)", fontStyle: "italic", marginTop: "2px" }}>Subject: "{msg.subject}"</p>}
                              <p style={{ fontSize: "11px", color: "var(--gray-400)", marginTop: "3px" }}>
                                {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                              </p>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "flex-start", flexShrink: 0 }}>
                            {msg.status === "open" && (
                              <button
                                onClick={() => { setReplyTarget(isReplying ? null : msg._id); setReplyText(""); }}
                                style={{ background: isReplying ? "var(--gray-100)" : "#eff6ff", color: isReplying ? "var(--gray-600)" : "#1d4ed8", border: `1.5px solid ${isReplying ? "var(--gray-200)" : "#bfdbfe"}`, padding: "6px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}
                                onMouseEnter={e => { if (!isReplying) { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.color = "white"; } }}
                                onMouseLeave={e => { if (!isReplying) { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.color = "#1d4ed8"; } }}
                              >
                                {isReplying ? "✕ Cancel" : "💬 Reply"}
                              </button>
                            )}
                            {msg.status === "open" && (
                              <button
                                onClick={async () => {
                                  try {
                                    const res = await fetch(`${BASE_URL}/support/close/${msg._id}`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
                                    if (res.ok) { setSupportMessages(prev => prev.map(m => m._id === msg._id ? { ...m, status: "closed", isActive: false } : m)); setSupportMsg("✅ Message closed."); setTimeout(() => setSupportMsg(""), 3000); }
                                  } catch { setSupportMsg("❌ Failed."); setTimeout(() => setSupportMsg(""), 3000); }
                                }}
                                style={{ background: "#f3f4f6", color: "#6b7280", border: "1.5px solid #e5e7eb", padding: "6px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#6b7280"; e.currentTarget.style.color = "white"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#6b7280"; }}
                              >
                                🔒 Close
                              </button>
                            )}
                            {msg.status !== "blocked" ? (
                              <button
                                onClick={async () => {
                                  if (!window.confirm(`Block ${msg.name} from sending support messages?`)) return;
                                  try {
                                    const res = await fetch(`${BASE_URL}/support/block/${msg._id}`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
                                    if (res.ok) { setSupportMessages(prev => prev.map(m => m.user === msg.user ? { ...m, status: "blocked", isActive: false } : m)); setSupportMsg("✅ User blocked from messaging."); setTimeout(() => setSupportMsg(""), 3000); }
                                  } catch { setSupportMsg("❌ Failed."); setTimeout(() => setSupportMsg(""), 3000); }
                                }}
                                style={{ background: "#fef2f2", color: "#dc2626", border: "1.5px solid #fecaca", padding: "6px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "white"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#dc2626"; }}
                              >
                                🚫 Block User
                              </button>
                            ) : (
                              <button
                                onClick={async () => {
                                  try {
                                    const res = await fetch(`${BASE_URL}/support/unblock/${msg._id}`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
                                    if (res.ok) { setSupportMessages(prev => prev.map(m => m._id === msg._id ? { ...m, status: "closed" } : m)); setSupportMsg("✅ User unblocked."); setTimeout(() => setSupportMsg(""), 3000); }
                                  } catch { setSupportMsg("❌ Failed."); setTimeout(() => setSupportMsg(""), 3000); }
                                }}
                                style={{ background: "#dcfce7", color: "#16a34a", border: "1.5px solid #86efac", padding: "6px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap" }}
                              >
                                ✅ Unblock
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* MESSAGE BODY */}
                      <div style={{ padding: "16px 22px" }}>
                        <div style={{ background: "var(--gray-50)", borderRadius: "10px", padding: "14px 16px", marginBottom: msg.adminReply || isReplying ? "14px" : "0", border: "1px solid var(--gray-100)" }}>
                          <p style={{ fontSize: "11px", fontWeight: "700", color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>User Message</p>
                          <p style={{ fontSize: "14px", color: "var(--gray-700)", lineHeight: "1.75" }}>{msg.message}</p>
                        </div>

                        {msg.adminReply && !isReplying && (
                          <div style={{ background: "#f0fdf4", borderRadius: "10px", padding: "14px 16px", border: "1.5px solid #bbf7d0" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                              <p style={{ fontSize: "11px", fontWeight: "700", color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                🌿 Admin Reply {msg.repliedBy ? `by ${msg.repliedBy}` : ""}
                              </p>
                              {msg.repliedAt && <p style={{ fontSize: "11px", color: "#4ade80" }}>{new Date(msg.repliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>}
                            </div>
                            <p style={{ fontSize: "14px", color: "#166534", lineHeight: "1.7" }}>{msg.adminReply}</p>
                            <p style={{ fontSize: "11px", color: msg.userReadReply ? "#4ade80" : "#ca8a04", marginTop: "8px" }}>
                              {msg.userReadReply ? "✅ User has read this reply" : "⏳ User hasn't read this yet"}
                            </p>
                          </div>
                        )}

                        {isReplying && (
                          <div style={{ background: "#f0fdf4", borderRadius: "10px", padding: "16px", border: "1.5px solid #bbf7d0" }}>
                            <p style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>✍️ Write Reply</p>
                            <textarea
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder="Type your reply to the user..."
                              rows={4}
                              style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #bbf7d0", borderRadius: "9px", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", color: "#1f2937", background: "white", outline: "none", resize: "vertical", lineHeight: "1.7", boxSizing: "border-box", marginBottom: "12px" }}
                              onFocus={e => e.target.style.borderColor = "#16a34a"}
                              onBlur={e => e.target.style.borderColor = "#bbf7d0"}
                            />
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                disabled={replyingId === msg._id || !replyText.trim()}
                                onClick={async () => {
                                  if (!replyText.trim()) return;
                                  setReplyingId(msg._id);
                                  try {
                                    const res = await fetch(`${BASE_URL}/support/reply/${msg._id}`, {
                                      method: "PUT",
                                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                      body: JSON.stringify({ reply: replyText.trim() }),
                                    });
                                    const data = await res.json();
                                    if (res.ok) {
                                      setSupportMessages(prev => prev.map(m => m._id === msg._id ? { ...m, ...data.supportMessage } : m));
                                      setReplyTarget(null); setReplyText("");
                                      setSupportMsg("✅ Reply sent! User will see it in My Account → Support Messages."); setTimeout(() => setSupportMsg(""), 4000);
                                    } else {
                                      setSupportMsg(`❌ ${data.message || "Failed to send reply."}`); setTimeout(() => setSupportMsg(""), 4000);
                                    }
                                  } catch { setSupportMsg("❌ Connection error."); setTimeout(() => setSupportMsg(""), 4000); }
                                  finally { setReplyingId(null); }
                                }}
                                style={{ background: replyingId === msg._id || !replyText.trim() ? "#86efac" : "#16a34a", color: "white", border: "none", padding: "10px 24px", borderRadius: "50px", fontSize: "13px", fontWeight: "600", cursor: replyingId === msg._id || !replyText.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                              >
                                {replyingId === msg._id ? (<><div style={{ width: "13px", height: "13px", border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Sending...</>) : "✉️ Send Reply"}
                              </button>
                              <button onClick={() => { setReplyTarget(null); setReplyText(""); }} style={{ background: "white", color: "var(--gray-500)", border: "1.5px solid var(--gray-200)", padding: "10px 18px", borderRadius: "50px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {/* ---- END: SUPPORT MESSAGES TAB ---- */}

      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce-dot { 0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}