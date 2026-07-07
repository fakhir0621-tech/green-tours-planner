// components/booking/TransportInfo.jsx

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-PK", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

function formatTime(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function getRemainingSeats(dep) {
  if (!dep.seatMap || dep.seatMap.length === 0) return dep.totalSeats;
  return dep.seatMap.filter(s => s.status === "available").length;
}

export default function TransportInfo({ departure }) {
  if (!departure) return null;

  const remaining = getRemainingSeats(departure);
  const pct = Math.round(((departure.totalSeats - remaining) / departure.totalSeats) * 100);

  const urgency =
    remaining === 0 ? { color: "#dc2626", bg: "#fef2f2", msg: "🔴 Sold Out" }
    : remaining <= 2 ? { color: "#dc2626", bg: "#fef2f2", msg: `🔥 Almost Sold Out — Only ${remaining} seats left!` }
    : remaining <= 5 ? { color: "#dc2626", bg: "#fef2f2", msg: `🔥 Hurry! Only ${remaining} seats remaining` }
    : remaining <= 10 ? { color: "#ea580c", bg: "#fff7ed", msg: `⚠️ Hurry! Only ${remaining} seats left` }
    : null;

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(22,163,74,0.06) 0%, rgba(21,128,61,0.02) 100%)",
      border: "1.5px solid rgba(22,163,74,0.2)",
      borderRadius: "14px", padding: "18px 20px",
      marginBottom: "18px",
    }}>
      {/* Route */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
        <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>
          📍 {departure.departureLocation}
        </span>
        <div style={{
          flex: 1, height: "2px", background: "linear-gradient(90deg, var(--green-200), var(--green-500))",
          borderRadius: "2px",
        }} />
        <span style={{
          fontSize: "11px", background: "var(--green-600)", color: "white",
          padding: "2px 8px", borderRadius: "50px", fontWeight: "600",
        }}>
          {departure.transportType}
        </span>
        <div style={{
          flex: 1, height: "2px", background: "linear-gradient(90deg, var(--green-500), var(--green-200))",
          borderRadius: "2px",
        }} />
        <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>
          🏔️ {departure.arrivalLocation}
        </span>
      </div>

      {/* Date & Time row */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px",
        marginBottom: "14px",
      }}>
        <div style={{
          background: "var(--bg-card)", borderRadius: "10px",
          padding: "10px 14px", border: "1px solid var(--border)",
        }}>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Date
          </div>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)", marginTop: "2px" }}>
            {formatDate(departure.date)}
          </div>
        </div>
        <div style={{
          background: "var(--bg-card)", borderRadius: "10px",
          padding: "10px 14px", border: "1px solid var(--border)",
        }}>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Departure Time
          </div>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--green-700)", marginTop: "2px" }}>
            {formatTime(departure.time)}
          </div>
        </div>
      </div>

      {/* Vehicle info */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px",
        marginBottom: "14px",
      }}>
        {[
          { label: "Vehicles", val: departure.vehicleCount },
          { label: "Per Vehicle", val: departure.seatsPerVehicle + " seats" },
          { label: "Total Seats", val: departure.totalSeats },
        ].map(({ label, val }) => (
          <div key={label} style={{
            textAlign: "center", padding: "8px 4px",
            background: "var(--bg-card)", borderRadius: "8px",
            border: "1px solid var(--border)",
          }}>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>{val}</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Occupancy bar */}
      <div style={{ marginBottom: "8px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: "11px", color: "var(--text-muted)", marginBottom: "5px",
        }}>
          <span>{departure.totalSeats - remaining} booked</span>
          <span>{remaining} remaining</span>
        </div>
        <div style={{
          height: "6px", background: "var(--bg-subtle)",
          borderRadius: "3px", overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: pct >= 90 ? "#ef4444" : pct >= 70 ? "#f97316" : "#16a34a",
            borderRadius: "3px", transition: "width 0.5s ease",
          }} />
        </div>
      </div>

      {/* Urgency badge */}
      {urgency && (
        <div style={{
          background: urgency.bg, color: urgency.color,
          fontSize: "12px", fontWeight: "700",
          padding: "7px 12px", borderRadius: "8px",
          border: `1px solid ${urgency.color}30`,
          textAlign: "center", marginTop: "8px",
          animation: "pulse 2s ease-in-out infinite",
        }}>
          {urgency.msg}
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.75} }`}</style>
        </div>
      )}
    </div>
  );
}