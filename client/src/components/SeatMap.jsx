// components/booking/SeatMap.jsx

import { useState } from "react";

const COLS = 2; // 2 seats per row, aisle in middle

// BUG FIX 1: Handle both "HH:MM" (24h from input type=time) and
// already-formatted strings like "7:00 AM" so no NaN appears.
function formatTime(timeStr) {
  if (!timeStr) return "";
  if (timeStr.toLowerCase().includes("am") || timeStr.toLowerCase().includes("pm")) {
    return timeStr; // already human-readable
  }
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function SeatButton({ seat, isSelected, onClick }) {
  const [hovered, setHovered] = useState(false);

  // BUG FIX 2: "reserved" seats now show as orange and are non-clickable,
  // matching real seat state. Previously they fell through to green "available"
  // colors, letting users think they could select an already-held seat.
  const colors = {
    booked: {
      bg: "#fecaca", border: "#ef4444", color: "#b91c1c",
      cursor: "not-allowed",
    },
    reserved: {
      bg: "#fed7aa", border: "#f97316", color: "#c2410c",
      cursor: "not-allowed",
    },
    selected: {
      bg: "#bbf7d0", border: "#16a34a", color: "#15803d",
      cursor: "pointer",
    },
    available: {
      bg: hovered ? "#dcfce7" : "#f0fdf4",
      border: hovered ? "#86efac" : "#d1fae5",
      color: "#374151",
      cursor: "pointer",
    },
  };

  const st =
    seat.status === "booked"    ? colors.booked
    : seat.status === "reserved" ? colors.reserved
    : isSelected                 ? colors.selected
    :                              colors.available;

  const isBlocked = seat.status === "booked" || seat.status === "reserved";

  return (
    <div
      onClick={() => !isBlocked && onClick(seat)}
      onMouseEnter={() => !isBlocked && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={
        seat.status === "booked"    ? "Already booked"
        : seat.status === "reserved" ? "Reserved — being booked"
        : `Seat ${seat.seatNumber}`
      }
      style={{
        width: "38px", height: "42px",
        borderRadius: "6px 6px 4px 4px",
        background: st.bg,
        border: `2px solid ${st.border}`,
        color: st.color,
        cursor: st.cursor,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "11px", fontWeight: "700",
        transition: "all 0.15s",
        transform: isSelected ? "scale(1.08)" : "scale(1)",
        userSelect: "none",
        boxShadow: isSelected ? "0 2px 8px rgba(22,163,74,0.3)" : "0 1px 3px rgba(0,0,0,0.08)",
        position: "relative",
      }}
    >
      {seat.seatNumber}
      {/* Seatback notch */}
      <div style={{
        position: "absolute", top: "-4px", left: "6px", right: "6px",
        height: "5px", borderRadius: "3px 3px 0 0",
        background: st.border, opacity: 0.5,
      }} />
    </div>
  );
}

export default function SeatMap({ departure, selectedSeats, onToggleSeat }) {
  if (!departure) return null;

  const vehicles = [];
  for (let v = 1; v <= departure.vehicleCount; v++) {
    const vehicleSeats = (departure.seatMap || []).filter(s => s.vehicleNumber === v);
    vehicles.push({ vehicleNumber: v, seats: vehicleSeats });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {vehicles.map(({ vehicleNumber, seats }) => {
        // Build rows of COLS seats each
        const rows = [];
        for (let i = 0; i < seats.length; i += COLS) {
          rows.push(seats.slice(i, i + COLS));
        }

        return (
          <div key={vehicleNumber} style={{
            background: "var(--bg-card)",
            border: "1.5px solid var(--border)",
            borderRadius: "16px",
            padding: "20px",
            position: "relative",
          }}>
            {/* Vehicle header */}
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              marginBottom: "18px",
            }}>
              <div style={{
                background: "linear-gradient(135deg, #16a34a, #15803d)",
                color: "white", fontSize: "11px", fontWeight: "700",
                padding: "4px 14px", borderRadius: "50px", letterSpacing: "0.5px",
              }}>
                🚌 {departure.transportType} — Vehicle {vehicleNumber}
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {seats.filter(s => s.status === "available").length} of {seats.length} available
              </span>
            </div>

            {/* Steering wheel / driver */}
            <div style={{
              display: "flex", justifyContent: "flex-end",
              alignItems: "center", marginBottom: "14px",
              paddingRight: "4px",
            }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                border: "3px solid var(--border)",
                background: "var(--bg-subtle)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px",
              }}>
                🚗
              </div>
            </div>

            {/* Seat rows */}
            <div style={{
              display: "flex", flexDirection: "column", gap: "8px",
              alignItems: "center",
            }}>
              {rows.map((row, rowIdx) => (
                <div key={rowIdx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {/* Left seat(s) */}
                  {row.slice(0, Math.ceil(COLS / 2)).map(seat => (
                    <SeatButton
                      key={`${seat.vehicleNumber}-${seat.seatNumber}`}
                      seat={seat}
                      isSelected={selectedSeats.some(
                        s => s.vehicleNumber === seat.vehicleNumber && s.seatNumber === seat.seatNumber
                      )}
                      onClick={onToggleSeat}
                    />
                  ))}

                  {/* Aisle */}
                  <div style={{
                    width: "18px", textAlign: "center",
                    fontSize: "10px", color: "var(--text-muted)",
                  }}>
                    {rowIdx === 0 ? "▶" : ""}
                  </div>

                  {/* Right seat(s) */}
                  {row.slice(Math.ceil(COLS / 2)).map(seat => (
                    <SeatButton
                      key={`${seat.vehicleNumber}-${seat.seatNumber}`}
                      seat={seat}
                      isSelected={selectedSeats.some(
                        s => s.vehicleNumber === seat.vehicleNumber && s.seatNumber === seat.seatNumber
                      )}
                      onClick={onToggleSeat}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Front label */}
            <div style={{
              textAlign: "center", fontSize: "11px",
              color: "var(--text-muted)", marginTop: "14px",
              letterSpacing: "2px", textTransform: "uppercase",
            }}>
              ── Front ──
            </div>
          </div>
        );
      })}
    </div>
  );
}
