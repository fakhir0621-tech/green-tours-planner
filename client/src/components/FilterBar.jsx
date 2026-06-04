const CATEGORIES = ["All", "Adventure", "Nature", "Culture", "Beach", "City"];

export default function FilterBar({
  search, setSearch,
  category, setCategory,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  location, setLocation,
}) {
  return (
    <div style={{ marginBottom: "36px" }}>

      {/* ROW 1 — CATEGORY TABS */}
      <div style={{
        display: "flex", gap: "8px",
        flexWrap: "wrap", marginBottom: "16px",
      }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: "9px 20px", borderRadius: "50px",
              fontSize: "13px", fontWeight: "500",
              border: category === cat
                ? "1.5px solid var(--green-600)"
                : "1.5px solid var(--border)",
              background: category === cat
                ? "var(--green-600)" : "var(--bg-card)",
              color: category === cat ? "white" : "var(--text-secondary)",
              boxShadow: category === cat
                ? "0 2px 10px rgba(22,163,74,0.3)" : "none",
              transition: "all 0.2s",
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ROW 2 — SEARCH + LOCATION + PRICE */}
      <div style={{
        display: "flex", gap: "12px",
        flexWrap: "wrap", alignItems: "center",
      }}>

        {/* KEYWORD SEARCH */}
        <div style={{ position: "relative", flex: "2", minWidth: "200px" }}>
          <span style={{
            position: "absolute", left: "14px", top: "50%",
            transform: "translateY(-50%)",
            fontSize: "15px", pointerEvents: "none",
          }}>🔍</span>
          <input
            type="text"
            placeholder="Search tours..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 16px 10px 40px",
              border: "1.5px solid var(--border)",
              borderRadius: "50px", fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              outline: "none", transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "var(--green-400)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />
        </div>

        {/* LOCATION */}
        <div style={{ position: "relative", flex: "1", minWidth: "160px" }}>
          <span style={{
            position: "absolute", left: "14px", top: "50%",
            transform: "translateY(-50%)",
            fontSize: "14px", pointerEvents: "none",
          }}>📍</span>
          <input
            type="text"
            placeholder="Location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{
              width: "100%", padding: "10px 16px 10px 36px",
              border: "1.5px solid var(--border)",
              borderRadius: "50px", fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              outline: "none", transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "var(--green-400)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />
        </div>

        {/* MIN PRICE */}
        <input
          type="number"
          placeholder="Min $"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={{
            width: "100px", padding: "10px 14px",
            border: "1.5px solid var(--border)",
            borderRadius: "50px", fontSize: "13px",
            fontFamily: "'DM Sans', sans-serif",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            outline: "none", transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = "var(--green-400)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />

        {/* MAX PRICE */}
        <input
          type="number"
          placeholder="Max $"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{
            width: "100px", padding: "10px 14px",
            border: "1.5px solid var(--border)",
            borderRadius: "50px", fontSize: "13px",
            fontFamily: "'DM Sans', sans-serif",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            outline: "none", transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = "var(--green-400)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />

        {/* CLEAR BUTTON */}
        <button
          onClick={() => {
            setSearch(""); setCategory("All");
            setMinPrice(""); setMaxPrice("");
            setLocation("");
          }}
          style={{
            padding: "10px 20px", borderRadius: "50px",
            fontSize: "13px", fontWeight: "500",
            border: "1.5px solid var(--border)",
            background: "var(--bg-card)",
            color: "var(--text-muted)",
            cursor: "pointer", transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--green-400)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
        >
          ✕ Clear
        </button>
      </div>
    </div>
  );
}