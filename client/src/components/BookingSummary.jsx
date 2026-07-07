// components/booking/BookingSummary.jsx

export default function BookingSummary({ departure, selectedSeats, price, onBook, loading, user }) {
  const total = selectedSeats.length * price;

  const groupedByVehicle = selectedSeats.reduce((acc, s) => {
    const key = `Vehicle ${s.vehicleNumber}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(`S${s.seatNumber}`);
    return acc;
  }, {});

  return (
    <div style={{
      borderTop: "1.5px solid var(--border)",
      paddingTop: "18px", marginTop: "4px",
    }}>
      <h4 style={{
        fontSize: "12px", fontWeight: "700",
        color: "var(--text-muted)", letterSpacing: "1px",
        textTransform: "uppercase", marginBottom: "12px",
      }}>
        Booking Summary
      </h4>

      {selectedSeats.length === 0 ? (
        <div style={{
          padding: "14px", borderRadius: "10px",
          border: "1.5px dashed var(--border)",
          textAlign: "center", color: "var(--text-muted)",
          fontSize: "13px", marginBottom: "16px",
        }}>
          👆 Select seats from the map above
        </div>
      ) : (
        <>
          {/* Selected seats grouped by vehicle */}
          <div style={{ marginBottom: "14px" }}>
            {Object.entries(groupedByVehicle).map(([vehicle, seats]) => (
              <div key={vehicle} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: "6px",
              }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{vehicle}</span>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {seats.map(s => (
                    <span key={s} style={{
                      fontSize: "11px", fontWeight: "700",
                      padding: "2px 8px", borderRadius: "50px",
                      background: "#bbf7d0", color: "#15803d",
                      border: "1px solid #86efac",
                    }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div style={{
            padding: "12px 14px",
            background: "var(--bg-subtle)",
            borderRadius: "10px", border: "1px solid var(--border)",
            marginBottom: "14px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Rs. {Number(price).toLocaleString()} × {selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""}
              </span>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>
                Rs. {total.toLocaleString()}
              </span>
            </div>
            <div style={{ height: "1px", background: "var(--border)", margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>Total</span>
              <span style={{ fontSize: "18px", fontWeight: "800", color: "var(--green-700)" }}>
                Rs. {total.toLocaleString()}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Book Button */}
      <button
        onClick={onBook}
        disabled={!departure || selectedSeats.length === 0 || loading}
        style={{
          width: "100%",
          background: (!departure || selectedSeats.length === 0 || loading)
            ? "var(--bg-subtle)"
            : "linear-gradient(135deg, #16a34a, #15803d)",
          color: (!departure || selectedSeats.length === 0 || loading) ? "var(--text-muted)" : "white",
          border: "none",
          padding: "15px", borderRadius: "50px",
          fontSize: "15px", fontWeight: "700",
          boxShadow: selectedSeats.length > 0 ? "0 4px 16px rgba(22,163,74,0.35)" : "none",
          cursor: (!departure || selectedSeats.length === 0 || loading) ? "not-allowed" : "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => {
          if (selectedSeats.length > 0 && !loading) {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(22,163,74,0.45)";
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = selectedSeats.length > 0 ? "0 4px 16px rgba(22,163,74,0.35)" : "none";
        }}
      >
        {loading ? "Booking..." : selectedSeats.length === 0
          ? "Select Seats to Book"
          : `Book ${selectedSeats.length} Seat${selectedSeats.length > 1 ? "s" : ""} 🌿`}
      </button>

      {!user && (
        <p style={{
          textAlign: "center", fontSize: "12px",
          color: "var(--text-muted)", marginTop: "10px",
        }}>
          You'll be asked to log in before booking
        </p>
      )}

      <p style={{
        textAlign: "center", fontSize: "12px",
        color: "var(--text-muted)", marginTop: "10px",
      }}>
        ✅ Free cancellation up to 7 days before departure
      </p>
    </div>
  );
}