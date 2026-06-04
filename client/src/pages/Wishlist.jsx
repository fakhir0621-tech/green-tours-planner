import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TourCard from "../components/TourCard";

const BASE_URL = "http://localhost:5000/api";

const FALLBACK_WISHLIST = [
  {
    _id: "1", title: "Swiss Alps Trek", city: "Switzerland",
    category: "Adventure", duration: "8 Days", price: 2499,
    rating: 4.9, reviews: 128, difficulty: "Moderate",
    photo: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80",
  },
  {
    _id: "5", title: "Kyoto Cultural Tour", city: "Japan",
    category: "Culture", duration: "7 Days", price: 2899,
    rating: 5.0, reviews: 183, difficulty: "Easy",
    photo: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80",
  },
  {
    _id: "8", title: "Maldives Island Hop", city: "Maldives",
    category: "Beach", duration: "7 Days", price: 4299,
    rating: 5.0, reviews: 421, difficulty: "Easy",
    photo: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80",
  },
];

export default function Wishlist() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const fetchWishlist = async () => {
      try {
        const res = await fetch(`${BASE_URL}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const list = data.wishlist || data.tours || data.data || data;
        setWishlist(Array.isArray(list) && list.length > 0 ? list : FALLBACK_WISHLIST);
      } catch {
        setWishlist(FALLBACK_WISHLIST);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
    window.scrollTo(0, 0);
  }, [user, token, navigate]);

  const handleRemove = async (tourId) => {
    setRemoving(tourId);
    try {
      await fetch(`${BASE_URL}/wishlist/${tourId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist((prev) => prev.filter((t) => (t._id || t.id) !== tourId));
    } catch {
      setWishlist((prev) => prev.filter((t) => (t._id || t.id) !== tourId));
    } finally {
      setRemoving(null);
    }
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
      <p style={{ color: "var(--gray-400)" }}>Loading your wishlist...</p>
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
          ❤️ My Wishlist
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px" }}>
          {wishlist.length} saved {wishlist.length === 1 ? "tour" : "tours"}
        </p>
      </div>

      <div style={{ padding: "40px 6%" }}>

        {/* EMPTY STATE */}
        {wishlist.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🤍</div>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "24px", color: "var(--gray-800)", marginBottom: "10px",
            }}>
              Your wishlist is empty
            </h3>
            <p style={{
              color: "var(--gray-400)", fontSize: "15px", marginBottom: "28px",
            }}>
              Save tours you love by clicking the heart icon on any tour card.
            </p>
            <Link to="/tours" style={{
              background: "var(--green-600)", color: "white",
              padding: "13px 32px", borderRadius: "50px",
              fontSize: "14px", fontWeight: "500",
              display: "inline-block",
            }}>
              Browse Tours
            </Link>
          </div>
        )}

        {/* WISHLIST GRID */}
        {wishlist.length > 0 && (
          <>
            {/* SUMMARY BAR */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: "28px",
              flexWrap: "wrap", gap: "12px",
            }}>
              <p style={{ fontSize: "14px", color: "var(--gray-400)" }}>
                You have{" "}
                <span style={{ color: "var(--gray-800)", fontWeight: "600" }}>
                  {wishlist.length}
                </span>{" "}
                saved {wishlist.length === 1 ? "tour" : "tours"}
              </p>
              <button
                onClick={() => {
                  if (window.confirm("Clear your entire wishlist?")) {
                    setWishlist([]);
                  }
                }}
                style={{
                  background: "none",
                  color: "#dc2626",
                  border: "1.5px solid #fecaca",
                  padding: "8px 20px", borderRadius: "50px",
                  fontSize: "13px", fontWeight: "500",
                  cursor: "pointer", transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.target.style.background = "#fef2f2";
                }}
                onMouseLeave={e => {
                  e.target.style.background = "none";
                }}
              >
                Clear All
              </button>
            </div>

            {/* CARDS GRID */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
              gap: "24px",
            }}>
              {wishlist.map((tour) => (
                <div key={tour._id || tour.id} style={{ position: "relative" }}>
                  <TourCard tour={tour} />

                  {/* REMOVE BUTTON OVERLAY */}
                  <button
                    onClick={() => handleRemove(tour._id || tour.id)}
                    disabled={removing === (tour._id || tour.id)}
                    style={{
                      position: "absolute", top: "52px", right: "12px",
                      background: removing === (tour._id || tour.id)
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(255,255,255,0.92)",
                      border: "none",
                      borderRadius: "50px",
                      padding: "5px 12px",
                      fontSize: "11px", fontWeight: "600",
                      color: "#dc2626",
                      cursor: removing === (tour._id || tour.id)
                        ? "not-allowed" : "pointer",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                      transition: "all 0.2s",
                      zIndex: 10,
                    }}
                  >
                    {removing === (tour._id || tour.id) ? "Removing..." : "✕ Remove"}
                  </button>
                </div>
              ))}
            </div>

            {/* BOTTOM CTA */}
            <div style={{
              textAlign: "center", marginTop: "52px",
              padding: "40px",
              background: "white",
              borderRadius: "16px",
              border: "1px solid var(--gray-100)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>🌍</div>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "20px", fontWeight: "700",
                color: "var(--gray-800)", marginBottom: "8px",
              }}>
                Ready to Book One?
              </h3>
              <p style={{
                color: "var(--gray-400)", fontSize: "14px", marginBottom: "20px",
              }}>
                Turn your saved tours into real adventures.
              </p>
              <Link to="/tours" style={{
                background: "var(--green-600)", color: "white",
                padding: "12px 28px", borderRadius: "50px",
                fontSize: "14px", fontWeight: "500",
                display: "inline-block",
              }}>
                Explore More Tours →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}