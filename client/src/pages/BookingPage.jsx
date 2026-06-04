import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://localhost:5000/api";

const PAYMENT_METHODS = [
  {
    id: "easypaisa",
    name: "EasyPaisa",
    color: "#00a651",
    bg: "#e8f8f0",
    border: "#00a651",
    icon: "📱",
    accountTitle: "Green Tours Planner",
    accountNumber: "03472058810",
    instruction: "Open EasyPaisa app → Send Money → Enter number → Send exact amount → Take screenshot",
  },
  {
    id: "jazzcash",
    name: "JazzCash",
    color: "#cc0000",
    bg: "#fff0f0",
    border: "#cc0000",
    icon: "💳",
    accountTitle: "Green Tours Planner",
    accountNumber: "03165252847",
    instruction: "Open JazzCash app → Mobile Account → Send Money → Enter number → Send exact amount → Take screenshot",
  },
  {
    id: "bank",
    name: "Bank Transfer",
    color: "#1a56db",
    bg: "#eff6ff",
    border: "#1a56db",
    icon: "🏦",
    accountTitle: "Green Tours Planner",
    accountNumber: "0010045678901234",
    bankName: "Allied Bank Limited (ABL)",
    iban: "PK36ABPA0010045678901234",
    instruction: "Transfer via internet banking or visit any Allied Bank branch → Use IBAN for online transfer → Save receipt",
  },
];

export default function BookingPage() {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1=details, 2=payment, 3=confirm

  // Booking form
  const [travelDate, setTravelDate] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Payment proof
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchTour();
  }, [tourId, user]);

  const fetchTour = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/tours/${tourId}`);
      const data = await res.json();
      setTour(data.tour || data.data || data);
    } catch {
      setError("Failed to load tour details.");
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = (tour?.price || 0) * numberOfPeople;

  const handleScreenshot = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Screenshot must be under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setScreenshot(ev.target.result);
      setScreenshotPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!travelDate) { setError("Please select a travel date."); return; }
    if (numberOfPeople < 1) { setError("At least 1 person required."); return; }
    const selected = new Date(travelDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) { setError("Travel date cannot be in the past."); return; }
    setError("");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep2 = (e) => {
    e.preventDefault();
    if (!selectedMethod) { setError("Please select a payment method."); return; }
    setError("");
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) { setError("Please enter your transaction ID."); return; }
    if (!screenshot) { setError("Please upload your payment screenshot."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/bookings/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user: user._id || user.id,
          tour: tourId,
          travelDate,
          numberOfPeople,
          totalPrice,
          paymentMethod: selectedMethod,
          transactionId: transactionId.trim(),
          paymentScreenshot: screenshot,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed.");
      setBooking(data.booking);
      setStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const method = PAYMENT_METHODS.find(m => m.id === selectedMethod);

  const inputStyle = {
    width: "100%", padding: "12px 14px",
    border: "1.5px solid var(--gray-200)",
    borderRadius: "10px", fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    color: "var(--gray-800)", background: "white",
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  if (loading) return (
    <div style={{ paddingTop: "70px", textAlign: "center", padding: "160px 0" }}>
      <div style={{
        width: "44px", height: "44px",
        border: "4px solid #dcfce7",
        borderTop: "4px solid #16a34a",
        borderRadius: "50%", margin: "0 auto 14px",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "#6b7280" }}>Loading tour details...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ---- STEP 4: SUCCESS + INVOICE ----
  if (step === 4 && booking) {
    return <BookingSuccess booking={booking} tour={tour} navigate={navigate} />;
  }

  return (
    <div style={{
      paddingTop: "70px", minHeight: "100vh",
      background: "var(--off-white)",
    }}>
      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg, #14532d, #052e16)",
        padding: "40px 6% 32px",
      }}>
        <p style={{
          fontSize: "11px", letterSpacing: "3px",
          color: "#4ade80", fontWeight: "600",
          textTransform: "uppercase", marginBottom: "10px",
        }}>
          BOOK YOUR TOUR
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(22px, 3vw, 34px)",
          fontWeight: "700", color: "white", marginBottom: "6px",
        }}>
          {tour?.tourName || tour?.title}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px" }}>
          📍 {tour?.location || tour?.city} · {tour?.duration}
        </p>

        {/* PROGRESS BAR */}
        <div style={{
          display: "flex", gap: "0",
          marginTop: "28px", maxWidth: "500px",
        }}>
          {[
            { n: 1, label: "Details" },
            { n: 2, label: "Payment" },
            { n: 3, label: "Confirm" },
          ].map((s, i) => (
            <div key={s.n} style={{
              flex: 1, display: "flex",
              alignItems: "center",
            }}>
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: "4px",
              }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: step >= s.n ? "#4ade80" : "rgba(255,255,255,0.2)",
                  color: step >= s.n ? "#052e16" : "rgba(255,255,255,0.6)",
                  display: "flex", alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px", fontWeight: "700",
                  transition: "all 0.3s",
                }}>
                  {step > s.n ? "✓" : s.n}
                </div>
                <span style={{
                  fontSize: "10px",
                  color: step >= s.n ? "#4ade80" : "rgba(255,255,255,0.4)",
                  fontWeight: "500",
                }}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div style={{
                  flex: 1, height: "2px",
                  background: step > s.n ? "#4ade80" : "rgba(255,255,255,0.2)",
                  margin: "0 4px 16px",
                  transition: "background 0.3s",
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{
        maxWidth: "900px", margin: "0 auto",
        padding: "36px 5%",
        display: "grid",
        gridTemplateColumns: "1fr 320px",
        gap: "24px",
        alignItems: "start",
      }}>

        {/* LEFT — MAIN CONTENT */}
        <div>
          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              color: "#dc2626", padding: "12px 16px",
              borderRadius: "10px", fontSize: "14px", marginBottom: "20px",
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* ---- STEP 1: BOOKING DETAILS ---- */}
          {step === 1 && (
            <div style={{
              background: "white", borderRadius: "16px",
              border: "1px solid var(--gray-100)",
              padding: "32px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "20px", fontWeight: "700",
                color: "var(--gray-800)", marginBottom: "24px",
              }}>
                Booking Details
              </h2>
              <form onSubmit={handleStep1}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{
                    display: "block", fontSize: "13px",
                    fontWeight: "600", color: "var(--gray-600)", marginBottom: "8px",
                  }}>
                    Travel Date *
                  </label>
                  <input
                    type="date"
                    value={travelDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => setTravelDate(e.target.value)}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#16a34a"}
                    onBlur={e => e.target.style.borderColor = "var(--gray-200)"}
                  />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{
                    display: "block", fontSize: "13px",
                    fontWeight: "600", color: "var(--gray-600)", marginBottom: "8px",
                  }}>
                    Number of People *
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <button
                      type="button"
                      onClick={() => setNumberOfPeople(p => Math.max(1, p - 1))}
                      style={{
                        width: "40px", height: "40px", borderRadius: "50%",
                        border: "1.5px solid var(--gray-200)",
                        background: "white", fontSize: "20px",
                        cursor: "pointer", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        color: "var(--gray-600)",
                      }}
                    >−</button>
                    <span style={{
                      fontSize: "24px", fontWeight: "700",
                      color: "var(--gray-800)", minWidth: "32px",
                      textAlign: "center",
                    }}>
                      {numberOfPeople}
                    </span>
                    <button
                      type="button"
                      onClick={() => setNumberOfPeople(p => Math.min(20, p + 1))}
                      style={{
                        width: "40px", height: "40px", borderRadius: "50%",
                        border: "1.5px solid var(--gray-200)",
                        background: "white", fontSize: "20px",
                        cursor: "pointer", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        color: "var(--gray-600)",
                      }}
                    >+</button>
                    <span style={{ fontSize: "13px", color: "var(--gray-400)" }}>
                      person{numberOfPeople > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* BOOKER INFO */}
                <div style={{
                  background: "var(--gray-50)", borderRadius: "10px",
                  padding: "16px", marginBottom: "24px",
                  border: "1px solid var(--gray-100)",
                }}>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--gray-600)", marginBottom: "8px" }}>
                    Booking For
                  </p>
                  <p style={{ fontSize: "14px", color: "var(--gray-800)", fontWeight: "500" }}>
                    {user.name || user.username}
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--gray-500)" }}>{user.email}</p>
                </div>

                <button type="submit" style={{
                  width: "100%", background: "#16a34a",
                  color: "white", border: "none",
                  padding: "14px", borderRadius: "50px",
                  fontSize: "15px", fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
                }}>
                  Continue to Payment →
                </button>
              </form>
            </div>
          )}

          {/* ---- STEP 2: CHOOSE PAYMENT METHOD ---- */}
          {step === 2 && (
            <div style={{
              background: "white", borderRadius: "16px",
              border: "1px solid var(--gray-100)",
              padding: "32px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "20px", fontWeight: "700",
                color: "var(--gray-800)", marginBottom: "8px",
              }}>
                Choose Payment Method
              </h2>
              <p style={{ color: "var(--gray-400)", fontSize: "13px", marginBottom: "24px" }}>
                Select how you'd like to pay. You'll then send the payment and upload your receipt.
              </p>

              <form onSubmit={handleStep2}>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
                  {PAYMENT_METHODS.map(pm => (
                    <label
                      key={pm.id}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: "14px",
                        padding: "18px 20px",
                        border: `2px solid ${selectedMethod === pm.id ? pm.border : "var(--gray-200)"}`,
                        borderRadius: "12px",
                        background: selectedMethod === pm.id ? pm.bg : "white",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={pm.id}
                        checked={selectedMethod === pm.id}
                        onChange={() => setSelectedMethod(pm.id)}
                        style={{ marginTop: "3px", accentColor: pm.color, flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                          <span style={{ fontSize: "20px" }}>{pm.icon}</span>
                          <span style={{
                            fontSize: "15px", fontWeight: "700",
                            color: selectedMethod === pm.id ? pm.color : "var(--gray-800)",
                          }}>
                            {pm.name}
                          </span>
                        </div>
                        {selectedMethod === pm.id && (
                          <div style={{
                            background: "rgba(255,255,255,0.7)",
                            borderRadius: "8px", padding: "12px 14px",
                            marginTop: "10px", border: `1px solid ${pm.border}30`,
                          }}>
                            <div style={{ marginBottom: "8px" }}>
                              <p style={{ fontSize: "11px", color: pm.color, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
                                Account Title
                              </p>
                              <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--gray-800)" }}>
                                {pm.accountTitle}
                              </p>
                            </div>
                            <div style={{ marginBottom: pm.bankName ? "8px" : "0" }}>
                              <p style={{ fontSize: "11px", color: pm.color, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
                                {pm.bankName ? "Account Number" : "Mobile Number"}
                              </p>
                              <p style={{
                                fontSize: "18px", fontWeight: "800",
                                color: pm.color, letterSpacing: "1px",
                              }}>
                                {pm.accountNumber}
                              </p>
                            </div>
                            {pm.bankName && (
                              <>
                                <div style={{ marginBottom: "8px" }}>
                                  <p style={{ fontSize: "11px", color: pm.color, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
                                    Bank
                                  </p>
                                  <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--gray-800)" }}>
                                    {pm.bankName}
                                  </p>
                                </div>
                                <div>
                                  <p style={{ fontSize: "11px", color: pm.color, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
                                    IBAN
                                  </p>
                                  <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--gray-800)", letterSpacing: "0.5px" }}>
                                    {pm.iban}
                                  </p>
                                </div>
                              </>
                            )}
                            <div style={{
                              marginTop: "12px", padding: "10px 12px",
                              background: `${pm.color}10`,
                              borderRadius: "8px",
                              border: `1px solid ${pm.color}25`,
                            }}>
                              <p style={{ fontSize: "12px", color: pm.color, lineHeight: "1.6" }}>
                                💡 {pm.instruction}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(""); }}
                    style={{
                      flex: 1, background: "var(--gray-100)",
                      color: "var(--gray-600)", border: "none",
                      padding: "13px", borderRadius: "50px",
                      fontSize: "14px", fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    ← Back
                  </button>
                  <button type="submit" style={{
                    flex: 2, background: "#16a34a",
                    color: "white", border: "none",
                    padding: "13px", borderRadius: "50px",
                    fontSize: "15px", fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
                  }}>
                    I've Sent the Payment →
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ---- STEP 3: UPLOAD PROOF ---- */}
          {step === 3 && (
            <div style={{
              background: "white", borderRadius: "16px",
              border: "1px solid var(--gray-100)",
              padding: "32px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "20px", fontWeight: "700",
                color: "var(--gray-800)", marginBottom: "8px",
              }}>
                Upload Payment Proof
              </h2>
              <p style={{ color: "var(--gray-400)", fontSize: "13px", marginBottom: "24px" }}>
                Please provide your transaction ID and upload a screenshot of the payment confirmation.
              </p>

              {/* SELECTED METHOD REMINDER */}
              {method && (
                <div style={{
                  background: method.bg,
                  border: `1.5px solid ${method.border}40`,
                  borderRadius: "10px", padding: "14px 16px",
                  marginBottom: "24px",
                  display: "flex", alignItems: "center", gap: "10px",
                }}>
                  <span style={{ fontSize: "20px" }}>{method.icon}</span>
                  <div>
                    <p style={{ fontSize: "12px", color: method.color, fontWeight: "700" }}>
                      Paying via {method.name}
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--gray-700)", fontWeight: "600" }}>
                      Amount to send:{" "}
                      <span style={{ color: method.color, fontSize: "16px" }}>
                        Rs. {totalPrice.toLocaleString()}
                      </span>
                      {" "}to {method.accountNumber}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* TRANSACTION ID */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{
                    display: "block", fontSize: "13px",
                    fontWeight: "600", color: "var(--gray-600)", marginBottom: "8px",
                  }}>
                    Transaction ID / Reference Number *
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value)}
                    placeholder="e.g. EP1234567890 or TXN-ABC123"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#16a34a"}
                    onBlur={e => e.target.style.borderColor = "var(--gray-200)"}
                  />
                  <p style={{ fontSize: "11px", color: "var(--gray-400)", marginTop: "6px" }}>
                    Find this in your payment app under transaction history or the SMS receipt.
                  </p>
                </div>

                {/* SCREENSHOT UPLOAD */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{
                    display: "block", fontSize: "13px",
                    fontWeight: "600", color: "var(--gray-600)", marginBottom: "8px",
                  }}>
                    Payment Screenshot *
                  </label>

                  {screenshotPreview ? (
                    <div style={{ position: "relative" }}>
                      <img
                        src={screenshotPreview}
                        alt="Payment proof"
                        style={{
                          width: "100%", maxHeight: "280px",
                          objectFit: "contain",
                          borderRadius: "10px",
                          border: "2px solid #16a34a",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
                        style={{
                          position: "absolute", top: "8px", right: "8px",
                          background: "#dc2626", color: "white",
                          border: "none", borderRadius: "50%",
                          width: "28px", height: "28px",
                          cursor: "pointer", fontSize: "14px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >✕</button>
                    </div>
                  ) : (
                    <label style={{
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      padding: "40px 20px",
                      border: "2px dashed var(--gray-200)",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      background: "var(--gray-50)",
                    }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = "#16a34a";
                        e.currentTarget.style.background = "#f0fdf4";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = "var(--gray-200)";
                        e.currentTarget.style.background = "var(--gray-50)";
                      }}
                    >
                      <span style={{ fontSize: "36px", marginBottom: "12px" }}>📸</span>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--gray-700)", marginBottom: "4px" }}>
                        Click to upload screenshot
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--gray-400)" }}>
                        JPG, PNG — max 5MB
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshot}
                        style={{ display: "none" }}
                      />
                    </label>
                  )}
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => { setStep(2); setError(""); }}
                    style={{
                      flex: 1, background: "var(--gray-100)",
                      color: "var(--gray-600)", border: "none",
                      padding: "13px", borderRadius: "50px",
                      fontSize: "14px", fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      flex: 2,
                      background: submitting ? "#86efac" : "#16a34a",
                      color: "white", border: "none",
                      padding: "13px", borderRadius: "50px",
                      fontSize: "15px", fontWeight: "600",
                      cursor: submitting ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
                    }}
                  >
                    {submitting ? "Submitting..." : "Submit Booking ✓"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT — ORDER SUMMARY (sticky) */}
        <div style={{
          background: "white",
          border: "1px solid var(--gray-100)",
          borderRadius: "16px", padding: "24px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          position: "sticky", top: "90px",
        }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "17px", fontWeight: "700",
            color: "var(--gray-800)", marginBottom: "16px",
          }}>
            Order Summary
          </h3>

          {/* TOUR IMAGE */}
          {(tour?.images?.[0] || tour?.photo) && (
            <img
              src={tour.images?.[0] || tour.photo}
              alt={tour.tourName || tour.title}
              style={{
                width: "100%", height: "140px",
                objectFit: "cover", borderRadius: "10px",
                marginBottom: "16px",
              }}
            />
          )}

          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "15px", fontWeight: "700",
            color: "var(--gray-800)", marginBottom: "4px",
          }}>
            {tour?.tourName || tour?.title}
          </p>
          <p style={{ fontSize: "12px", color: "var(--green-600)", fontWeight: "600", marginBottom: "16px" }}>
            📍 {tour?.location || tour?.city} · {tour?.duration}
          </p>

          <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: "14px" }}>
            {[
              { label: "Travel Date", val: travelDate || "—" },
              { label: "Guests", val: `${numberOfPeople} person${numberOfPeople > 1 ? "s" : ""}` },
              { label: "Price per person", val: `Rs. ${Number(tour?.price || 0).toLocaleString()}` },
            ].map(r => (
              <div key={r.label} style={{
                display: "flex", justifyContent: "space-between",
                fontSize: "13px", color: "var(--gray-500)",
                marginBottom: "10px",
              }}>
                <span>{r.label}</span>
                <span style={{ fontWeight: "500", color: "var(--gray-700)" }}>{r.val}</span>
              </div>
            ))}

            <div style={{
              borderTop: "1px solid var(--gray-100)",
              paddingTop: "12px", marginTop: "4px",
              display: "flex", justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--gray-800)" }}>
                Total
              </span>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px", fontWeight: "700",
                color: "#16a34a",
              }}>
                Rs. {totalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          {selectedMethod && (
            <div style={{
              marginTop: "14px", padding: "10px 12px",
              background: "#f0fdf4", borderRadius: "8px",
              border: "1px solid #bbf7d0",
            }}>
              <p style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600" }}>
                Payment: {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}
              </p>
            </div>
          )}

          <div style={{
            marginTop: "16px", padding: "12px",
            background: "#fef9c3", borderRadius: "8px",
            border: "1px solid #fde68a",
          }}>
            <p style={{ fontSize: "11px", color: "#92400e", lineHeight: "1.7" }}>
              ⏳ Your booking will be confirmed within <strong>2–4 hours</strong> after admin verifies your payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- BOOKING SUCCESS + INVOICE ----
function BookingSuccess({ booking, tour, navigate }) {
  const handlePrint = () => {
    window.print();
  };

  const method = PAYMENT_METHODS.find(m => m.id === booking.paymentMethod);

  return (
    <div style={{ paddingTop: "70px", minHeight: "100vh", background: "var(--off-white)" }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print, #invoice-print * { visibility: visible; }
          #invoice-print { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* SUCCESS BANNER */}
      <div style={{
        background: "linear-gradient(135deg, #14532d, #052e16)",
        padding: "48px 6%", textAlign: "center",
      }}
        className="no-print"
      >
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          background: "#4ade80",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "32px", margin: "0 auto 16px",
        }}>✓</div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(24px, 3vw, 36px)",
          fontWeight: "700", color: "white", marginBottom: "10px",
        }}>
          Booking Submitted!
        </h1>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", maxWidth: "480px", margin: "0 auto" }}>
          Your payment is being verified. You'll receive confirmation within 2–4 hours. Check My Bookings for status updates.
        </p>
      </div>

      {/* INVOICE */}
      <div style={{ maxWidth: "720px", margin: "36px auto", padding: "0 5% 60px" }}>
        <div id="invoice-print" style={{
          background: "white",
          border: "1px solid var(--gray-100)",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}>
          {/* INVOICE HEADER */}
          <div style={{
            background: "linear-gradient(135deg, #14532d, #052e16)",
            padding: "32px 36px",
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", flexWrap: "wrap", gap: "16px",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "8px",
                  background: "#4ade80",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px",
                }}>🌿</div>
                <div>
                  <p style={{ fontSize: "16px", fontWeight: "700", color: "white" }}>
                    Green Tours Planner
                  </p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>
                    H-10 Sector, Islamabad, Pakistan
                  </p>
                </div>
              </div>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
                📞 03165252847 · ✉️ greentoursplanner@gmail.com
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "11px", color: "#4ade80", fontWeight: "700", letterSpacing: "2px", marginBottom: "4px" }}>
                BOOKING INVOICE
              </p>
              <p style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "20px", fontWeight: "700", color: "white",
              }}>
                #{booking.invoiceNumber || booking._id?.slice(-8).toUpperCase()}
              </p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginTop: "4px" }}>
                {new Date(booking.createdAt || Date.now()).toLocaleDateString("en-PK", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* STATUS BANNER */}
          <div style={{
            background: "#fef9c3", borderBottom: "1px solid #fde68a",
            padding: "12px 36px",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <span style={{ fontSize: "16px" }}>⏳</span>
            <span style={{ fontSize: "13px", color: "#92400e", fontWeight: "600" }}>
              Payment Pending Verification — Admin will confirm within 2–4 hours
            </span>
          </div>

          <div style={{ padding: "32px 36px" }}>
            {/* TOUR DETAILS */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: "24px", marginBottom: "28px",
            }}>
              <div>
                <p style={{
                  fontSize: "11px", fontWeight: "700",
                  color: "#16a34a", textTransform: "uppercase",
                  letterSpacing: "1px", marginBottom: "12px",
                }}>
                  Tour Details
                </p>
                {[
                  { label: "Tour", val: booking.tour?.tourName || tour?.tourName || tour?.title || "—" },
                  { label: "Location", val: booking.tour?.location || tour?.location || tour?.city || "—" },
                  { label: "Duration", val: booking.tour?.duration || tour?.duration || "—" },
                  { label: "Travel Date", val: booking.travelDate ? new Date(booking.travelDate).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" }) : "—" },
                ].map(r => (
                  <div key={r.label} style={{ marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", color: "var(--gray-400)", display: "block" }}>{r.label}</span>
                    <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--gray-800)" }}>{r.val}</span>
                  </div>
                ))}
              </div>
              <div>
                <p style={{
                  fontSize: "11px", fontWeight: "700",
                  color: "#16a34a", textTransform: "uppercase",
                  letterSpacing: "1px", marginBottom: "12px",
                }}>
                  Customer Details
                </p>
                {[
                  { label: "Name", val: booking.user?.name || "—" },
                  { label: "Email", val: booking.user?.email || "—" },
                  { label: "Guests", val: `${booking.numberOfPeople} person${booking.numberOfPeople > 1 ? "s" : ""}` },
                ].map(r => (
                  <div key={r.label} style={{ marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", color: "var(--gray-400)", display: "block" }}>{r.label}</span>
                    <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--gray-800)" }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PRICE BREAKDOWN */}
            <div style={{
              background: "var(--gray-50)",
              borderRadius: "10px", padding: "20px",
              marginBottom: "24px",
              border: "1px solid var(--gray-100)",
            }}>
              <p style={{
                fontSize: "11px", fontWeight: "700",
                color: "#16a34a", textTransform: "uppercase",
                letterSpacing: "1px", marginBottom: "14px",
              }}>
                Price Breakdown
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: "var(--gray-500)" }}>
                  Price per person
                </span>
                <span style={{ fontSize: "13px", color: "var(--gray-700)", fontWeight: "500" }}>
                  Rs. {Number(tour?.price || booking.totalPrice / booking.numberOfPeople).toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", color: "var(--gray-500)" }}>
                  × {booking.numberOfPeople} {booking.numberOfPeople > 1 ? "persons" : "person"}
                </span>
              </div>
              <div style={{
                borderTop: "1px solid var(--gray-200)",
                paddingTop: "12px",
                display: "flex", justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--gray-800)" }}>
                  Total Paid
                </span>
                <span style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "26px", fontWeight: "700", color: "#16a34a",
                }}>
                  Rs. {Number(booking.totalPrice).toLocaleString()}
                </span>
              </div>
            </div>

            {/* PAYMENT INFO */}
            <div style={{
              background: method ? method.bg : "#f0fdf4",
              borderRadius: "10px", padding: "16px 20px",
              marginBottom: "24px",
              border: `1px solid ${method ? method.border + "40" : "#bbf7d0"}`,
            }}>
              <p style={{
                fontSize: "11px", fontWeight: "700",
                color: method ? method.color : "#16a34a",
                textTransform: "uppercase",
                letterSpacing: "1px", marginBottom: "10px",
              }}>
                Payment Information
              </p>
              <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--gray-400)", display: "block" }}>Method</span>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--gray-800)" }}>
                    {method?.name || booking.paymentMethod}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--gray-400)", display: "block" }}>Transaction ID</span>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--gray-800)" }}>
                    {booking.transactionId}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--gray-400)", display: "block" }}>Status</span>
                  <span style={{
                    fontSize: "12px", fontWeight: "700",
                    background: "#fef9c3", color: "#92400e",
                    padding: "2px 10px", borderRadius: "50px",
                  }}>
                    Pending Verification
                  </span>
                </div>
              </div>
            </div>

            {/* FOOTER NOTE */}
            <div style={{
              borderTop: "1px solid var(--gray-100)",
              paddingTop: "20px", textAlign: "center",
            }}>
              <p style={{ fontSize: "12px", color: "var(--gray-400)", lineHeight: "1.8" }}>
                Thank you for choosing Green Tours Planner.<br />
                For support: 📞 03165252847 · ✉️ greentoursplanner@gmail.com<br />
                H-10 Sector, Islamabad, Pakistan
              </p>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div
          className="no-print"
          style={{
            display: "flex", gap: "12px",
            justifyContent: "center", marginTop: "24px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handlePrint}
            style={{
              background: "#16a34a", color: "white",
              border: "none", padding: "13px 32px",
              borderRadius: "50px", fontSize: "14px",
              fontWeight: "600", cursor: "pointer",
              boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
            }}
          >
            📄 Download Invoice (PDF)
          </button>
          <button
            onClick={() => navigate("/account")}
            style={{
              background: "white", color: "var(--gray-700)",
              border: "1.5px solid var(--gray-200)",
              padding: "13px 28px", borderRadius: "50px",
              fontSize: "14px", fontWeight: "500",
              cursor: "pointer",
            }}
          >
            View My Bookings →
          </button>
        </div>
      </div>
    </div>
  );
}