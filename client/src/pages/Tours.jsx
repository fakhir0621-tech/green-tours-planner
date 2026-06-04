import { useState, useEffect, useCallback } from "react";
import TourCard from "../components/TourCard";
import FilterBar from "../components/FilterBar";
import { toursAPI } from "../services/api";

const SORT_OPTIONS = [
  { value: "default",    label: "Featured" },
  { value: "price_asc",  label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating",     label: "Top Rated" },
];

const PAGE_SIZE = 6;

export default function Tours() {
  const [tours, setTours]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort]         = useState("default");
  const [page, setPage]         = useState(1);

  const fetchTours = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)   params.keyword  = search;
      if (location) params.location = location;
      if (category !== "All") params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const data = await toursAPI.getAll(params);
      const list = Array.isArray(data) ? data : (data.tours || data.data || []);
      setTours(list);
      setPage(1);
    } catch (err) {
      console.error(err);
      setTours([]);
    } finally {
      setLoading(false);
    }
  }, [search, location, category, minPrice, maxPrice]);

  useEffect(() => {
    const timer = setTimeout(() => fetchTours(), 500);
    return () => clearTimeout(timer);
  }, [fetchTours]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Sort
  const sorted = [...tours].sort((a, b) => {
    if (sort === "price_asc")  return (a.price || 0) - (b.price || 0);
    if (sort === "price_desc") return (b.price || 0) - (a.price || 0);
    if (sort === "rating")     return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{
      paddingTop: "70px",
      background: "var(--bg)",
      minHeight: "100vh",
    }}>

      <style>{`
        /* ── PAGE HEADER ── */
        .tours-header {
          background: linear-gradient(135deg, var(--green-800), var(--green-900));
          padding: 64px 6% 48px;
          position: relative;
          overflow: hidden;
        }
        .tours-header-decoration {
          position: absolute;
          top: -80px; right: -80px;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
        }
        .tours-header-label {
          font-size: 11px;
          letter-spacing: 3px;
          color: var(--green-400);
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .tours-header-sub {
          color: rgba(255,255,255,0.65);
          font-size: 15px;
          max-width: 480px;
          line-height: 1.8;
        }
        @media (max-width: 768px) {
          .tours-header { padding: 48px 5% 36px; }
          .tours-header-decoration {
            width: 200px; height: 200px;
            top: -50px; right: -50px;
          }
        }
        @media (max-width: 480px) {
          .tours-header { padding: 40px 5% 32px; }
          .tours-header-label { font-size: 10px; letter-spacing: 2px; }
          .tours-header-sub   { font-size: 14px; }
        }

        /* ── CONTENT AREA ── */
        .tours-content {
          padding: 48px 6%;
        }
        @media (max-width: 768px) {
          .tours-content { padding: 36px 5%; }
        }
        @media (max-width: 480px) {
          .tours-content { padding: 28px 5%; }
        }

        /* ── RESULTS + SORT BAR ── */
        .tours-sort-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .tours-sort-label {
          font-size: 14px;
          color: var(--text-muted);
        }
        .tours-sort-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .tours-sort-select {
          padding: 9px 16px;
          border: 1.5px solid var(--border);
          border-radius: 50px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: var(--text-primary);
          background: var(--bg-card);
          outline: none;
          cursor: pointer;
        }
        @media (max-width: 480px) {
          .tours-sort-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 20px;
          }
          .tours-sort-right { width: 100%; }
          .tours-sort-select {
            flex: 1;
            width: 100%;
            padding: 10px 14px;
          }
        }

        /* ── TOUR GRID ── */
        .tours-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }
        @media (max-width: 640px) {
          .tours-grid {
            grid-template-columns: 1fr;
            gap: 16px;
            margin-bottom: 36px;
          }
        }
        @media (min-width: 641px) and (max-width: 960px) {
          .tours-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }

        /* ── PAGINATION ── */
        .tours-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .tours-page-btn {
          width: 40px; height: 40px;
          border-radius: 50%;
          border: 1.5px solid var(--border);
          background: var(--bg-card);
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .tours-page-btn:disabled {
          cursor: not-allowed;
          color: var(--border);
        }
        .tours-page-btn-active {
          border-color: var(--green-600) !important;
          background: var(--green-600) !important;
          color: white !important;
          font-weight: 600;
        }
        /* On very small screens, shrink page buttons slightly */
        @media (max-width: 380px) {
          .tours-page-btn { width: 36px; height: 36px; font-size: 13px; }
          .tours-pagination { gap: 6px; }
        }

        /* ── EMPTY / LOADING STATES ── */
        .tours-empty {
          text-align: center;
          padding: 100px 0;
        }
        @media (max-width: 480px) {
          .tours-empty { padding: 64px 0; }
          .tours-empty-icon  { font-size: 44px !important; }
          .tours-empty-title { font-size: 20px !important; }
        }
      `}</style>

      {/* HEADER */}
      <div className="tours-header">
        <div className="tours-header-decoration" />
        <p className="tours-header-label">
          EXPLORE OUR COLLECTION
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(28px, 4vw, 48px)",
          fontWeight: "700", color: "white",
          lineHeight: "1.2", marginBottom: "14px",
        }}>
          All Tour Packages
        </h1>
        <p className="tours-header-sub">
          {loading ? "Loading..." : `${tours.length} tours available worldwide`}
        </p>
      </div>

      {/* CONTENT */}
      <div className="tours-content">

        <FilterBar
          search={search}     setSearch={setSearch}
          category={category} setCategory={setCategory}
          minPrice={minPrice} setMinPrice={setMinPrice}
          maxPrice={maxPrice} setMaxPrice={setMaxPrice}
          location={location} setLocation={setLocation}
        />

        {/* RESULTS + SORT BAR */}
        <div className="tours-sort-bar">
          <p className="tours-sort-label">
            Showing{" "}
            <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>
              {sorted.length}
            </span>{" "}tours
          </p>

          <div className="tours-sort-right">
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Sort:</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="tours-sort-select"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <div style={{
              width: "48px", height: "48px",
              border: "4px solid var(--green-100)",
              borderTop: "4px solid var(--green-500)",
              borderRadius: "50%", margin: "0 auto 16px",
              animation: "spin 0.8s linear infinite",
            }} />
            <p style={{ color: "var(--text-muted)" }}>Loading tours...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* GRID */}
        {!loading && sorted.length > 0 && (
          <>
            <div className="tours-grid">
              {paginated.map(tour => (
                <TourCard key={tour._id} tour={tour} />
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="tours-pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="tours-page-btn"
                  style={{
                    fontSize: "16px",
                    color: page === 1 ? "var(--border)" : "var(--text-secondary)",
                  }}
                >‹</button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      setPage(p);
                      window.scrollTo({ top: 300, behavior: "smooth" });
                    }}
                    className={`tours-page-btn${p === page ? " tours-page-btn-active" : ""}`}
                    style={{
                      color: p === page ? "white" : "var(--text-secondary)",
                      fontWeight: p === page ? "600" : "400",
                    }}
                  >{p}</button>
                ))}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="tours-page-btn"
                  style={{
                    fontSize: "16px",
                    color: page === totalPages ? "var(--border)" : "var(--text-secondary)",
                  }}
                >›</button>
              </div>
            )}
          </>
        )}

        {/* EMPTY */}
        {!loading && sorted.length === 0 && (
          <div className="tours-empty">
            <div className="tours-empty-icon" style={{ fontSize: "56px", marginBottom: "16px" }}>🔭</div>
            <h3 className="tours-empty-title" style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "22px", color: "var(--text-primary)", marginBottom: "10px",
            }}>
              No tours found
            </h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
              Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}