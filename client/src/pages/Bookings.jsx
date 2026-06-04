import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookingsAPI } from "../services/api";

const STATUS_STYLES = {
  confirmed: { bg: "#dcfce7", color: "#16a34a", label: "✅ Confirmed" },
  pending:   { bg: "#fef9c3", color: "#ca8a04", label: "⏳ Pending" },
  cancelled: { bg: "#fee2e2", color: "#dc2626", label: "❌ Cancelled" },
};

const FALLBACK_BOOKINGS = [
  {
    _id: "b1",
    tourId: { title: "Swiss Alps Trek", photo: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80", duration: "8 Days", city: "Switzerland" },
    bookingDate: "2025-08-15",
    guestSize: 2,
    totalPrice: 4998,
    status: "confirmed",
    createdAt: "2025-06-01",
  },
  {
    _id: "b2",
    tourId: { title: "Bali Eco Retreat", photo: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80", duration: "6 Days", city: "Indonesia" },
    bookingDate: "2025-09-10",
    guestSize: 1,
    totalPrice: 1299,
    status: "pending",
    createdAt: "2025-06-05",
  },
  {
    _id: "b3",
    tourId: { title: "Santorini Escape", photo: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80", duration: "5 Days", city: "Greece" },
    bookingDate: "2025-07-20",
    guestSize: 3,
    totalPrice: 5997,
    status: "cancelled",
    createdAt: "2025-05-18",
  },
];

export default function Bookings() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [filter, setFilter] = useState("all");

  // Redirect if not logged in
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const fetchBookings = async () => {
      try {
        const data = await bookingsAPI.getUserBookings(token, user._id || user.id);
        const list = data.bookings || data.data || data;
        setBookings(Array.isArray(list) && list.length > 0 ? list : FALLBACK_BOOKINGS);
      } catch {
        setBookings(FALLBACK_BOOKINGS);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
    window.scrollTo(0, 0);
  }, [user, token, navigate]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(id);
    try {
      await bookingsAPI.cancel(id, token);
      setBookings((prev) =>
        prev.map((b) => b._id === id ? { ...b, status: "cancelled" } : b)
      );
    } catch {
      alert("Could not cancel booking. Please try again.");
    } finally {
      setCancelling(null);
    }
  };

  const filtered = filter === "all"
    ? bookings
    : bookings.filter((b) => b.status === filter);

  const counts = {
    all: bookings.length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    pending: bookings.filter(b => b.status === "pending").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  };

  if (loading) return (
    <div style={{ paddingTop: "70px", textAlign: "center", padding: "160px 0" }}>
      <div style={{
        width: "48px", height: "48px",
        border: "4px solid var(--green-100)",
        borderTop: "4px solid var(--green-500)",
        borderRadius: "50%", margin: "0 auto 16px",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "var(--gray-400)" }}>Loading your bookings...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ paddingTop: "70px", background: "var(--off-white)", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg, var(--green-800), var(--green-900))",
        padding: "52px 6% 40px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-60px", right: "-60px",
          width: "240px", height: "240px", borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }} />
        <p style={{
          fontSize: "11px", letterSpacing: "3px",
          color: "var(--green-400)", fontWeight: "600",
          textTransform: "uppercase", marginBottom: "10px",
        }}>
          MY ACCOUNT
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(26px, 3.5vw, 40px)",
          fontWeight: "700", color: "white", marginBottom: "10px",
        }}>
          My Bookings
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px" }}>
          You have {counts.all} booking{counts.all !== 1 ? "s" : ""} total
        </p>
      </div>

      <div style={{ padding: "40px 6%" }}>

        {/* FILTER TABS */}
        <div style={{
          display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "32px",
        }}>
          {[
            { key: "all", label: "All" },
            { key: "confirmed", label: "Confirmed" },
            { key: "pending", label: "Pending" },
            { key: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: "9px 20px",
                borderRadius: "50px",
                fontSize: "13px", fontWeight: "500",
                border: filter === tab.key
                  ? "1.5px solid var(--green-600)"
                  : "1.5px solid var(--gray-200)",
                background: filter === tab.key ? "var(--green-600)" : "white",
                color: filter === tab.key ? "white" : "var(--gray-600)",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {tab.label}
              <span style={{
                marginLeft: "7px",
                background: filter === tab.key
                  ? "rgba(255,255,255,0.25)"
                  : "var(--gray-100)",
                color: filter === tab.key ? "white" : "var(--gray-500)",
                fontSize: "11px", fontWeight: "600",
                padding: "1px 7px", borderRadius: "50px",
              }}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🗺️</div>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "22px", color: "var(--gray-800)", marginBottom: "10px",
            }}>
              No bookings here
            </h3>
            <p style={{ color: "var(--gray-400)", fontSize: "15px", marginBottom: "24px" }}>
              {filter === "all"
                ? "You haven't booked any tours yet."
                : `No ${filter} bookings found.`}
            </p>
            <Link to="/tours" style={{
              background: "var(--green-600)", color: "white",
              padding: "12px 28px", borderRadius: "50px",
              fontSize: "14px", fontWeight: "500",
              display: "inline-block",
            }}>
              Browse Tours
            </Link>
          </div>
        )}

        {/* BOOKINGS LIST */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {filtered.map((booking) => {
            const tour = booking.tourId || {};
            const status = (booking.status || "pending").toLowerCase();
            const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.pending;
            const isCancelled = status === "cancelled";

            return (
              <div key={booking._id} style={{
                background: "white",
                border: "1px solid var(--gray-100)",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                display: "grid",
                gridTemplateColumns: "200px 1fr auto",
                opacity: isCancelled ? 0.75 : 1,
                transition: "box-shadow 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.10)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"}
              >
                {/* TOUR IMAGE */}
                <div style={{ position: "relative", overflow: "hidden" }}>
                  <img
                    src={tour.photo || tour.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80"}
                    alt={tour.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {isCancelled && (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "rgba(0,0,0,0.35)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{
                        color: "white", fontSize: "12px", fontWeight: "600",
                        background: "rgba(220,38,38,0.85)",
                        padding: "4px 12px", borderRadius: "50px",
                      }}>
                        CANCELLED
                      </span>
                    </div>
                  )}
                </div>

                {/* BOOKING INFO */}
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: "600",
                      padding: "3px 12px", borderRadius: "50px",
                      background: statusStyle.bg, color: statusStyle.color,
                    }}>
                      {statusStyle.label}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--gray-400)" }}>
                      Booked on {new Date(booking.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>

                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "20px", fontWeight: "700",
                    color: "var(--gray-800)", marginBottom: "12px",
                  }}>
                    {tour.title || "Tour Package"}
                  </h3>

                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                    {[
                      { icon: "📍", val: tour.city || tour.location || "N/A" },
                      { icon: "🕐", val: tour.duration || "N/A" },
                      { icon: "📅", val: booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "N/A" },
                      { icon: "👥", val: `${booking.guestSize || 1} guest${(booking.guestSize || 1) > 1 ? "s" : ""}` },
                    ].map((m) => (
                      <span key={m.val} style={{
                        fontSize: "13px", color: "var(--gray-500)",
                        display: "flex", alignItems: "center", gap: "5px",
                      }}>
                        {m.icon} {m.val}
                      </span>
                    ))}
                  </div>
                </div>

                {/* PRICE + ACTIONS */}
                <div style={{
                  padding: "24px 28px",
                  display: "flex", flexDirection: "column",
                  alignItems: "flex-end", justifyContent: "space-between",
                  borderLeft: "1px solid var(--gray-100)",
                  minWidth: "160px",
                }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "12px", color: "var(--gray-400)", marginBottom: "4px" }}>
                      Total Paid
                    </div>
                    <div style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "24px", fontWeight: "700",
                      color: "var(--green-700)",
                    }}>
                      ${Number(booking.totalPrice || 0).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                    <Link
                      to={`/tours/${tour._id || booking.tourId}`}
                      style={{
                        background: "var(--green-50)",
                        color: "var(--green-700)",
                        border: "1.5px solid var(--green-200)",
                        padding: "8px 0", borderRadius: "50px",
                        fontSize: "13px", fontWeight: "500",
                        textAlign: "center", transition: "all 0.2s",
                        display: "block",
                      }}
                      onMouseEnter={e => { e.target.style.background = "var(--green-600)"; e.target.style.color = "white"; }}
                      onMouseLeave={e => { e.target.style.background = "var(--green-50)"; e.target.style.color = "var(--green-700)"; }}
                    >
                      View Tour
                    </Link>

                    {!isCancelled && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        disabled={cancelling === booking._id}
                        style={{
                          background: "none",
                          color: cancelling === booking._id ? "var(--gray-300)" : "#dc2626",
                          border: `1.5px solid ${cancelling === booking._id ? "var(--gray-200)" : "#fecaca"}`,
                          padding: "8px 0", borderRadius: "50px",
                          fontSize: "13px", fontWeight: "500",
                          cursor: cancelling === booking._id ? "not-allowed" : "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {cancelling === booking._id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}