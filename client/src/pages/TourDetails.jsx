import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toursAPI } from "../services/api";
import { trackTourVisit } from "./Account";
import VirtualTour from "../components/VirtualTour";

export default function TourDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tour, setTour]                   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [guests, setGuests]               = useState(1);
  const [date, setDate]                   = useState("");
  const [activeTab, setActiveTab]         = useState("overview");
  const [showVirtualTour, setShowVirtualTour] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTour = async () => {
      try {
        const data = await toursAPI.getOne(id);
        setTour(data.tour || data);
      } catch {
        setTour(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
    if (id) trackTourVisit(id);
  }, [id]);

  const handleBook = () => {
    if (!date) { alert("Please select a travel date first."); return; }
    if (!user) { navigate("/login"); return; }
    navigate(`/checkout`, { state: { tour, guests, date } });
  };

  if (loading) return (
    <div style={{ paddingTop: "70px", textAlign: "center", paddingBottom: "160px", background: "var(--bg)", minHeight: "100vh" }}>
      <div style={{ width: "52px", height: "52px", border: "4px solid var(--green-100)", borderTop: "4px solid var(--green-500)", borderRadius: "50%", margin: "80px auto 16px", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "var(--text-muted)" }}>Loading tour details...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!tour) return (
    <div style={{ paddingTop: "70px", textAlign: "center", paddingBottom: "160px", paddingLeft: "5%", paddingRight: "5%", background: "var(--bg)", minHeight: "100vh" }}>
      <div style={{ fontSize: "52px", marginBottom: "16px", marginTop: "80px" }}>😕</div>
      <h2 style={{ color: "var(--text-primary)", marginBottom: "12px" }}>Tour not found</h2>
      <button onClick={() => navigate("/tours")} style={{ background: "var(--green-600)", color: "white", border: "none", padding: "12px 28px", borderRadius: "50px", cursor: "pointer", fontSize: "14px" }}>
        Browse Tours
      </button>
    </div>
  );

  const title    = tour.tourName || "Tour";
  const location = tour.location || "Pakistan";
  const price    = tour.price || 0;
  const rating   = tour.rating || 0;
  const duration = tour.duration || "N/A";
  const seats    = tour.availableSeats || 0;
  const category = tour.category || "Tour";
  const desc     = tour.description || "No description available.";
  const images   = Array.isArray(tour.images) ? tour.images : [];
  const image    = images[0] || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80";

  const itinerary = Array.isArray(tour.itinerary)
    ? tour.itinerary
        .map((item, idx) => ({ day: item.day ?? (idx + 1), description: item.description || "" }))
        .filter(item => item.description.trim() !== "")
        .sort((a, b) => a.day - b.day)
    : [];

  const weather      = tour.weather || null;
  const total        = price * guests;
  const hasItinerary = itinerary.length > 0;
  const hasGallery   = images.length > 1;

  // Virtual tour scenes from MongoDB
  const virtualScenes = Array.isArray(tour.virtualTourScenes)
    ? tour.virtualTourScenes.filter(s => s.imageUrl?.trim())
    : [];
  const hasVirtualTour = virtualScenes.length > 0;

  return (
    <div style={{ paddingTop: "70px", background: "var(--bg)", minHeight: "100vh" }}>

      {/* VIRTUAL TOUR MODAL */}
      {showVirtualTour && hasVirtualTour && (
        <VirtualTour
          scenes={virtualScenes}
          onClose={() => setShowVirtualTour(false)}
        />
      )}

      {/* ── HERO IMAGE ── */}
      <div style={{ position: "relative", height: "480px", overflow: "hidden" }}>
        <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)" }} />

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          style={{ position: "absolute", top: "24px", left: "5%", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "9px 20px", borderRadius: "50px", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
        >← Back</button>

        {/* 🌐 VIRTUAL 3D TOUR BUTTON — shows on hero if available */}
        {hasVirtualTour && (
          <button
            onClick={() => setShowVirtualTour(true)}
            style={{
              position: "absolute", top: "24px", right: "5%",
              background: "linear-gradient(135deg, rgba(22,163,74,0.9), rgba(5,46,22,0.9))",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(74,222,128,0.4)",
              color: "white", padding: "10px 22px",
              borderRadius: "50px", fontSize: "13px", fontWeight: "600",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: "8px",
              boxShadow: "0 4px 20px rgba(22,163,74,0.4)",
              transition: "all 0.2s",
              animation: "pulse 2s infinite",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(22,163,74,0.55)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(22,163,74,0.4)"; }}
          >
            <span style={{ fontSize: "16px" }}>🌐</span>
            Virtual 3D Tour
            <span style={{ fontSize: "10px", background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "50px", fontWeight: "700", letterSpacing: "0.5px" }}>
              {virtualScenes.length} SCENE{virtualScenes.length > 1 ? "S" : ""}
            </span>
          </button>
        )}

        {/* TITLE OVERLAY */}
        <div style={{ position: "absolute", bottom: "40px", left: "5%", right: "5%" }}>
          <span style={{ background: "var(--green-600)", color: "white", fontSize: "11px", fontWeight: "600", letterSpacing: "1px", padding: "4px 14px", borderRadius: "50px", textTransform: "uppercase" }}>
            {category}
          </span>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 4vw, 52px)", fontWeight: "700", color: "white", marginTop: "12px", lineHeight: "1.2" }}>
            {title}
          </h1>
          <div style={{ display: "flex", gap: "20px", marginTop: "12px", flexWrap: "wrap" }}>
            {[
              { icon: "📍", val: location },
              { icon: "🕐", val: duration },
              { icon: "💺", val: `${seats} seats` },
              ...(rating > 0 ? [{ icon: "⭐", val: `${rating} rating` }] : []),
              ...(weather && weather.temperature !== "N/A" ? [{ icon: "🌤️", val: `${Math.round(weather.temperature)}°C` }] : []),
            ].map((m) => (
              <span key={m.val} style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>
                {m.icon} {m.val}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 5%", display: "grid", gridTemplateColumns: "1fr 340px", gap: "40px", alignItems: "start" }}>

        {/* ── LEFT COLUMN ── */}
        <div>

          {/* VIRTUAL TOUR BANNER (if available — shows below hero too) */}
          {hasVirtualTour && (
            <div style={{
              background: "linear-gradient(135deg, #052e16 0%, #14532d 50%, #15803d 100%)",
              borderRadius: "16px", padding: "20px 24px",
              marginBottom: "28px",
              display: "flex", justifyContent: "space-between",
              alignItems: "center", flexWrap: "wrap", gap: "14px",
              boxShadow: "0 8px 32px rgba(22,163,74,0.25)",
              border: "1px solid rgba(74,222,128,0.2)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "12px",
                  background: "rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "24px", flexShrink: 0,
                }}>🌐</div>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: "700", color: "white", marginBottom: "3px" }}>
                    Virtual 3D Tour Available
                  </p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>
                    {virtualScenes.length} panoramic scene{virtualScenes.length > 1 ? "s" : ""} — drag to explore, scroll to zoom
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVirtualTour(true)}
                style={{
                  background: "linear-gradient(135deg, #16a34a, #4ade80)",
                  color: "white", border: "none",
                  padding: "12px 28px", borderRadius: "50px",
                  fontSize: "14px", fontWeight: "700",
                  cursor: "pointer", transition: "all 0.2s",
                  boxShadow: "0 4px 16px rgba(74,222,128,0.4)",
                  display: "flex", alignItems: "center", gap: "8px",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(74,222,128,0.55)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(74,222,128,0.4)"; }}
              >
                🌐 Launch Virtual 3D Tour
              </button>
            </div>
          )}

          {/* TABS */}
          <div style={{ display: "flex", borderBottom: "2px solid var(--border)", marginBottom: "32px", flexWrap: "wrap" }}>
            {[
              { key: "overview",  label: "Overview",                              show: true },
              { key: "itinerary", label: `Itinerary (${itinerary.length} Days)`, show: hasItinerary },
              { key: "gallery",   label: `Gallery (${images.length})`,            show: hasGallery },
            ].filter(t => t.show).map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  padding: "12px 24px", fontSize: "14px", fontWeight: "600",
                  border: "none", background: "transparent",
                  color: activeTab === t.key ? "var(--green-700)" : "var(--text-muted)",
                  borderBottom: activeTab === t.key ? "2px solid var(--green-600)" : "2px solid transparent",
                  marginBottom: "-2px", cursor: "pointer", transition: "all 0.2s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px" }}>
                About This Tour
              </h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.9", fontSize: "15px" }}>{desc}</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "16px", marginTop: "32px" }}>
                {[
                  { icon: "🕐", label: "Duration",   val: duration },
                  { icon: "💺", label: "Seats Left", val: `${seats} seats` },
                  { icon: "📍", label: "Location",   val: location },
                  { icon: "🏷️", label: "Category",  val: category },
                ].map((s) => (
                  <div key={s.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "18px", textAlign: "center" }}>
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>{s.icon}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500", marginBottom: "4px" }}>{s.label}</div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {hasItinerary && (
                <div style={{ marginTop: "36px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "700", color: "var(--text-primary)" }}>
                      Tour Itinerary
                    </h3>
                    {itinerary.length > 3 && (
                      <button onClick={() => setActiveTab("itinerary")} style={{ background: "var(--green-50)", color: "var(--green-700)", border: "1.5px solid var(--green-200)", padding: "6px 16px", borderRadius: "50px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                        View All {itinerary.length} Days →
                      </button>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {itinerary.slice(0, 3).map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: "16px", paddingBottom: "16px", position: "relative" }}>
                        {i < Math.min(2, itinerary.slice(0, 3).length - 1) && (
                          <div style={{ position: "absolute", left: "17px", top: "36px", width: "2px", height: "calc(100% - 8px)", background: "var(--green-100)" }} />
                        )}
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--green-600)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", flexShrink: 0, zIndex: 1 }}>
                          {item.day}
                        </div>
                        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px 18px", flex: 1 }}>
                          <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "6px" }}>Day {item.day}</h4>
                          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.7" }}>{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {itinerary.length > 3 && (
                    <button onClick={() => setActiveTab("itinerary")} style={{ width: "100%", marginTop: "8px", background: "var(--green-50)", color: "var(--green-700)", border: "1.5px solid var(--green-200)", padding: "12px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "var(--green-600)"; e.currentTarget.style.color = "white"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "var(--green-50)"; e.currentTarget.style.color = "var(--green-700)"; }}
                    >
                      See All {itinerary.length} Days →
                    </button>
                  )}
                </div>
              )}

              {weather && weather.temperature !== "N/A" && (
                <div style={{ marginTop: "28px", background: "linear-gradient(135deg, #0ea5e9, #0284c7)", borderRadius: "14px", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Live Weather in {location}</p>
                    <p style={{ fontSize: "32px", fontWeight: "700", color: "white", lineHeight: 1 }}>{Math.round(weather.temperature)}°C</p>
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", textTransform: "capitalize", marginTop: "4px" }}>{weather.condition}</p>
                  </div>
                  <div style={{ fontSize: "56px" }}>🌤️</div>
                </div>
              )}
            </div>
          )}

          {/* ── ITINERARY TAB ── */}
          {activeTab === "itinerary" && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>Day by Day Itinerary</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "28px" }}>{itinerary.length} {itinerary.length === 1 ? "day" : "days"} planned for this tour</p>
              {itinerary.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 24px", background: "var(--bg-card)", borderRadius: "14px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>🗓️</div>
                  <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>No itinerary added for this tour yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {itinerary.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: "20px", paddingBottom: "24px", position: "relative" }}>
                      {i < itinerary.length - 1 && <div style={{ position: "absolute", left: "19px", top: "40px", width: "2px", height: "calc(100% - 12px)", background: "var(--green-100)" }} />}
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--green-600)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", flexShrink: 0, zIndex: 1 }}>
                        {item.day}
                      </div>
                      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px 20px", flex: 1 }}>
                        <h4 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "8px" }}>Day {item.day}</h4>
                        <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.7" }}>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── GALLERY ── */}
          {activeTab === "gallery" && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "20px" }}>Photo Gallery</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                {images.map((img, i) => (
                  <div key={i} style={{ borderRadius: "10px", overflow: "hidden", height: "160px" }}>
                    <img src={img} alt={`${title} ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                      onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
                      onMouseLeave={e => e.target.style.transform = "scale(1)"}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN — BOOKING SIDEBAR ── */}
        <div style={{ position: "sticky", top: "90px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", boxShadow: "0 4px 24px var(--shadow)" }}>

          {/* VIRTUAL TOUR BUTTON IN SIDEBAR */}
          {hasVirtualTour && (
            <button
              onClick={() => setShowVirtualTour(true)}
              style={{
                width: "100%", marginBottom: "20px",
                background: "linear-gradient(135deg, #052e16, #16a34a)",
                color: "white", border: "none",
                padding: "13px", borderRadius: "50px",
                fontSize: "14px", fontWeight: "600",
                cursor: "pointer", transition: "all 0.2s",
                boxShadow: "0 4px 16px rgba(22,163,74,0.3)",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: "8px",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(22,163,74,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(22,163,74,0.3)"; }}
            >
              🌐 Virtual 3D Tour
              <span style={{ fontSize: "10px", background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "50px" }}>
                {virtualScenes.length} SCENE{virtualScenes.length > 1 ? "S" : ""}
              </span>
            </button>
          )}

          {/* PRICE */}
          <div style={{ marginBottom: "8px" }}>
            <span style={{ fontSize: "32px", fontWeight: "700", color: "var(--green-700)", fontFamily: "'Playfair Display', serif" }}>
              Rs. {Number(price).toLocaleString()}
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "14px" }}> /person</span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "24px" }}>Prices in Pakistani Rupees</p>

          {/* DATE PICKER */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>Travel Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
              style={{ width: "100%", padding: "11px 14px", border: "1.5px solid var(--border)", borderRadius: "10px", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", background: "var(--bg-card)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "#16a34a"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>

          {/* GUESTS COUNTER */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>Number of Guests</label>
            <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
              <button onClick={() => setGuests(Math.max(1, guests - 1))} style={{ width: "44px", height: "44px", background: "var(--bg-subtle)", border: "none", fontSize: "18px", color: "var(--text-secondary)", borderRight: "1px solid var(--border)", cursor: "pointer" }}>−</button>
              <span style={{ flex: 1, textAlign: "center", fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>{guests}</span>
              <button onClick={() => setGuests(Math.min(seats || 12, guests + 1))} style={{ width: "44px", height: "44px", background: "var(--bg-subtle)", border: "none", fontSize: "18px", color: "var(--text-secondary)", borderLeft: "1px solid var(--border)", cursor: "pointer" }}>+</button>
            </div>
          </div>

          {/* TOTAL */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", marginBottom: "20px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Rs. {price.toLocaleString()} × {guests} guest{guests > 1 ? "s" : ""}</span>
            <span style={{ fontSize: "20px", fontWeight: "700", color: "var(--green-700)" }}>Rs. {total.toLocaleString()}</span>
          </div>

          {/* BOOK BUTTON */}
          <button onClick={handleBook}
            style={{ width: "100%", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "white", border: "none", padding: "15px", borderRadius: "50px", fontSize: "15px", fontWeight: "600", boxShadow: "0 4px 16px rgba(22,163,74,0.35)", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(22,163,74,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(22,163,74,0.35)"; }}
          >
            Book This Tour 🌿
          </button>

          {!user && <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)", marginTop: "10px" }}>You'll be asked to log in before booking</p>}
          <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)", marginTop: "10px" }}>✅ Free cancellation up to 7 days before departure</p>

          {/* PAYMENT METHODS */}
          <div style={{ marginTop: "18px", padding: "14px", background: "var(--bg-subtle)", borderRadius: "10px", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", textAlign: "center", marginBottom: "10px", letterSpacing: "0.5px", textTransform: "uppercase" }}>We Accept</p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
              {[{ label: "EasyPaisa", color: "#00a651", bg: "#e8f8f0" }, { label: "JazzCash", color: "#cc0000", bg: "#fff0f0" }, { label: "Bank Transfer", color: "#1a56db", bg: "#eff6ff" }].map(pm => (
                <span key={pm.label} style={{ fontSize: "10px", fontWeight: "700", padding: "3px 10px", borderRadius: "50px", background: pm.bg, color: pm.color, border: `1px solid ${pm.color}30` }}>
                  {pm.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(22,163,74,0.4); }
          50%       { box-shadow: 0 4px 28px rgba(22,163,74,0.7); }
        }
      `}</style>
    </div>
  );
}