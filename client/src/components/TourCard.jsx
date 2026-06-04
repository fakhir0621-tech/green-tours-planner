import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

// Safe import — won't crash if Account.jsx doesn't export trackTourVisit
let trackTourVisit = () => {};
try {
  const mod = require("../pages/Account");
  if (mod.trackTourVisit) trackTourVisit = mod.trackTourVisit;
} catch {}

export default function TourCard({ tour }) {
  const [hovered, setHovered]           = useState(false);
  const [wishlistAnim, setWishlistAnim] = useState(false);
  const navigate = useNavigate();
  const { user }  = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const tourId   = tour._id || tour.id;
  const wishlisted = isWishlisted(tourId);

  const title    = tour.tourName || tour.title || "Tour";
  const location = tour.location || tour.city || "Unknown";
  const price    = tour.price || 0;
  const rating   = tour.rating || 0;
  const duration = tour.duration || "N/A";
  const category = tour.category || "Tour";
  const seats    = tour.availableSeats || 0;
  const image    = tour.images?.[0] || tour.photo ||
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80";
  const weather  = tour.weather || null;

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    setWishlistAnim(true);
    await toggleWishlist(tour);
    setTimeout(() => setWishlistAnim(false), 400);
  };

  const handleBookNow = () => {
    try { trackTourVisit(tourId); } catch {}
    navigate(`/tours/${tourId}`);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-card)",
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: hovered
          ? "0 12px 40px var(--shadow-md)"
          : "0 2px 8px var(--shadow)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.3s ease",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* IMAGE */}
      <div
        onClick={handleBookNow}
        style={{
          position: "relative", height: "210px",
          overflow: "hidden", cursor: "pointer", flexShrink: 0,
        }}
      >
        <img
          src={image}
          alt={title}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover",
            transform: hovered ? "scale(1.07)" : "scale(1)",
            transition: "transform 0.5s ease",
          }}
        />

        {/* CATEGORY BADGE */}
        <span style={{
          position: "absolute", top: "12px", left: "12px",
          background: "var(--green-600)",
          color: "white", fontSize: "11px", fontWeight: "600",
          padding: "4px 12px", borderRadius: "50px",
          letterSpacing: "0.5px", pointerEvents: "none",
        }}>
          {category}
        </span>

        {/* WEATHER BADGE */}
        {weather && weather.temperature !== "N/A" && (
          <span style={{
            position: "absolute", bottom: "12px", left: "12px",
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
            color: "white", fontSize: "11px", fontWeight: "500",
            padding: "4px 10px", borderRadius: "50px",
            display: "flex", alignItems: "center", gap: "4px",
            pointerEvents: "none",
          }}>
            🌤️ {Math.round(weather.temperature)}°C · {weather.condition}
          </span>
        )}

        {/* HEART — top right of image */}
        <button
          onClick={handleWishlist}
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          style={{
            position: "absolute", top: "12px", right: "12px",
            width: "36px", height: "36px", borderRadius: "50%",
            background: wishlisted ? "#dc2626" : "rgba(255,255,255,0.92)",
            border: "none", fontSize: "17px",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
            transform: wishlistAnim ? "scale(1.4)" : "scale(1)",
            cursor: "pointer", zIndex: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {wishlisted ? "❤️" : "🤍"}
        </button>

        {/* SEATS BADGE */}
        {seats <= 5 && seats > 0 && (
          <span style={{
            position: "absolute", bottom: "12px", right: "12px",
            background: "#dc2626", color: "white",
            fontSize: "10px", fontWeight: "700",
            padding: "3px 10px", borderRadius: "50px",
            pointerEvents: "none",
          }}>
            Only {seats} left!
          </span>
        )}
      </div>

      {/* CARD BODY */}
      <div style={{
        padding: "16px 18px",
        display: "flex", flexDirection: "column",
        flex: 1,
      }}>

        {/* LOCATION */}
        <div style={{
          fontSize: "11px", color: "var(--green-600)",
          fontWeight: "600", letterSpacing: "0.5px",
          textTransform: "uppercase", marginBottom: "5px",
          display: "flex", alignItems: "center", gap: "4px",
        }}>
          📍 {location}
        </div>

        {/* TITLE */}
        <h3
          onClick={handleBookNow}
          style={{
            fontSize: "16px", fontWeight: "600",
            color: "var(--text-primary)",
            marginBottom: "10px", lineHeight: "1.3",
            cursor: "pointer", flex: 1,
          }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--green-600)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-primary)"}
        >
          {title}
        </h3>

        {/* META ROW */}
        <div style={{
          display: "flex", gap: "12px",
          marginBottom: "14px", flexWrap: "wrap",
        }}>
          <span style={{
            fontSize: "12px", color: "var(--text-muted)",
            display: "flex", alignItems: "center", gap: "4px",
          }}>
            🕐 {duration}
          </span>
          {seats > 0 && (
            <span style={{
              fontSize: "12px", color: "var(--text-muted)",
              display: "flex", alignItems: "center", gap: "4px",
            }}>
              💺 {seats} seats
            </span>
          )}
          {rating > 0 && (
            <span style={{
              fontSize: "12px", color: "var(--text-muted)",
              display: "flex", alignItems: "center", gap: "3px",
            }}>
              ⭐ {Number(rating).toFixed(1)}
            </span>
          )}
        </div>

        {/* PRICE ROW */}
        <div style={{
          paddingTop: "12px",
          borderTop: "1px solid var(--border)",
        }}>
          <div style={{
            marginBottom: "10px",
          }}>
            <span style={{
              fontSize: "22px", fontWeight: "700",
              color: "var(--green-700)",
            }}>
              Rs. {Number(price).toLocaleString()}
            </span>
            <span style={{
              fontSize: "12px", color: "var(--text-muted)",
            }}> /person</span>
          </div>

          {/* BUTTONS — stacked vertically so they never get cut off */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

            {/* BOOK NOW — full width green */}
            <button
              onClick={handleBookNow}
              style={{
                width: "100%",
                background: "var(--green-600)",
                color: "white",
                border: "none",
                padding: "10px 0", borderRadius: "50px",
                fontSize: "13px", fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
                letterSpacing: "0.3px",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "var(--green-700)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "var(--green-600)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Book Now →
            </button>

            {/* ADD TO WISHLIST — full width red outlined */}
            <button
              onClick={handleWishlist}
              style={{
                width: "100%",
                background: wishlisted ? "#fef2f2" : "transparent",
                color: "#dc2626",
                border: "1.5px solid #fecaca",
                padding: "9px 0", borderRadius: "50px",
                fontSize: "13px", fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: "6px",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#dc2626";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.borderColor = "#dc2626";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = wishlisted ? "#fef2f2" : "transparent";
                e.currentTarget.style.color = "#dc2626";
                e.currentTarget.style.borderColor = "#fecaca";
              }}
            >
              {wishlisted ? "❤️ Saved to Wishlist" : "🤍 Add to Wishlist"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}