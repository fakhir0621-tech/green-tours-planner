// components/booking/SeatLegend.jsx
// BUG FIX 3: Colors now match actual SeatMap seat colors exactly.
// Previously legend showed solid #22c55e for available and #e2e8f0 for
// selected, but SeatMap uses #f0fdf4 bg / #d1fae5 border for available
// and #bbf7d0 bg / #16a34a border for selected. Also added "Reserved"
// state (orange) to match the new reserved seat styling in SeatMap.

export default function SeatLegend() {
  const items = [
    {
      label: "Available",
      bg: "#f0fdf4",
      border: "#d1fae5",
    },
    {
      label: "Selected",
      bg: "#bbf7d0",
      border: "#16a34a",
    },
    {
      label: "Reserved",
      bg: "#fed7aa",
      border: "#f97316",
    },
    {
      label: "Booked",
      bg: "#fecaca",
      border: "#ef4444",
    },
  ];

  return (
    <div style={{
      display: "flex", gap: "12px", flexWrap: "wrap",
      padding: "12px 16px",
      background: "var(--bg-subtle)",
      borderRadius: "10px",
      border: "1px solid var(--border)",
      marginBottom: "16px",
    }}>
      {items.map(({ label, bg, border }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div style={{
            width: "22px", height: "22px", borderRadius: "5px",
            background: bg,
            border: `2px solid ${border}`,
            // Seatback notch to match the actual seat shape
            position: "relative", overflow: "visible",
          }}>
            <div style={{
              position: "absolute", top: "-3px", left: "4px", right: "4px",
              height: "4px", borderRadius: "2px 2px 0 0",
              background: border, opacity: 0.5,
            }} />
          </div>
          <span style={{
            fontSize: "12px", fontWeight: "600",
            color: "var(--text-secondary)",
          }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
