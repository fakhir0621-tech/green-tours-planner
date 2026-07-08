import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

const BASE_URL = "http://localhost:5000/api";

// ---- STAR DISPLAY ----
function Stars({ value, size = 16 }) {
  return (
    <span style={{ fontSize: `${size}px`, letterSpacing: "1px" }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ color: s <= value ? "#f59e0b" : "#d1d5db" }}>★</span>
      ))}
    </span>
  );
}

// ---- STAR INPUT ----
function StarInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          style={{ background: "none", border: "none", fontSize: "28px", color: s <= (hovered || value) ? "#f59e0b" : "#d1d5db", cursor: "pointer", transform: hovered === s ? "scale(1.2)" : "scale(1)", transition: "transform 0.15s", padding: "0 2px" }}
        >★</button>
      ))}
    </div>
  );
}

// ---- SECTION CARD ----
function SectionCard({ children, style = {} }) {
  return (
    <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", padding: "32px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", ...style }}>
      {children}
    </div>
  );
}

// ---- LOADING SPINNER ----
function LoadingSpinner({ label }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ width: "40px", height: "40px", border: "4px solid var(--green-100)", borderTop: "4px solid var(--green-500)", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "var(--gray-400)", fontSize: "14px" }}>{label}</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ---- EMPTY STATE ----
function EmptyState({ icon, title, desc, link, linkLabel }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ fontSize: "52px", marginBottom: "14px" }}>{icon}</div>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "var(--gray-800)", marginBottom: "8px" }}>{title}</h3>
      <p style={{ color: "var(--gray-400)", fontSize: "14px", marginBottom: "20px" }}>{desc}</p>
      {link && (
        <Link to={link} style={{ background: "var(--green-600)", color: "white", padding: "11px 28px", borderRadius: "50px", fontSize: "13px", fontWeight: "500", display: "inline-block", textDecoration: "none" }}>{linkLabel}</Link>
      )}
    </div>
  );
}

// ---- TRACK VISITED TOURS (exported so TourCard can use it) ----
export function trackTourVisit(tourId) {
  try {
    const visited = JSON.parse(localStorage.getItem("gt_visited") || "[]");
    if (!visited.includes(tourId)) {
      visited.unshift(tourId);
      localStorage.setItem("gt_visited", JSON.stringify(visited.slice(0, 20)));
    }
  } catch {}
}

const STATUS_STYLES = {
  confirmed: { bg: "#dcfce7", color: "#16a34a", label: "✅ Confirmed" },
  pending:   { bg: "#fef9c3", color: "#ca8a04", label: "⏳ Pending" },
  cancelled: { bg: "#fee2e2", color: "#dc2626", label: "❌ Cancelled" },
  rejected:  { bg: "#fee2e2", color: "#dc2626", label: "❌ Rejected" },
};

// ---- SUPPORT MESSAGE STATUS BADGE CONFIG (NEW) ----
const SUPPORT_STATUS = {
  open:    { label: "Open",    bg: "#fef9c3", color: "#92400e", icon: "⏳" },
  replied: { label: "Replied", bg: "#dcfce7", color: "#16a34a", icon: "💬" },
  closed:  { label: "Closed",  bg: "#f3f4f6", color: "#6b7280", icon: "🔒" },
  blocked: { label: "Blocked", bg: "#fee2e2", color: "#dc2626", icon: "🚫" },
};

// ---- MAIN COMPONENT ----
export default function Account() {
  const { user, token, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { wishlistTours, isWishlisted, toggleWishlist: ctxToggle } = useWishlist();

  const [activeSection, setActiveSection] = useState("profile");

  // ---- Profile ----
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "", bio: "" });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // ---- Bookings ----
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  // ---- AI Recs ----
  const [aiRecs, setAiRecs] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoaded, setAiLoaded] = useState(false);
  const [allTours, setAllTours] = useState([]);

  // ---- Reviews ----
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [reviewForm, setReviewForm] = useState({ tourId: "", rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState("");

  // ---- Wishlist remove loading ----
  const [removingId, setRemovingId] = useState(null);

  // ---- Support Messages (NEW) ----
  const [supportMessages, setSupportMessages]   = useState([]);
  const [supportLoading, setSupportLoading]     = useState(false);
  const [supportLoaded, setSupportLoaded]       = useState(false);

  const inputStyle = { width: "100%", padding: "11px 14px", border: "1.5px solid var(--gray-200)", borderRadius: "10px", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", outline: "none", color: "var(--gray-800)", background: "white", transition: "border-color 0.2s", boxSizing: "border-box" };

  // ---- On mount ----
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    setProfileForm({ name: user.name || user.username || "", email: user.email || "", phone: user.phone || "", bio: user.bio || "" });
    if (user.photo) setProfilePhotoPreview(user.photo);
    loadBookings();
    loadReviews();
    loadAllTours();
    loadSupportMessages(); // NEW
    window.scrollTo(0, 0);
  }, [user, navigate]);

  useEffect(() => {
    if (activeSection === "ai" && !aiLoaded && allTours.length > 0) loadAIRecs();
  }, [activeSection, allTours]);

  // ---- LOADERS ----
  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const userId = user._id || user.id;
      const res = await fetch(`${BASE_URL}/bookings/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.bookings || data.data || []);
      setBookings(list);
    } catch { setBookings([]); }
    finally { setBookingsLoading(false); }
  };

  const loadAllTours = async () => {
    try {
      const res = await fetch(`${BASE_URL}/tours`);
      const data = await res.json();
      const list = data.tours || data.data || data;
      setAllTours(Array.isArray(list) ? list : []);
    } catch { setAllTours([]); }
  };

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const userId = user._id || user.id;
      const res = await fetch(`${BASE_URL}/reviews/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        const list = data.reviews || data.data || (Array.isArray(data) ? data : []);
        setReviews(list);
      } else {
        const res2 = await fetch(`${BASE_URL}/reviews`, { headers: { Authorization: `Bearer ${token}` } });
        const data2 = await res2.json();
        const all = data2.reviews || data2.data || (Array.isArray(data2) ? data2 : []);
        const mine = all.filter(r => (r.userId?._id || r.userId || r.user) === (user._id || user.id));
        setReviews(mine);
      }
    } catch { setReviews([]); }
    finally { setReviewsLoading(false); }
  };

  // ---- LOAD SUPPORT MESSAGES (NEW) ----
  const loadSupportMessages = async () => {
    setSupportLoading(true);
    setSupportLoaded(true);
    try {
      const res = await fetch(`${BASE_URL}/support/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSupportMessages(Array.isArray(data) ? data : []);
      }
    } catch { setSupportMessages([]); }
    finally { setSupportLoading(false); }
  };

  // ---- MARK SUPPORT REPLY AS READ (NEW) ----
  const markSupportReplyRead = async (msgId) => {
    try {
      await fetch(`${BASE_URL}/support/read/${msgId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSupportMessages(prev =>
        prev.map(m => m._id === msgId ? { ...m, userReadReply: true } : m)
      );
    } catch {}
  };

  const loadAIRecs = async () => {
    setAiLoading(true); setAiLoaded(true);
    try {
      const visited = JSON.parse(localStorage.getItem("gt_visited") || "[]");
      const bookedTourIds = bookings.map(b => b.tourId?._id || b.tourId).filter(Boolean);
      const bookedCategories = bookings.map(b => b.tourId?.category).filter(Boolean);
      const bookedPrices = bookings.map(b => b.tourId?.price || 0).filter(Boolean);
      const avgPrice = bookedPrices.length > 0 ? bookedPrices.reduce((a, b) => a + b, 0) / bookedPrices.length : null;
      const candidates = allTours.filter(t => !bookedTourIds.includes(t._id || t.id));
      if (candidates.length === 0) { setAiRecs([]); setAiLoading(false); return; }
      let recs = [];
      try {
        const res = await fetch(`${BASE_URL}/recommendations`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ visitedIds: visited, bookedCategories, avgPrice: avgPrice || 2000, tours: candidates }) });
        if (res.ok) { const data = await res.json(); if (data.ids && Array.isArray(data.ids)) { recs = data.ids.map(id => candidates.find(t => (t._id || t.id) === id)).filter(Boolean); } }
      } catch {}
      if (recs.length < 3) {
        const preferredCategories = bookedCategories.length > 0 ? bookedCategories : (visited.length > 0 ? candidates.filter(t => visited.includes(t._id || t.id)).map(t => t.category).filter(Boolean) : []);
        const scored = candidates.filter(t => !recs.find(r => (r._id || r.id) === (t._id || t.id))).map(t => { let score = 0; if (preferredCategories.includes(t.category)) score += 4; if (visited.includes(t._id || t.id)) score += 3; if (avgPrice !== null) { const diff = Math.abs((t.price || 0) - avgPrice); if (diff < 300) score += 3; else if (diff < 800) score += 2; else if (diff < 1500) score += 1; } if ((t.rating || 0) >= 4.8) score += 1; return { ...t, score }; }).sort((a, b) => b.score - a.score);
        recs = [...recs, ...scored.slice(0, 3 - recs.length)];
      }
      setAiRecs(recs.slice(0, 3));
    } catch { setAiRecs([]); }
    finally { setAiLoading(false); }
  };

const handlePhotoChange = (e) => {
  const file = e.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setProfileError("Please select a valid image file.");
    return;
  }

  const reader = new FileReader();

  reader.onload = (event) => {
    setProfilePhoto(event.target.result);
    setProfilePhotoPreview(event.target.result);
    setProfileError("");
  };

  reader.readAsDataURL(file);
};

const handleSaveProfile = async (e) => {
  e.preventDefault();

  if (!profileForm.name || !profileForm.email) {
    setProfileError("Name and email are required.");
    return;
  }

  setSavingProfile(true);
  setProfileError("");

  try {
    const payload = {
      ...profileForm,
      ...(profilePhoto ? { photo: profilePhoto } : {}),
    };

    const response = await fetch(
      `${BASE_URL}/users/profile/${user._id || user.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update profile.");
    }

    updateUser(data.updatedUser);

    setProfileSuccess("Profile updated! ✅");
    setTimeout(() => setProfileSuccess(""), 4000);
  } catch (error) {
    setProfileError(error.message || "Something went wrong while updating your profile.");
  } finally {
    setSavingProfile(false);
  }
};

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    setCancellingId(id);
    try { await fetch(`${BASE_URL}/bookings/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); } catch {}
    setBookings(prev => prev.filter(b => b._id !== id));
    setCancellingId(null);
  };

  const handleRemoveWishlist = async (tourId) => {
    setRemovingId(tourId);
    await ctxToggle({ _id: tourId });
    setRemovingId(null);
  };

   const handleReviewSubmit = async (e) => {
  e.preventDefault();
  if (!reviewForm.tourId) { alert("Please select a tour."); return; }
  if (!reviewForm.comment.trim()) { alert("Please write your review."); return; }
  setSubmittingReview(true);
  const isEdit = !!editingReviewId;
  try {
    const res = await fetch(
      isEdit
        ? `${BASE_URL}/reviews/${editingReviewId}`
        : `${BASE_URL}/reviews/add`,
      {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...reviewForm,
          user: user?._id || user?.id,
        }),
      }
    );
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to submit review.");
      setSubmittingReview(false);
      return;
    }

    const saved = data.review || data.data || {
      _id: editingReviewId || Date.now().toString(),
      ...reviewForm,
      tour: allTours.find(t => t._id === reviewForm.tourId) || { tourName : "Tour" },
      createdAt: new Date().toISOString(),
    };

    if (isEdit) {
      setReviews(prev => prev.map(r => r._id === editingReviewId
        ? { ...r, rating: reviewForm.rating, comment: reviewForm.comment }
        : r
      ));
    } else {
      setReviews(prev => [saved, ...prev]);
    }

    setReviewSuccess(isEdit ? "Review updated! ✅" : "Review submitted! Pending admin approval. ✅");
    setTimeout(() => setReviewSuccess(""), 4000);

  } catch (err) {
    alert("Something went wrong. Please try again.");
  } finally {
    setSubmittingReview(false);
    setShowReviewForm(false);
    setEditingReviewId(null);
    setReviewForm({ tourId: "", rating: 5, comment: "" });
  }
};

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    setDeletingReviewId(id);
    try { await fetch(`${BASE_URL}/reviews/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); } catch {}
    setReviews(prev => prev.filter(r => r._id !== id));
    setDeletingReviewId(null);
  };

  const handleEditReview = (review) => {
    setReviewForm({ tourId: review.tourId?._id || review.tourId || "", rating: review.rating || 5, comment: review.comment || "" });
    setEditingReviewId(review._id);
    setShowReviewForm(true);
  };

  if (!user) return null;

  const avatarLetter = (user.name || user.username || user.email || "U")[0].toUpperCase();
  const avatarSrc = profilePhotoPreview || user.photo;

  // ---- Count unread support replies ---- (NEW)
  const unreadSupportReplies = supportMessages.filter(m => m.status === "replied" && !m.userReadReply).length;

  const SECTIONS = [
    { key: "profile",  icon: "👤", label: "Manage Profile" },
    { key: "bookings", icon: "📋", label: "My Bookings" },
    { key: "wishlist", icon: "❤️", label: "My Wishlist" },
    { key: "ai",       icon: "✨", label: "AI Recommendations" },
    { key: "reviews",  icon: "⭐", label: "My Reviews" },
    // ---- NEW: Support Messages ----
    { key: "support",  icon: "💬", label: `Support${unreadSupportReplies > 0 ? ` (${unreadSupportReplies})` : ""}` },
  ];

  return (
    <div style={{ paddingTop: "70px", background: "var(--off-white)", minHeight: "100vh" }}>

      {/* ===== HEADER ===== */}
      <div style={{ background: "linear-gradient(135deg, #14532d 0%, #052e16 100%)", padding: "48px 6% 36px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-80px", right: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div onClick={() => fileInputRef.current?.click()} title="Click to change photo" style={{ width: "80px", height: "80px", borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg, #4ade80, #16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "700", color: "white", border: "3px solid rgba(255,255,255,0.3)", cursor: "pointer", flexShrink: 0, position: "relative" }}>
            {avatarSrc ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : avatarLetter}
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s", fontSize: "22px" }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0"}>📷</div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
          <div>
            <p style={{ fontSize: "11px", letterSpacing: "3px", color: "#4ade80", fontWeight: "600", textTransform: "uppercase", marginBottom: "6px" }}>MY ACCOUNT</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px, 3vw, 36px)", fontWeight: "700", color: "white", marginBottom: "4px" }}>{user.name || user.username}</h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px" }}>{user.email}</p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", marginTop: "4px" }}>Click avatar to change photo</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0", marginTop: "28px", background: "rgba(255,255,255,0.08)", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)", maxWidth: "440px" }}>
          {[{ num: bookings.length, label: "Bookings" }, { num: wishlistTours.length, label: "Wishlist" }, { num: reviews.length, label: "Reviews" }].map((s, i, arr) => (
            <div key={s.label} style={{ flex: 1, textAlign: "center", padding: "14px", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "white" }}>{s.num}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== MAIN LAYOUT ===== */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "36px 5%", display: "grid", gridTemplateColumns: "220px 1fr", gap: "28px", alignItems: "start" }}>

        {/* SIDEBAR */}
        <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", position: "sticky", top: "90px" }}>
          {SECTIONS.map((s, i) => (
            <button key={s.key} onClick={() => setActiveSection(s.key)} style={{ width: "100%", padding: "15px 20px", display: "flex", alignItems: "center", gap: "12px", background: activeSection === s.key ? "var(--green-50)" : "white", color: activeSection === s.key ? "var(--green-700)" : "var(--gray-600)", border: "none", borderBottom: i < SECTIONS.length - 1 ? "1px solid var(--gray-50)" : "none", borderLeft: activeSection === s.key ? "3px solid var(--green-600)" : "3px solid transparent", fontSize: "13px", fontWeight: activeSection === s.key ? "600" : "400", textAlign: "left", cursor: "pointer", transition: "all 0.2s", position: "relative" }}>
              <span style={{ fontSize: "16px" }}>{s.icon}</span>
              {s.label}
              {/* Unread badge for support */}
              {s.key === "support" && unreadSupportReplies > 0 && (
                <span style={{ marginLeft: "auto", background: "#dc2626", color: "white", borderRadius: "50px", fontSize: "10px", fontWeight: "700", padding: "1px 7px", minWidth: "18px", textAlign: "center" }}>
                  {unreadSupportReplies}
                </span>
              )}
            </button>
          ))}
          <button onClick={() => { logout(); navigate("/"); }} style={{ width: "100%", padding: "15px 20px", display: "flex", alignItems: "center", gap: "12px", background: "white", color: "#dc2626", border: "none", borderTop: "1px solid var(--gray-100)", fontSize: "13px", fontWeight: "500", textAlign: "left", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"} onMouseLeave={e => e.currentTarget.style.background = "white"}>
            <span style={{ fontSize: "16px" }}>🚪</span>Sign Out
          </button>
        </div>

        {/* ===== CONTENT ===== */}
        <div>

          {/* ---- MANAGE PROFILE ---- */}
          {activeSection === "profile" && (
            <SectionCard>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "28px" }}>Manage Profile</h2>
              {profileSuccess && <div style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#16a34a", padding: "12px 16px", borderRadius: "10px", fontSize: "14px", marginBottom: "20px" }}>{profileSuccess}</div>}
              {profileError && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", fontSize: "14px", marginBottom: "20px" }}>⚠️ {profileError}</div>}
              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px", padding: "20px", background: "var(--gray-50)", borderRadius: "12px", border: "1.5px dashed var(--gray-200)" }}>
                <div style={{ width: "72px", height: "72px", borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg, #4ade80, #16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "700", color: "white", flexShrink: 0 }}>
                  {avatarSrc ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : avatarLetter}
                </div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--gray-800)", marginBottom: "6px" }}>Profile Photo</p>
                  <p style={{ fontSize: "12px", color: "var(--gray-400)", marginBottom: "10px" }}>JPG, PNG or GIF — max 5MB</p>
                  <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: "white", color: "var(--green-700)", border: "1.5px solid var(--green-200)", padding: "7px 16px", borderRadius: "50px", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>📷 Choose Photo</button>
                </div>
              </div>
              <form onSubmit={handleSaveProfile}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div><label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--gray-600)", marginBottom: "7px" }}>Full Name *</label><input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="Your name" style={inputStyle} onFocus={e => e.target.style.borderColor = "var(--green-400)"} onBlur={e => e.target.style.borderColor = "var(--gray-200)"} /></div>
                  <div><label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--gray-600)", marginBottom: "7px" }}>Email *</label><input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} placeholder="you@example.com" style={inputStyle} onFocus={e => e.target.style.borderColor = "var(--green-400)"} onBlur={e => e.target.style.borderColor = "var(--gray-200)"} /></div>
                </div>
                <div style={{ marginBottom: "16px" }}><label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--gray-600)", marginBottom: "7px" }}>Phone Number</label><input type="tel" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+92 300 1234567" style={inputStyle} onFocus={e => e.target.style.borderColor = "var(--green-400)"} onBlur={e => e.target.style.borderColor = "var(--gray-200)"} /></div>
                <div style={{ marginBottom: "24px" }}><label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--gray-600)", marginBottom: "7px" }}>Bio</label><textarea value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder="Tell us about yourself..." rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: "1.7" }} onFocus={e => e.target.style.borderColor = "var(--green-400)"} onBlur={e => e.target.style.borderColor = "var(--gray-200)"} /></div>
                <button type="submit" disabled={savingProfile} style={{ background: savingProfile ? "var(--green-400)" : "var(--green-600)", color: "white", border: "none", padding: "13px 32px", borderRadius: "50px", fontSize: "14px", fontWeight: "600", boxShadow: "0 4px 14px rgba(22,163,74,0.3)", cursor: savingProfile ? "not-allowed" : "pointer" }}>
                  {savingProfile ? "Saving..." : "Save Changes ✅"}
                </button>
              </form>
            </SectionCard>
          )}

          {/* ---- MY BOOKINGS ---- */}
          {activeSection === "bookings" && (
            <SectionCard>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "24px" }}>My Bookings</h2>
              {bookingsLoading ? <LoadingSpinner label="Loading bookings..." /> : bookings.length === 0 ? (
                <EmptyState icon="🗺️" title="No bookings yet" desc="Browse our tours and book your first adventure!" link="/tours" linkLabel="Browse Tours" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {bookings.map(b => {
                    const tour = b.tour || b.tourId || {};
                    const status = (b.status || "pending").toLowerCase();
                    const ss = STATUS_STYLES[status] || STATUS_STYLES.pending;
                    const tourName = tour.tourName || tour.title || "Tour Package";
                    const tourImage = tour.images?.[0] || tour.photo || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70";
                    const tourLocation = tour.location || tour.city || "Pakistan";
                    const tourDuration = tour.duration || "N/A";
                    const guestCount = b.numberOfPeople || b.guestSize || 1;
                    const travelDate = b.travelDate || b.bookingDate || null;
                    const totalPrice = b.totalPrice || 0;
                    const payMethod = b.paymentMethod || null;
                    const invoiceNo = b.invoiceNumber || null;
                    const payStatus = b.paymentStatus || "Pending";
                    const PAY_METHOD_LABELS = { easypaisa: { label: "EasyPaisa", color: "#00a651", bg: "#e8f8f0" }, jazzcash: { label: "JazzCash", color: "#cc0000", bg: "#fff0f0" }, bank: { label: "Bank Transfer", color: "#1a56db", bg: "#eff6ff" } };
                    const pm = PAY_METHOD_LABELS[payMethod] || null;
                    return (
                      <div key={b._id} style={{ border: `1px solid ${status === "confirmed" ? "#86efac" : status === "rejected" ? "#fecaca" : "var(--gray-100)"}`, borderRadius: "14px", overflow: "hidden", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", transition: "box-shadow 0.2s" }} onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.10)"} onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"}>
                        <div style={{ display: "grid", gridTemplateColumns: "130px 1fr" }}>
                          <div style={{ position: "relative", overflow: "hidden", minHeight: "140px" }}>
                            <img src={tourImage} alt={tourName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                            {status === "rejected" && (<div style={{ position: "absolute", inset: 0, background: "rgba(220,38,38,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "white", fontSize: "11px", fontWeight: "700", background: "#dc2626", padding: "3px 10px", borderRadius: "50px" }}>REJECTED</span></div>)}
                          </div>
                          <div style={{ padding: "18px 20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                              <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 12px", borderRadius: "50px", background: ss.bg, color: ss.color }}>{ss.label}</span>
                              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "10px", fontWeight: "600", padding: "2px 10px", borderRadius: "50px", background: payStatus === "Verified" ? "#dcfce7" : payStatus === "Rejected" ? "#fee2e2" : "#fef9c3", color: payStatus === "Verified" ? "#16a34a" : payStatus === "Rejected" ? "#dc2626" : "#ca8a04" }}>💳 Payment: {payStatus}</span>
                                {invoiceNo && <span style={{ fontSize: "10px", color: "var(--gray-400)", fontFamily: "monospace" }}>#{invoiceNo}</span>}
                              </div>
                            </div>
                            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "10px", lineHeight: "1.3" }}>{tourName}</h3>
                            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "12px" }}>
                              {[{ icon: "📍", val: tourLocation }, { icon: "🕐", val: tourDuration }, { icon: "📅", val: travelDate ? new Date(travelDate).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" }) : "Date N/A" }, { icon: "👥", val: `${guestCount} guest${guestCount > 1 ? "s" : ""}` }].map(m => (
                                <span key={m.icon} style={{ fontSize: "12px", color: "var(--gray-500)", display: "flex", alignItems: "center", gap: "4px" }}>{m.icon} {m.val}</span>
                              ))}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", paddingTop: "10px", borderTop: "1px solid var(--gray-100)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                {pm && <span style={{ fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "50px", background: pm.bg, color: pm.color }}>{pm.label}</span>}
                                {b.transactionId && <span style={{ fontSize: "11px", color: "var(--gray-400)", fontFamily: "monospace" }}>ID: {b.transactionId}</span>}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "700", color: "var(--green-700)" }}>Rs. {Number(totalPrice).toLocaleString()}</span>
                                {status !== "cancelled" && status !== "rejected" && (
                                  <button onClick={() => handleCancelBooking(b._id)} disabled={cancellingId === b._id} style={{ background: "none", color: "#dc2626", border: "1.5px solid #fecaca", padding: "5px 12px", borderRadius: "50px", fontSize: "11px", fontWeight: "500", cursor: cancellingId === b._id ? "not-allowed" : "pointer", transition: "all 0.2s" }} onMouseEnter={e => { if (cancellingId !== b._id) { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "white"; } }} onMouseLeave={e => { if (cancellingId !== b._id) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#dc2626"; } }}>
                                    {cancellingId === b._id ? "..." : "Cancel"}
                                  </button>
                                )}
                              </div>
                            </div>
                            {b.adminNote && <div style={{ marginTop: "10px", background: "#fef9c3", border: "1px solid #fde68a", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", color: "#92400e" }}>📝 Admin Note: {b.adminNote}</div>}
                            {status === "pending" && payStatus === "Pending" && (<div style={{ marginTop: "10px", background: "#fef9c3", border: "1px solid #fde68a", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", color: "#92400e", display: "flex", alignItems: "center", gap: "6px" }}>⏳ Awaiting payment verification by admin — usually within 24 hours.</div>)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          )}

          {/* ---- MY WISHLIST ---- */}
          {activeSection === "wishlist" && (
            <SectionCard>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "var(--gray-800)" }}>My Wishlist</h2>
                {wishlistTours.length > 0 && <span style={{ background: "#fef2f2", color: "#dc2626", padding: "5px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", border: "1px solid #fecaca" }}>❤️ {wishlistTours.length} saved</span>}
              </div>
              {wishlistTours.length === 0 ? (
                <EmptyState icon="🤍" title="Your wishlist is empty" desc="Click the red 'Add to Wishlist' button on any tour card to save it here." link="/tours" linkLabel="Browse Tours" />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
                  {wishlistTours.map(tour => {
                    const tourId = tour._id || tour.id;
                    const image = tour.images?.[0] || tour.photo || tour.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70";
                    return (
                      <div key={tourId} style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "12px", overflow: "hidden", transition: "all 0.3s", display: "flex", flexDirection: "column" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                        <div style={{ position: "relative", height: "160px", overflow: "hidden" }}>
                          <img src={image} alt={tour.tourName || tour.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          {tour.category && <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(255,255,255,0.92)", padding: "3px 10px", borderRadius: "50px", fontSize: "11px", fontWeight: "600", color: "var(--green-700)" }}>{tour.category}</div>}
                        </div>
                        <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column" }}>
                          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "4px" }}>{tour.tourName || tour.title}</h3>
                          <p style={{ fontSize: "12px", color: "var(--gray-400)", marginBottom: "12px", flex: 1 }}>📍 {tour.city || tour.location || "N/A"}{tour.duration ? ` · ${tour.duration}` : ""}</p>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--green-700)" }}>${Number(tour.price || 0).toLocaleString()}</span>
                            <button onClick={() => handleRemoveWishlist(tourId)} disabled={removingId === tourId} style={{ background: removingId === tourId ? "var(--gray-100)" : "#fef2f2", color: removingId === tourId ? "var(--gray-400)" : "#dc2626", border: "1.5px solid #fecaca", padding: "5px 12px", borderRadius: "50px", fontSize: "11px", fontWeight: "600", cursor: removingId === tourId ? "not-allowed" : "pointer", transition: "all 0.2s" }} onMouseEnter={e => { if (removingId !== tourId) { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "white"; } }} onMouseLeave={e => { if (removingId !== tourId) { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#dc2626"; } }}>
                              {removingId === tourId ? "..." : "✕ Remove"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          )}

          {/* ---- AI RECOMMENDATIONS ---- */}
          {activeSection === "ai" && (
            <SectionCard>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "8px" }}>✨ You May Also Like</h2>
              <p style={{ color: "var(--gray-400)", fontSize: "14px", marginBottom: "24px" }}>Recommendations based on tours you've visited and booked.</p>
              {aiLoading ? <LoadingSpinner label="Finding tours you'll love..." /> : aiRecs.length === 0 ? (
                <EmptyState icon="✨" title="No recommendations yet" desc="Browse and click on a few tours first — recommendations are based on what you explore and book." link="/tours" linkLabel="Browse Tours to Get Started" />
              ) : (
                <>
                  <div style={{ background: "var(--green-50)", border: "1px solid var(--green-200)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "var(--green-700)", display: "flex", alignItems: "center", gap: "8px" }}>🤖 Based on your browsing history and booking preferences</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
                    {aiRecs.map(tour => {
                      const tourId = tour._id || tour.id;
                      const image = tour.images?.[0] || tour.photo || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70";
                      return (
                        <Link key={tourId} to={`/tours/${tourId}`} style={{ textDecoration: "none" }} onClick={() => trackTourVisit(tourId)}>
                          <div style={{ background: "white", border: "1px solid var(--gray-100)", borderRadius: "12px", overflow: "hidden", transition: "all 0.3s" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                            <div style={{ position: "relative", height: "160px", overflow: "hidden" }}>
                              <img src={image} alt={tour.tourName || tour.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              {tour.category && <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(255,255,255,0.92)", padding: "3px 10px", borderRadius: "50px", fontSize: "11px", fontWeight: "600", color: "var(--green-700)" }}>{tour.category}</div>}
                              <div style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(22,163,74,0.9)", padding: "3px 10px", borderRadius: "50px", fontSize: "11px", fontWeight: "600", color: "white" }}>✨ AI Pick</div>
                            </div>
                            <div style={{ padding: "14px" }}>
                              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "4px" }}>{tour.tourName || tour.title}</h3>
                              <p style={{ fontSize: "12px", color: "var(--gray-400)", marginBottom: "8px" }}>📍 {tour.city || tour.location}{tour.duration ? ` · ${tour.duration}` : ""}</p>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--green-700)" }}>${Number(tour.price || 0).toLocaleString()}</span>
                                {tour.rating > 0 && <span style={{ fontSize: "12px", color: "#f59e0b" }}>★ {Number(tour.rating).toFixed(1)}</span>}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <div style={{ textAlign: "center", marginTop: "24px" }}>
                    <button onClick={() => { setAiLoaded(false); setAiRecs([]); loadAIRecs(); }} style={{ background: "var(--green-50)", color: "var(--green-700)", border: "1.5px solid var(--green-200)", padding: "10px 24px", borderRadius: "50px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>🔄 Refresh Recommendations</button>
                  </div>
                </>
              )}
            </SectionCard>
          )}

          {/* ---- MY REVIEWS ---- */}
          {activeSection === "reviews" && (
            <SectionCard>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "var(--gray-800)" }}>My Reviews</h2>
                <button onClick={() => { setShowReviewForm(!showReviewForm); setEditingReviewId(null); setReviewForm({ tourId: "", rating: 5, comment: "" }); }} style={{ background: showReviewForm ? "var(--gray-100)" : "var(--green-600)", color: showReviewForm ? "var(--gray-600)" : "white", border: "none", padding: "10px 20px", borderRadius: "50px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}>
                  {showReviewForm ? "✕ Cancel" : "+ Write a Review"}
                </button>
              </div>
              {reviewSuccess && <div style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#16a34a", padding: "12px 16px", borderRadius: "10px", fontSize: "14px", marginBottom: "20px" }}>{reviewSuccess}</div>}
              {showReviewForm && (
                <div style={{ background: "var(--gray-50)", border: "1px solid var(--gray-200)", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--gray-800)", marginBottom: "18px" }}>{editingReviewId ? "Edit Review" : "Write a New Review"}</h3>
                  <form onSubmit={handleReviewSubmit}>
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--gray-600)", marginBottom: "7px" }}>Select Tour *</label>
                      <select value={reviewForm.tourId} onChange={e => setReviewForm({ ...reviewForm, tourId: e.target.value })} disabled={!!editingReviewId} style={{ ...inputStyle, background: editingReviewId ? "var(--gray-100)" : "white", cursor: editingReviewId ? "not-allowed" : "pointer" }}>
                        <option value="">-- Choose a tour --</option>
                        {allTours.map(t => <option key={t._id} value={t._id}>{t.tourName || t.title} — {t.city || t.location}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--gray-600)", marginBottom: "10px" }}>Rating *</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <StarInput value={reviewForm.rating} onChange={v => setReviewForm({ ...reviewForm, rating: v })} />
                        <span style={{ fontSize: "14px", color: "var(--gray-500)" }}>{["", "Poor", "Fair", "Good", "Very Good", "Excellent"][reviewForm.rating]}</span>
                      </div>
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--gray-600)", marginBottom: "7px" }}>Your Review *</label>
                      <textarea value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Share your experience — what made it special?" rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: "1.7" }} onFocus={e => e.target.style.borderColor = "var(--green-400)"} onBlur={e => e.target.style.borderColor = "var(--gray-200)"} />
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button type="submit" disabled={submittingReview} style={{ background: submittingReview ? "var(--green-400)" : "var(--green-600)", color: "white", border: "none", padding: "11px 28px", borderRadius: "50px", fontSize: "14px", fontWeight: "600", cursor: submittingReview ? "not-allowed" : "pointer" }}>
                        {submittingReview ? "Submitting..." : editingReviewId ? "Update Review" : "Submit Review ⭐"}
                      </button>
                      <button type="button" onClick={() => { setShowReviewForm(false); setEditingReviewId(null); setReviewForm({ tourId: "", rating: 5, comment: "" }); }} style={{ background: "var(--gray-100)", color: "var(--gray-600)", border: "none", padding: "11px 20px", borderRadius: "50px", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}
              {reviewsLoading ? <LoadingSpinner label="Loading reviews..." /> : reviews.length === 0 && !showReviewForm ? (
                <EmptyState icon="⭐" title="No reviews yet" desc="Booked a tour? Share your experience to help other travelers." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {reviews.map(review => {
                    const tour = review.tourId || {};
                    const image = tour.images?.[0] || tour.photo || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=70";
                    return (
                      <div key={review._id} style={{ border: "1px solid var(--gray-100)", borderRadius: "12px", overflow: "hidden", display: "grid", gridTemplateColumns: "100px 1fr", transition: "box-shadow 0.2s" }} onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"} onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                        <img src={image} alt={tour.tourName || tour.title || "Tour"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ padding: "16px 20px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: "700", color: "var(--gray-800)" }}>{tour.tourName || tour.title || "Tour"}</h3>
                            <span style={{ fontSize: "12px", color: "var(--gray-400)" }}>{review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
                          </div>
                          {(tour.city || tour.location) && <p style={{ fontSize: "12px", color: "var(--green-600)", fontWeight: "600", marginBottom: "8px" }}>📍 {tour.city || tour.location}</p>}
                          <div style={{ marginBottom: "10px" }}><Stars value={review.rating || 5} size={16} /></div>
                          <p style={{ fontSize: "13px", color: "var(--gray-600)", lineHeight: "1.7", marginBottom: "12px", fontStyle: "italic" }}>"{review.comment}"</p>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => handleEditReview(review)} style={{ background: "var(--green-50)", color: "var(--green-700)", border: "1.5px solid var(--green-200)", padding: "5px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>✏️ Edit</button>
                            <button onClick={() => handleDeleteReview(review._id)} disabled={deletingReviewId === review._id} style={{ background: "none", color: "#dc2626", border: "1.5px solid #fecaca", padding: "5px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "500", cursor: deletingReviewId === review._id ? "not-allowed" : "pointer" }}>
                              {deletingReviewId === review._id ? "..." : "🗑️ Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          )}

          {/* ============================================================ */}
          {/* ---- NEW: SUPPORT MESSAGES SECTION ---- */}
          {/* ============================================================ */}
          {activeSection === "support" && (
            <SectionCard>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: "700", color: "var(--gray-800)", marginBottom: "4px" }}>💬 Support Messages</h2>
                  <p style={{ fontSize: "13px", color: "var(--gray-400)" }}>Your contact history and admin replies.</p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button onClick={loadSupportMessages} style={{ background: "var(--gray-50)", color: "var(--gray-600)", border: "1px solid var(--gray-200)", padding: "7px 16px", borderRadius: "50px", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>🔄 Refresh</button>
                  <Link to="/contact" style={{ background: "var(--green-600)", color: "white", padding: "8px 18px", borderRadius: "50px", fontSize: "13px", fontWeight: "600", textDecoration: "none", display: "inline-block" }}>✉️ New Message</Link>
                </div>
              </div>

              {supportLoading ? <LoadingSpinner label="Loading messages..." /> : supportMessages.length === 0 ? (
                <EmptyState
                  icon="💬"
                  title="No messages yet"
                  desc="Have a question or need help? Send us a message through the Contact page."
                  link="/contact"
                  linkLabel="Contact Us"
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {supportMessages.map(msg => {
                    const s = SUPPORT_STATUS[msg.status] || SUPPORT_STATUS.open;
                    const isUnread = msg.status === "replied" && !msg.userReadReply;

                    return (
                      <div key={msg._id} style={{
                        border: `1.5px solid ${isUnread ? "#86efac" : msg.status === "blocked" ? "#fecaca" : "var(--gray-100)"}`,
                        borderRadius: "14px", overflow: "hidden", background: "white",
                        boxShadow: isUnread ? "0 4px 20px rgba(22,163,74,0.15)" : "0 2px 8px rgba(0,0,0,0.05)",
                        transition: "box-shadow 0.2s",
                      }}>
                        {/* UNREAD BANNER */}
                        {isUnread && (
                          <div style={{ background: "linear-gradient(135deg, #14532d, #16a34a)", padding: "8px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "white" }}>💬 New reply from admin!</span>
                            <button
                              onClick={() => markSupportReplyRead(msg._id)}
                              style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "none", padding: "3px 12px", borderRadius: "50px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}
                            >
                              Mark as read
                            </button>
                          </div>
                        )}

                        <div style={{ padding: "20px 22px" }}>
                          {/* HEADER ROW */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "12px", fontWeight: "700", padding: "3px 10px", borderRadius: "50px", background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}>
                                  {s.icon} {s.label}
                                </span>
                                {msg.subject && <span style={{ fontSize: "12px", color: "var(--gray-500)", fontStyle: "italic" }}>"{msg.subject}"</span>}
                              </div>
                              <p style={{ fontSize: "11px", color: "var(--gray-400)" }}>
                                Sent {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}
                              </p>
                            </div>
                          </div>

                          {/* ORIGINAL MESSAGE */}
                          <div style={{ background: "var(--gray-50)", borderRadius: "10px", padding: "14px 16px", marginBottom: msg.adminReply ? "14px" : "0", border: "1px solid var(--gray-100)" }}>
                            <p style={{ fontSize: "11px", fontWeight: "700", color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Your Message</p>
                            <p style={{ fontSize: "14px", color: "var(--gray-700)", lineHeight: "1.7" }}>{msg.message}</p>
                          </div>

                          {/* ADMIN REPLY */}
                          {msg.adminReply && (
                            <div style={{ background: "#f0fdf4", borderRadius: "10px", padding: "14px 16px", border: "1.5px solid #bbf7d0" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                                <p style={{ fontSize: "11px", fontWeight: "700", color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                  🌿 Admin Reply {msg.repliedBy ? `by ${msg.repliedBy}` : ""}
                                </p>
                                {msg.repliedAt && (
                                  <p style={{ fontSize: "11px", color: "#4ade80" }}>
                                    {new Date(msg.repliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  </p>
                                )}
                              </div>
                              <p style={{ fontSize: "14px", color: "#166534", lineHeight: "1.7" }}>{msg.adminReply}</p>
                            </div>
                          )}

                          {/* STATUS HINTS */}
                          {msg.status === "open" && (
                            <p style={{ fontSize: "12px", color: "var(--gray-400)", marginTop: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                              ⏳ Awaiting admin reply — usually within 24 hours.
                            </p>
                          )}
                          {msg.status === "blocked" && (
                            <p style={{ fontSize: "12px", color: "#dc2626", marginTop: "12px" }}>
                              🚫 You have been blocked from sending support messages. Please contact us directly at 03165252847.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          )}
          {/* ============================================================ */}
          {/* ---- END: SUPPORT MESSAGES SECTION ---- */}
          {/* ============================================================ */}

        </div>
      </div>
    </div>
  );
}