// components/booking/DepartureSelector.jsx

import { useState } from "react";

// BUG FIX 4: formatTime now handles both raw "HH:MM" (24h, from HTML
// input type=time) and already-formatted strings like "7:00 AM" that
// an admin might have typed directly. Previously "7:00 AM".split(":")
// gave h=7, m="00 AM" → NaN in the calculation.
function formatTime(timeStr) {
  if (!timeStr) return "";
  if (timeStr.toLowerCase().includes("am") || timeStr.toLowerCase().includes("pm")) {
    return timeStr; // already human-readable, return as-is
  }
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

function getRemainingSeats(dep) {
  if (!dep.seatMap || dep.seatMap.length === 0) return dep.totalSeats;
  return dep.seatMap.filter(s => s.status === "available").length;
}

const S = {
  wrap: { marginBottom: "20px" },
  label: {
    display: "block", fontSize: "12px", fontWeight: "700",
    color: "var(--text-muted)", letterSpacing: "1px",
    textTransform: "uppercase", marginBottom: "10px",
  },
  grid: { display: "flex", flexDirection: "column", gap: "10px" },
  card: (selected) => ({
    padding: "14px 16px",
    borderRadius: "12px",
    border: selected ? "2px solid var(--green-600)" : "1.5px solid var(--border)",
    background: selected
      ? "linear-gradient(135deg, rgba(22,163,74,0.08), rgba(21,128,61,0.04))"
      : "var(--bg-card)",
    cursor: "pointer",
    transition: "all 0.2s",
    position: "relative",
  }),
  row: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  date: { fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" },
  route: { fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" },
  badge: (remaining) => ({
    fontSize: "11px", fontWeight: "700",
    padding: "3px 10px", borderRadius: "50px",
    background: remaining <= 5 ? "#fef2f2" : remaining <= 10 ? "#fff7ed" : "#f0fdf4",
    color: remaining <= 5 ? "#dc2626" : remaining <= 10 ? "#ea580c" : "#16a34a",
    border: `1px solid ${remaining <= 5 ? "#fca5a5" : remaining <= 10 ? "#fdba74" : "#86efac"}`,
    whiteSpace: "nowrap",
  }),
  soldOut: {
    fontSize: "11px", fontWeight: "700",
    padding: "3px 10px", borderRadius: "50px",
    background: "#f1f5f9", color: "#94a3b8",
    border: "1px solid #e2e8f0",
  },
  dot: {
    position: "absolute", top: "14px", right: "16px",
    width: "8px", height: "8px", borderRadius: "50%",
    background: "var(--green-600)",
  },
};

export default function DepartureSelector({ departures = [], selectedId, onSelect }) {
  if (!departures.length) {
    return (
      <div style={{
        padding: "16px", borderRadius: "12px",
        border: "1.5px solid var(--border)",
        background: "var(--bg-card)", textAlign: "center",
        color: "var(--text-muted)", fontSize: "13px",
        marginBottom: "20px",
      }}>
        🗓️ No scheduled departures available yet.
      </div>
    );
  }

  return (
    <div style={S.wrap}>
      <label style={S.label}>Select Departure</label>
      <div style={S.grid}>
        {departures.map((dep) => {
          const remaining = getRemainingSeats(dep);
          const soldOut = remaining === 0;
          const isSelected = selectedId === dep._id;

          return (
            <div
              key={dep._id}
              style={{
                ...S.card(isSelected),
                opacity: soldOut ? 0.6 : 1,
                cursor: soldOut ? "not-allowed" : "pointer",
              }}
              onClick={() => !soldOut && onSelect(dep)}
            >
              {isSelected && <div style={S.dot} />}
              <div style={S.row}>
                <div>
                  <div style={S.date}>
                    {formatDate(dep.date)} · {formatTime(dep.time)}
                  </div>
                  <div style={S.route}>
                    📍 {dep.departureLocation} → {dep.arrivalLocation}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>
                    🚌 {dep.transportType} · {dep.vehicleCount} vehicle{dep.vehicleCount > 1 ? "s" : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {soldOut ? (
                    <span style={S.soldOut}>Sold Out</span>
                  ) : (
                    <span style={S.badge(remaining)}>
                      {remaining <= 2 ? "🔥 " : remaining <= 5 ? "🔥 " : remaining <= 10 ? "⚠️ " : "✅ "}
                      {remaining} left
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
