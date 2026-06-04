import { useState, useEffect, useCallback } from "react";
import Hero from "../components/Hero";
import TourCard from "../components/TourCard";
import FilterBar from "../components/FilterBar";
import { toursAPI } from "../services/api";

// ---- ANIMATED REVIEW CARD ----
function ReviewCard({ r }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "16px",
      padding: "22px 24px",
      minWidth: "300px",
      maxWidth: "320px",
      flexShrink: 0,
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "14px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "50%",
            background: "linear-gradient(135deg, #4ade80, #16a34a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", fontWeight: "700", color: "white",
            flexShrink: 0,
          }}>
            {r.name[0]}
          </div>
          <div>
            <p style={{
              fontSize: "13px", fontWeight: "600",
              color: "white", margin: 0,
            }}>{r.name}</p>
            <p style={{
              fontSize: "11px", color: "rgba(255,255,255,0.45)",
              margin: 0,
            }}>{r.location}</p>
          </div>
        </div>
        <span style={{ fontSize: "13px", color: "#f59e0b", letterSpacing: "1px" }}>
          {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
        </span>
      </div>
      <p style={{
        fontSize: "13px", color: "rgba(255,255,255,0.75)",
        lineHeight: "1.75", marginBottom: "12px",
        fontStyle: "italic",
      }}>
        "{r.text}"
      </p>
      <p style={{
        fontSize: "11px", color: "#4ade80",
        fontWeight: "600", letterSpacing: "0.3px",
      }}>
        🌿 {r.tour}
      </p>
    </div>
  );
}

// ---- MARQUEE REVIEWS SECTION ----
function ReviewsMarquee() {
  const REVIEWS = [
    { name: "Sarah M.",   location: "New York, USA",     rating: 5, text: "The Swiss Alps trek was beyond words. Every single detail was absolutely perfect!",        tour: "Swiss Alps Trek" },
    { name: "James O.",   location: "London, UK",        rating: 5, text: "Bali Eco Retreat changed my perspective on sustainable travel forever.",                   tour: "Bali Eco Retreat" },
    { name: "Priya S.",   location: "Mumbai, India",     rating: 5, text: "Kyoto Cultural Tour was an unforgettable spiritual journey I'll treasure always.",          tour: "Kyoto Cultural Tour" },
    { name: "Carlos R.",  location: "Madrid, Spain",     rating: 4, text: "Santorini exceeded every expectation I had. Absolutely breathtaking views!",                tour: "Santorini Escape" },
    { name: "Aisha K.",   location: "Dubai, UAE",        rating: 5, text: "The guides were extraordinary. Maldives was pure paradise — we never wanted to leave.",    tour: "Maldives Island Hop" },
    { name: "Tom W.",     location: "Sydney, Australia", rating: 5, text: "Patagonia was wild and raw. GreenTours nailed every logistical detail perfectly.",         tour: "Patagonia Expedition" },
    { name: "Yuki T.",    location: "Tokyo, Japan",      rating: 5, text: "Amazon Rainforest was humbling. Our guide's knowledge of wildlife was simply incredible.",  tour: "Amazon Rainforest" },
    { name: "Fatima A.",  location: "Cairo, Egypt",      rating: 4, text: "Sahara Desert Safari was magical — the starlit nights made everything worthwhile.",        tour: "Sahara Desert Safari" },
  ];

  const ROW1 = REVIEWS;
  const ROW2 = [...REVIEWS].reverse();

  return (
    <section style={{
      background: "linear-gradient(160deg, #052e16 0%, #14532d 60%, #052e16 100%)",
      padding: "80px 0",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes marqueeLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        /* Reviews section header */
        .reviews-header {
          text-align: center;
          margin-bottom: 52px;
          padding: 0 6%;
        }
        @media (max-width: 480px) {
          .reviews-header { margin-bottom: 36px; padding: 0 5%; }
          .reviews-rating-row { flex-direction: column; gap: 4px !important; }
          .reviews-rating-row span:first-child { font-size: 16px !important; }
        }

        /* Trust bar at bottom of reviews */
        .reviews-trust-bar {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 52px;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 36px;
          padding-left: 6%;
          padding-right: 6%;
        }
        .reviews-trust-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          flex: 1;
          min-width: 180px;
          justify-content: center;
        }
        .reviews-trust-item:not(:last-child) {
          border-right: 1px solid rgba(255,255,255,0.1);
        }
        @media (max-width: 700px) {
          .reviews-trust-bar {
            flex-direction: column;
            margin-top: 36px;
            padding-left: 5%;
            padding-right: 5%;
          }
          .reviews-trust-item {
            justify-content: flex-start;
            padding: 11px 0;
            min-width: 100%;
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.08);
          }
          .reviews-trust-item:last-child { border-bottom: none; }
        }

        /* Slow marquee on mobile to stay readable */
        @media (max-width: 600px) {
          .marquee-row-1 { animation-duration: 28s !important; }
          .marquee-row-2 { animation-duration: 34s !important; }
        }
      `}</style>

      {/* SECTION HEADER */}
      <div className="reviews-header">
        <p style={{
          fontSize: "11px", letterSpacing: "3px",
          color: "#4ade80", fontWeight: "600",
          textTransform: "uppercase", marginBottom: "14px",
        }}>
          TRAVELER STORIES
        </p>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(26px, 3.5vw, 42px)",
          fontWeight: "700", color: "white",
          lineHeight: "1.2", marginBottom: "16px",
        }}>
          What Our Travelers Say
        </h2>
        <p style={{
          color: "rgba(255,255,255,0.55)", fontSize: "15px",
          maxWidth: "480px", margin: "0 auto 20px", lineHeight: "1.8",
        }}>
          Real stories from real adventurers who explored the world with us.
        </p>
        <div className="reviews-rating-row" style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: "10px",
        }}>
          <span style={{ fontSize: "20px", letterSpacing: "3px", color: "#f59e0b" }}>
            ★★★★★
          </span>
          <span style={{
            color: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: "500",
          }}>
            4.9 average · 1,200+ verified reviews
          </span>
        </div>
      </div>

      {/* MARQUEE ROW 1 — left to right */}
      <div style={{ overflow: "hidden", marginBottom: "16px" }}>
        <div className="marquee-row-1" style={{
          display: "flex", gap: "16px",
          width: "max-content",
          animation: "marqueeLeft 40s linear infinite",
        }}>
          {[...ROW1, ...ROW1].map((r, i) => (
            <ReviewCard key={`r1-${i}`} r={r} />
          ))}
        </div>
      </div>

      {/* MARQUEE ROW 2 — right to left */}
      <div style={{ overflow: "hidden" }}>
        <div className="marquee-row-2" style={{
          display: "flex", gap: "16px",
          width: "max-content",
          animation: "marqueeRight 48s linear infinite",
        }}>
          {[...ROW2, ...ROW2].map((r, i) => (
            <ReviewCard key={`r2-${i}`} r={r} />
          ))}
        </div>
      </div>

      {/* BOTTOM TRUST BAR */}
      <div className="reviews-trust-bar">
        {[
          { icon: "✅", label: "Free cancellation up to 7 days" },
          { icon: "🛡️", label: "Secure & encrypted payments" },
          { icon: "🌿", label: "10% goes to conservation" },
          { icon: "🎯", label: "Expert-certified local guides" },
        ].map((b) => (
          <div key={b.label} className="reviews-trust-item">
            <span style={{ fontSize: "16px" }}>{b.icon}</span>
            <span style={{
              fontSize: "12px", color: "rgba(255,255,255,0.55)", fontWeight: "500",
            }}>{b.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---- MAIN HOME COMPONENT ----
export default function Home() {
  const [tours, setTours]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [location, setLocation] = useState("");

  const fetchTours = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)             params.keyword  = search;
      if (location)           params.location = location;
      if (category !== "All") params.category = category;
      if (minPrice)           params.minPrice = minPrice;
      if (maxPrice)           params.maxPrice = maxPrice;

      const data = await toursAPI.getAll(params);
      const list = Array.isArray(data) ? data : (data.tours || data.data || []);
      setTours(list);
    } catch (err) {
      console.error("Failed to fetch tours:", err);
      setTours([]);
    } finally {
      setLoading(false);
    }
  }, [search, location, category, minPrice, maxPrice]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchTours(); }, 500);
    return () => clearTimeout(timer);
  }, [fetchTours]);

  return (
    <div>
      <style>{`
        /* ── STATS BAR ── */
        .home-stats-bar {
          background: var(--bg-card);
          box-shadow: 0 4px 20px var(--shadow);
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
        }
        .home-stat-item {
          padding: 28px 40px;
          text-align: center;
          flex: 1;
          min-width: 120px;
          transition: background 0.2s;
        }
        .home-stat-num {
          font-size: 28px;
          font-weight: 700;
          color: var(--green-700);
          font-family: 'Playfair Display', serif;
        }
        .home-stat-label {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 4px;
          font-weight: 500;
        }

        /* On tablet: 2×2 grid */
        @media (max-width: 640px) {
          .home-stat-item {
            padding: 22px 16px;
            min-width: 50%;
            max-width: 50%;
            /* reset all right borders then re-apply selectively */
            border-right: none !important;
          }
          .home-stat-item:nth-child(1),
          .home-stat-item:nth-child(3) {
            border-right: 1px solid var(--border) !important;
          }
          .home-stat-item:nth-child(1),
          .home-stat-item:nth-child(2) {
            border-bottom: 1px solid var(--border);
          }
          .home-stat-num  { font-size: 24px; }
          .home-stat-label { font-size: 12px; }
        }

        /* ── TOURS SECTION ── */
        .home-tours-section {
          padding: 80px 6%;
        }
        .home-tours-header-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 3px;
          color: var(--green-600);
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .home-tours-header-sub {
          color: var(--text-secondary);
          max-width: 520px;
          line-height: 1.7;
          margin-top: 14px;
          font-size: 15px;
        }

        @media (max-width: 768px) {
          .home-tours-section { padding: 56px 5%; }
          .home-tours-header-sub { font-size: 14px; }
        }
        @media (max-width: 480px) {
          .home-tours-section { padding: 44px 5%; }
          .home-tours-header-label { letter-spacing: 2px; font-size: 11px; }
          .home-tours-header-sub { font-size: 14px; margin-top: 10px; }
        }

        /* ── TOUR GRID ── */
        .home-tour-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          margin-top: 28px;
        }
        @media (max-width: 640px) {
          .home-tour-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }
        }
        @media (min-width: 641px) and (max-width: 900px) {
          .home-tour-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }

        /* ── CTA BANNER ── */
        .home-cta-banner {
          background: linear-gradient(135deg, var(--green-700), var(--green-900));
          padding: 72px 6%;
          text-align: center;
        }
        .home-cta-desc {
          color: rgba(255,255,255,0.65);
          font-size: 16px;
          margin-bottom: 36px;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.8;
        }
        .home-cta-buttons {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .home-cta-btn-primary {
          background: white;
          color: var(--green-800);
          padding: 14px 36px;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 600;
          display: inline-block;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          text-decoration: none;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .home-cta-btn-secondary {
          background: rgba(255,255,255,0.12);
          color: white;
          border: 1.5px solid rgba(255,255,255,0.3);
          padding: 14px 32px;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 500;
          display: inline-block;
          text-decoration: none;
          transition: all 0.2s;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .home-cta-banner { padding: 56px 5%; }
          .home-cta-desc   { font-size: 15px; }
        }
        @media (max-width: 480px) {
          .home-cta-banner { padding: 48px 5%; }
          .home-cta-buttons {
            flex-direction: column;
            align-items: center;
          }
          .home-cta-btn-primary,
          .home-cta-btn-secondary {
            width: 100%;
            max-width: 300px;
            text-align: center;
            padding: 14px 24px;
          }
          .home-cta-desc { font-size: 14px; }
        }

        /* ── VIEW ALL BUTTON ── */
        .home-view-all-btn {
          background: var(--green-600);
          color: white;
          padding: 14px 40px;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 600;
          display: inline-block;
          box-shadow: 0 4px 20px rgba(22,163,74,0.35);
          transition: all 0.2s;
          text-decoration: none;
        }
        @media (max-width: 480px) {
          .home-view-all-btn {
            padding: 13px 32px;
            font-size: 14px;
          }
        }

        /* ── LOADING / EMPTY STATE ── */
        @media (max-width: 480px) {
          .home-empty-icon { font-size: 40px !important; }
          .home-empty-title { font-size: 19px !important; }
        }
      `}</style>

      {/* HERO SLIDER */}
      <Hero />

      {/* STATS BAR */}
      <div className="home-stats-bar">
        {[
          { num: "12K+", label: "Happy Travelers" },
          { num: "85+",  label: "Destinations" },
          { num: "4.9★", label: "Average Rating" },
          { num: "150+", label: "Tour Packages" },
        ].map((s, i, arr) => (
          <div
            key={s.label}
            className="home-stat-item"
            style={{
              borderRight: i < arr.length - 1 ? "1px solid var(--border)" : "none",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--green-50)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--bg-card)"}
          >
            <div className="home-stat-num">{s.num}</div>
            <div className="home-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ANIMATED REVIEWS SECTION */}
      <ReviewsMarquee />

      {/* TOURS SECTION */}
      <div className="home-tours-section">

        {/* SECTION HEADER */}
        <div style={{ marginBottom: "12px" }}>
          <p className="home-tours-header-label">
            OUR PACKAGES
          </p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(28px, 3.5vw, 42px)",
            fontWeight: "700", color: "var(--text-primary)",
            lineHeight: "1.2",
          }}>
            Discover{" "}
            <span style={{ color: "var(--green-600)" }}>Extraordinary</span>{" "}
            Places
          </h2>
          <p className="home-tours-header-sub">
            Handcrafted tours designed around your sense of adventure.
          </p>
        </div>

        {/* FILTER */}
        <div style={{ marginTop: "36px" }}>
          <FilterBar
            search={search}     setSearch={setSearch}
            category={category} setCategory={setCategory}
            minPrice={minPrice} setMinPrice={setMinPrice}
            maxPrice={maxPrice} setMaxPrice={setMaxPrice}
            location={location} setLocation={setLocation}
          />
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{
              width: "48px", height: "48px",
              border: "4px solid var(--green-100)",
              borderTop: "4px solid var(--green-500)",
              borderRadius: "50%", margin: "0 auto 16px",
              animation: "spin 0.8s linear infinite",
            }} />
            <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
              Loading tours...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* NO RESULTS */}
        {!loading && tours.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div className="home-empty-icon" style={{ fontSize: "52px", marginBottom: "16px" }}>🔭</div>
            <h3 className="home-empty-title" style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "22px", color: "var(--text-primary)",
              marginBottom: "10px",
            }}>
              No tours found
            </h3>
            <p style={{ fontSize: "15px", color: "var(--text-muted)" }}>
              Try adjusting your search or filters.
            </p>
          </div>
        )}

        {/* TOUR GRID */}
        {!loading && tours.length > 0 && (
          <div className="home-tour-grid">
            {tours.slice(0, 6).map((tour) => (
              <TourCard key={tour._id} tour={tour} />
            ))}
          </div>
        )}

        {/* VIEW ALL BUTTON */}
        {!loading && tours.length > 6 && (
          <div style={{ textAlign: "center", marginTop: "48px" }}>
            <a
              href="/tours"
              className="home-view-all-btn"
              onMouseEnter={e => {
                e.currentTarget.style.background = "var(--green-700)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "var(--green-600)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              View All {tours.length} Tours →
            </a>
          </div>
        )}
      </div>

      {/* CTA BANNER */}
      <div className="home-cta-banner">
        <p style={{
          fontSize: "11px", letterSpacing: "3px",
          color: "#4ade80", fontWeight: "600",
          textTransform: "uppercase", marginBottom: "16px",
        }}>
          READY TO EXPLORE?
        </p>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(26px, 3.5vw, 44px)",
          fontWeight: "700", color: "white",
          marginBottom: "16px", lineHeight: "1.2",
        }}>
          Your Next Adventure Awaits
        </h2>
        <p className="home-cta-desc">
          Join 12,000+ travelers who have made unforgettable memories with GreenTours.
        </p>
        <div className="home-cta-buttons">
          <a
            href="/tours"
            className="home-cta-btn-primary"
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            Browse All Tours →
          </a>
          <a
            href="/about"
            className="home-cta-btn-secondary"
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
          >
            Our Story
          </a>
        </div>
      </div>
    </div>
  );
}