// TourDetails.jsx — COMPLETE FILE — paste over your existing one

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toursAPI } from "../services/api";
import { trackTourVisit } from "./Account";
import DepartureSelector from "../components/DepartureSelector";
import TransportInfo from "../components/TransportInfo";
import SeatLegend from "../components/SeatLegend";
import SeatMap from "../components/SeatMap";
import BookingSummary from "../components/BookingSummary";

export default function TourDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [tour, setTour]                   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState("overview");
  const [selectedDeparture, setSelectedDeparture] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

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

  const handleSelectDeparture = (dep) => {
    setSelectedDeparture(dep);
    setSelectedSeats([]);
  };

  const handleToggleSeat = useCallback((seat) => {
    setSelectedSeats(prev => {
      const exists = prev.find(s => s.vehicleNumber === seat.vehicleNumber && s.seatNumber === seat.seatNumber);
      if (exists) return prev.filter(s => !(s.vehicleNumber === seat.vehicleNumber && s.seatNumber === seat.seatNumber));
      return [...prev, { vehicleNumber: seat.vehicleNumber, seatNumber: seat.seatNumber }];
    });
  }, []);

  // ── UPDATED handleBook ──────────────────────────────────────────────────────
  // Step 1: Call bookSeats to soft-reserve the selected seats on the backend.
  //         This only flips seat status to "reserved" — no Booking document
  //         is created yet.
  // Step 2: On success, navigate to Checkout with tour + departure +
  //         selectedSeats in location.state. Checkout creates the real Booking
  //         document (including payment proof) via /api/bookings/create.
  // Step 3: Seats flip "reserved" → "booked" only after admin verifies payment.
  //         On rejection they flip back to "available".
  const handleBook = async () => {
    if (!user) { navigate("/login"); return; }
    if (!selectedDeparture) { alert("Please select a departure."); return; }
    if (selectedSeats.length === 0) { alert("Please select at least one seat."); return; }

    setBookingLoading(true);
    try {
      // Step 1 — reserve seats (soft hold)
      const res = await fetch(
        `http://localhost:5000/api/tours/${id}/departures/${selectedDeparture._id}/book`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ seats: selectedSeats }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not reserve seats. They may have just been taken.");

      // Step 2 — hand off to Checkout.
      // Keys match exactly what Checkout.jsx reads from location.state:
      //   tour, departure, selectedSeats
      navigate("/checkout", {
        state: {
          tour,
          departure:     selectedDeparture,
          selectedSeats,
        },
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setBookingLoading(false);
    }
  };
  // ───────────────────────────────────────────────────────────────────────────

  if (loading) return (
    <div style={{
      paddingTop: "70px", textAlign: "center",
      paddingBottom: "160px",
      background: "var(--bg)", minHeight: "100vh",
    }}>
      <div style={{
        width: "52px", height: "52px",
        border: "4px solid var(--green-100)",
        borderTop: "4px solid var(--green-500)",
        borderRadius: "50%",
        margin: "80px auto 16px",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "var(--text-muted)" }}>Loading tour details...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!tour) return (
    <div style={{
      paddingTop: "70px", textAlign: "center",
      paddingBottom: "160px",
      paddingLeft: "5%", paddingRight: "5%",
      background: "var(--bg)", minHeight: "100vh",
    }}>
      <div style={{ fontSize: "52px", marginBottom: "16px", marginTop: "80px" }}>😕</div>
      <h2 style={{ color: "var(--text-primary)", marginBottom: "12px" }}>Tour not found</h2>
      <button
        onClick={() => navigate("/tours")}
        style={{
          background: "var(--green-600)", color: "white",
          border: "none", padding: "12px 28px",
          borderRadius: "50px", cursor: "pointer", fontSize: "14px",
        }}
      >
        Browse Tours
      </button>
    </div>
  );

  const title      = tour.tourName || "Tour";
  const location   = tour.location || "Pakistan";
  const price      = tour.price || 0;
  const rating     = tour.rating || 0;
  const duration   = tour.duration || "N/A";
  const category   = tour.category || "Tour";
  const desc       = tour.description || "No description available.";
  const images     = Array.isArray(tour.images) ? tour.images : [];
  const image      = images[0] || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80";
  const departures = Array.isArray(tour.departures) ? tour.departures : [];
  const weather    = tour.weather || null;

  const remainingSeats = selectedDeparture
    ? (selectedDeparture.seatMap || []).filter(s => s.status === "available").length
    : (tour.availableSeats || 0);

  const itinerary = Array.isArray(tour.itinerary)
    ? tour.itinerary
        .map((item, idx) => ({ day: item.day ?? (idx + 1), description: item.description || "" }))
        .filter(item => item.description.trim() !== "")
        .sort((a, b) => a.day - b.day)
    : [];

  const hasItinerary = itinerary.length > 0;
  const hasGallery   = images.length > 1;
  
  const virtualScenes = Array.isArray(tour.virtualTourScenes)
  ? tour.virtualTourScenes.filter(s => s.imageUrl?.trim())
  : [];
  const hasVirtualTour = virtualScenes.length > 0;

  return (
    <div style={{ paddingTop: "70px", background: "var(--bg)", minHeight: "100vh" }}>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: "480px", overflow: "hidden" }}>
        <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
        }} />
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "absolute", top: "24px", left: "5%",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "white", padding: "9px 20px",
            borderRadius: "50px", fontSize: "14px",
            cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
          }}
        >
          ← Back
        </button>

        <div style={{ position: "absolute", bottom: "40px", left: "5%", right: "5%" }}>
          <span style={{
            background: "var(--green-600)", color: "white",
            fontSize: "11px", fontWeight: "600",
            letterSpacing: "1px", padding: "4px 14px",
            borderRadius: "50px", textTransform: "uppercase",
          }}>
            {category}
          </span>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(26px, 4vw, 52px)",
            fontWeight: "700", color: "white",
            marginTop: "12px", lineHeight: "1.2",
          }}>
            {title}
          </h1>
          <div style={{ display: "flex", gap: "20px", marginTop: "12px", flexWrap: "wrap" }}>
            {[
              { icon: "📍", val: location },
              { icon: "🕐", val: duration },
              { icon: "💺", val: `${remainingSeats} seats available` },
              ...(rating > 0 ? [{ icon: "⭐", val: `${rating} rating` }] : []),
              ...(weather && weather.temperature !== "N/A"
                ? [{ icon: "🌤️", val: `${Math.round(weather.temperature)}°C` }] : []),
            ].map((m) => (
              <span key={m.val} style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "14px", fontWeight: "500",
                display: "flex", alignItems: "center", gap: "6px",
              }}>
                {m.icon} {m.val}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        maxWidth: "1200px", margin: "0 auto",
        padding: "40px 5%",
        display: "grid",
        gridTemplateColumns: "1fr 380px",
        gap: "40px", alignItems: "start",
      }}>

        {/* ── LEFT COLUMN ── */}
        <div>

          {/* TABS */}
          <div style={{
            display: "flex",
            borderBottom: "2px solid var(--border)",
            marginBottom: "32px", flexWrap: "wrap",
          }}>
            {[
              { key: "overview",  label: "Overview",                              show: true },
              { key: "itinerary", label: `Itinerary (${itinerary.length} Days)`, show: hasItinerary },
              { key: "gallery",   label: `Gallery (${images.length})`,            show: hasGallery },
              { key: "virtual", label: `🌐 Virtual Tour (${virtualScenes.length})`, show: hasVirtualTour },
            ].filter(t => t.show).map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  padding: "12px 24px",
                  fontSize: "14px", fontWeight: "600",
                  border: "none", background: "transparent",
                  color: activeTab === t.key ? "var(--green-700)" : "var(--text-muted)",
                  borderBottom: activeTab === t.key ? "2px solid var(--green-600)" : "2px solid transparent",
                  marginBottom: "-2px",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px", fontWeight: "700",
                color: "var(--text-primary)", marginBottom: "16px",
              }}>
                About This Tour
              </h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.9", fontSize: "15px" }}>
                {desc}
              </p>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: "16px", marginTop: "32px",
              }}>
                {[
                  { icon: "🕐", label: "Duration",   val: duration },
                  { icon: "💺", label: "Seats Left", val: `${remainingSeats} seats` },
                  { icon: "📍", label: "Location",   val: location },
                  { icon: "🏷️", label: "Category",  val: category },
                ].map((s) => (
                  <div key={s.label} style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "12px", padding: "18px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>{s.icon}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500", marginBottom: "4px" }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>
                      {s.val}
                    </div>
                  </div>
                ))}
              </div>

              {hasItinerary && (
                <div style={{ marginTop: "36px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "20px", fontWeight: "700", color: "var(--text-primary)",
                    }}>
                      Tour Itinerary
                    </h3>
                    {itinerary.length > 3 && (
                      <button
                        onClick={() => setActiveTab("itinerary")}
                        style={{
                          background: "var(--green-50)", color: "var(--green-700)",
                          border: "1.5px solid var(--green-200)",
                          padding: "6px 16px", borderRadius: "50px",
                          fontSize: "12px", fontWeight: "600", cursor: "pointer",
                        }}
                      >
                        View All {itinerary.length} Days →
                      </button>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {itinerary.slice(0, 3).map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: "16px", paddingBottom: "16px", position: "relative" }}>
                        {i < Math.min(2, itinerary.slice(0, 3).length - 1) && (
                          <div style={{
                            position: "absolute", left: "17px", top: "36px",
                            width: "2px", height: "calc(100% - 8px)",
                            background: "var(--green-100)",
                          }} />
                        )}
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "50%",
                          background: "var(--green-600)", color: "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "12px", fontWeight: "700", flexShrink: 0, zIndex: 1,
                        }}>
                          {item.day}
                        </div>
                        <div style={{
                          background: "var(--bg-card)", border: "1px solid var(--border)",
                          borderRadius: "10px", padding: "14px 18px", flex: 1,
                        }}>
                          <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "6px" }}>
                            Day {item.day}
                          </h4>
                          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.7" }}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {itinerary.length > 3 && (
                    <button
                      onClick={() => setActiveTab("itinerary")}
                      style={{
                        width: "100%", marginTop: "8px",
                        background: "var(--green-50)", color: "var(--green-700)",
                        border: "1.5px solid var(--green-200)",
                        padding: "12px", borderRadius: "10px",
                        fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "var(--green-600)"; e.currentTarget.style.color = "white"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "var(--green-50)"; e.currentTarget.style.color = "var(--green-700)"; }}
                    >
                      See All {itinerary.length} Days →
                    </button>
                  )}
                </div>
              )}

              {weather && weather.temperature !== "N/A" && (
                <div style={{
                  marginTop: "28px",
                  background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                  borderRadius: "14px", padding: "20px 24px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexWrap: "wrap", gap: "12px",
                }}>
                  <div>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>
                      Live Weather in {location}
                    </p>
                    <p style={{ fontSize: "32px", fontWeight: "700", color: "white", lineHeight: 1 }}>
                      {Math.round(weather.temperature)}°C
                    </p>
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", textTransform: "capitalize", marginTop: "4px" }}>
                      {weather.condition}
                    </p>
                  </div>
                  <div style={{ fontSize: "56px" }}>🌤️</div>
                </div>
              )}
            </div>
          )}

          {/* ITINERARY TAB */}
          {activeTab === "itinerary" && (
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px", fontWeight: "700",
                color: "var(--text-primary)", marginBottom: "8px",
              }}>
                Day by Day Itinerary
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "28px" }}>
                {itinerary.length} {itinerary.length === 1 ? "day" : "days"} planned for this tour
              </p>
              {itinerary.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "48px 24px",
                  background: "var(--bg-card)", borderRadius: "14px", border: "1px solid var(--border)",
                }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>🗓️</div>
                  <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>No itinerary added yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {itinerary.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: "20px", paddingBottom: "24px", position: "relative" }}>
                      {i < itinerary.length - 1 && (
                        <div style={{
                          position: "absolute", left: "19px", top: "40px",
                          width: "2px", height: "calc(100% - 12px)", background: "var(--green-100)",
                        }} />
                      )}
                      <div style={{
                        width: "40px", height: "40px", borderRadius: "50%",
                        background: "var(--green-600)", color: "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "13px", fontWeight: "700", flexShrink: 0, zIndex: 1,
                      }}>
                        {item.day}
                      </div>
                      <div style={{
                        background: "var(--bg-card)", border: "1px solid var(--border)",
                        borderRadius: "12px", padding: "16px 20px", flex: 1,
                      }}>
                        <h4 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "8px" }}>
                          Day {item.day}
                        </h4>
                        <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.7" }}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
         {/* GALLERY TAB */}
          {activeTab === "gallery" && (
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px", fontWeight: "700",
                color: "var(--text-primary)", marginBottom: "20px",
              }}>
                Photo Gallery
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                {images.map((img, i) => (
                  <div key={i} style={{ borderRadius: "10px", overflow: "hidden", height: "160px" }}>
                    <img
                      src={img} alt={`${title} ${i + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                      onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
                      onMouseLeave={e => e.target.style.transform = "scale(1)"}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIRTUAL TOUR TAB */}
          {activeTab === "virtual" && (
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px", fontWeight: "700",
                color: "var(--text-primary)", marginBottom: "8px",
              }}>
                Virtual 3D Tour
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "28px" }}>
                Explore this destination virtually before you book.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {virtualScenes.map((scene, i) => (
                  <div key={i} style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "16px", overflow: "hidden",
                  }}>
                    <img
                      src={scene.imageUrl}
                      alt={scene.title || `Scene ${i + 1}`}
                      style={{ width: "100%", height: "320px", objectFit: "cover" }}
                    />
                    <div style={{ padding: "18px 20px" }}>
                      {scene.title && (
                        <h3 style={{
                          fontSize: "16px", fontWeight: "700",
                          color: "var(--text-primary)", marginBottom: "8px",
                        }}>
                          {scene.title}
                        </h3>
                      )}
                      {scene.description && (
                        <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.7" }}>
                          {scene.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            {tour.virtualTourLink && (
                <a
                  href={tour.virtualTourLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    marginTop: "24px",
                    background: "var(--green-600)", color: "white",
                    padding: "13px 28px", borderRadius: "50px",
                    fontSize: "14px", fontWeight: "600",
                    textDecoration: "none",
                    boxShadow: "0 4px 16px rgba(22,163,74,0.3)",
                  }}
                >
                  🌐 Open Full Virtual Tour
                </a>
              )}

            </div>
          )}

        </div>
       
         

        {/* ── RIGHT COLUMN ── */}
        <div style={{ position: "sticky", top: "90px" }}>

          {/* Price header */}
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "16px 16px 0 0", padding: "20px 24px",
            borderBottom: "none",
          }}>
            <div style={{ marginBottom: "4px" }}>
              <span style={{
                fontSize: "30px", fontWeight: "700",
                color: "var(--green-700)", fontFamily: "'Playfair Display', serif",
              }}>
                Rs. {Number(price).toLocaleString()}
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: "14px" }}> /seat</span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Prices in Pakistani Rupees</p>
          </div>

          {/* Departure Selector */}
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)",
            padding: "16px 24px 0",
          }}>
            <DepartureSelector
              departures={departures}
              selectedId={selectedDeparture?._id}
              onSelect={handleSelectDeparture}
            />
          </div>

          {/* Transport Info */}
          {selectedDeparture && (
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderTop: "none", padding: "0 24px",
            }}>
              <TransportInfo departure={selectedDeparture} />
            </div>
          )}

          {/* Seat Map */}
          {selectedDeparture && (
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderTop: "none", padding: "0 24px 16px",
            }}>
              <div style={{
                fontSize: "12px", fontWeight: "700", color: "var(--text-muted)",
                letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px",
              }}>
                Select Your Seats
              </div>
              <SeatLegend />
              <SeatMap
                departure={selectedDeparture}
                selectedSeats={selectedSeats}
                onToggleSeat={handleToggleSeat}
              />
            </div>
          )}

          {/* Booking Summary + CTA */}
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderTop: "none", borderRadius: "0 0 16px 16px",
            padding: "16px 24px 24px",
            boxShadow: "0 4px 24px var(--shadow)",
          }}>
            <BookingSummary
              departure={selectedDeparture}
              selectedSeats={selectedSeats}
              price={price}
              onBook={handleBook}
              loading={bookingLoading}
              user={user}
            />

            {/* Payment methods */}
            <div style={{
              marginTop: "16px", padding: "14px",
              background: "var(--bg-subtle)",
              borderRadius: "10px", border: "1px solid var(--border)",
            }}>
              <p style={{
                fontSize: "11px", fontWeight: "600",
                color: "var(--text-muted)", textAlign: "center",
                marginBottom: "10px", letterSpacing: "0.5px", textTransform: "uppercase",
              }}>
                We Accept
              </p>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                {[
                  { label: "EasyPaisa",     color: "#00a651", bg: "#e8f8f0" },
                  { label: "JazzCash",      color: "#cc0000", bg: "#fff0f0" },
                  { label: "Bank Transfer", color: "#1a56db", bg: "#eff6ff" },
                ].map(pm => (
                  <span key={pm.label} style={{
                    fontSize: "10px", fontWeight: "700",
                    padding: "3px 10px", borderRadius: "50px",
                    background: pm.bg, color: pm.color,
                    border: `1px solid ${pm.color}30`,
                  }}>
                    {pm.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}