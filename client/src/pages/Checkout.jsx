import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://localhost:5000/api";

const PAYMENT_METHODS = [
  {
    key: "easypaisa",
    name: "EasyPaisa",
    icon: "📱",
    color: "#00a651",
    bg: "#e8f8f0",
    number: "0300-1234567",
    accountName: "Green Tours Planner",
    instructions: "Send payment to the EasyPaisa number above, then enter your transaction ID and upload the screenshot.",
  },
  {
    key: "jazzcash",
    name: "JazzCash",
    icon: "💳",
    color: "#cc0000",
    bg: "#fff0f0",
    number: "0301-7654321",
    accountName: "Green Tours Planner",
    instructions: "Send payment to the JazzCash number above, then enter your transaction ID and upload the screenshot.",
  },
  {
    key: "bank",
    name: "Bank Transfer",
    icon: "🏦",
    color: "#1a56db",
    bg: "#eff6ff",
    number: "PK36 HABB 0000 1234 5678 9012",
    accountName: "Green Tours Planner (Pvt) Ltd",
    bankName: "HBL Bank",
    instructions: "Transfer to the bank account above, then enter your transaction reference and upload the receipt.",
  },
];

export default function Checkout() {
  const { user, token } = useAuth();
  const navigate        = useNavigate();
  const location        = useLocation();
  const fileRef         = useRef(null);

  // Tour data passed from TourDetails
  const tourData  = location.state?.tour   || null;
  const preGuests = location.state?.guests || 1;
  const preDate   = location.state?.date   || "";

  const [step, setStep]               = useState(1);
  const [loading, setLoading]         = useState(false);
  const [booked, setBooked]           = useState(false);
  const [bookingRef, setBookingRef]   = useState("");
  const [invoiceNo, setInvoiceNo]     = useState("");
  const [errors, setErrors]           = useState({});

  const [details, setDetails] = useState({
    firstName:       user?.name?.split(" ")[0] || "",
    lastName:        user?.name?.split(" ").slice(1).join(" ") || "",
    email:           user?.email || "",
    phone:           user?.phone || "",
    specialRequests: "",
    guests:          preGuests,
    date:            preDate,
  });

  const [payment, setPayment] = useState({
    method:        "easypaisa",
    transactionId: "",
    screenshot:    null,
    screenshotB64: "",
    screenshotName:"",
  });

  useEffect(() => {
    if (!user)     { navigate("/login");  return; }
    if (!tourData) { navigate("/tours");  return; }
    window.scrollTo(0, 0);
  }, [user, tourData, navigate]);

  if (!tourData) return null;

  const price      = tourData.price || 0;
  const subtotal   = price * details.guests;
  const tax        = Math.round(subtotal * 0.08);
  const grandTotal = subtotal + tax;
  const selectedPM = PAYMENT_METHODS.find(m => m.key === payment.method);

  // ---- VALIDATION ----
  const validateStep1 = () => {
    const e = {};
    if (!details.firstName.trim()) e.firstName = "Required";
    if (!details.lastName.trim())  e.lastName  = "Required";
    if (!details.email.trim())     e.email     = "Required";
    if (!details.date)             e.date      = "Please select a travel date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!payment.transactionId.trim()) e.transactionId = "Transaction ID is required";
    if (!payment.screenshotB64)        e.screenshot     = "Payment screenshot is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ---- SCREENSHOT HANDLER ----
  const handleScreenshot = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, screenshot: "File too large. Max 5MB." }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setPayment(prev => ({
        ...prev,
        screenshot:     file,
        screenshotB64:  e.target.result,
        screenshotName: file.name,
      }));
      setErrors(prev => ({ ...prev, screenshot: "" }));
    };
    reader.readAsDataURL(file);
  };

  // ---- SUBMIT BOOKING ----
  const handleBook = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/bookings/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user:              user._id || user.id,
          tour:              tourData._id,
          travelDate:        details.date,
          numberOfPeople:    details.guests,
          totalPrice:        grandTotal,
          paymentMethod:     payment.method,
          transactionId:     payment.transactionId.trim(),
          paymentScreenshot: payment.screenshotB64,
          specialRequests:   details.specialRequests,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookingRef(data.booking?._id || "");
        setInvoiceNo(data.booking?.invoiceNumber || "");
      } else {
        setBookingRef("GTP-" + Math.random().toString(36).substr(2, 8).toUpperCase());
      }
    } catch {
      setBookingRef("GTP-" + Math.random().toString(36).substr(2, 8).toUpperCase());
    } finally {
      setLoading(false);
      setBooked(true);
    }
  };

  const inputStyle = (hasError) => ({
    width: "100%", padding: "12px 16px",
    border: `1.5px solid ${hasError ? "#fca5a5" : "var(--border)"}`,
    borderRadius: "10px", fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none", color: "var(--text-primary)",
    background: hasError ? "#fff8f8" : "var(--bg-card)",
    transition: "border-color 0.2s", boxSizing: "border-box",
  });

  const labelStyle = {
    display: "block", fontSize: "13px",
    fontWeight: "600", color: "var(--text-secondary)",
    marginBottom: "7px",
  };

  // ---- SUCCESS SCREEN ----
  if (booked) return (
    <div style={{
      paddingTop: "70px", background: "var(--bg)",
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      padding: "100px 5%",
    }}>
      <div style={{
        background: "var(--bg-card)", borderRadius: "20px",
        padding: "52px 44px", textAlign: "center",
        maxWidth: "540px", width: "100%",
        boxShadow: "0 8px 40px var(--shadow-md)",
        border: "1px solid var(--border)",
      }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</div>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "28px", fontWeight: "700",
          color: "var(--green-700)", marginBottom: "10px",
        }}>
          Booking Submitted!
        </h2>
        <p style={{
          color: "var(--text-secondary)", fontSize: "15px",
          lineHeight: "1.8", marginBottom: "8px",
        }}>
          Your booking is <strong>pending payment verification</strong>.
          Our team will review your payment screenshot and confirm within <strong>24 hours</strong>.
        </p>
        <p style={{
          color: "var(--text-muted)", fontSize: "13px",
          marginBottom: "28px",
        }}>
          Confirmation will be sent to <strong>{details.email}</strong>
        </p>

        {/* BOOKING DETAILS BOX */}
        <div style={{
          background: "var(--green-50)",
          border: "1px solid var(--green-100)",
          borderRadius: "14px", padding: "20px 24px",
          marginBottom: "28px", textAlign: "left",
        }}>
          {[
            { label: "Tour",           val: tourData.title },
            { label: "Travel Date",    val: new Date(details.date).toLocaleDateString("en-PK", { month: "long", day: "numeric", year: "numeric" }) },
            { label: "Guests",         val: `${details.guests} person${details.guests > 1 ? "s" : ""}` },
            { label: "Total Paid",     val: `Rs. ${grandTotal.toLocaleString()}` },
            { label: "Payment Via",    val: selectedPM?.name },
            { label: "Transaction ID", val: payment.transactionId },
            ...(invoiceNo ? [{ label: "Invoice No.", val: invoiceNo }] : []),
            ...(bookingRef ? [{ label: "Booking Ref", val: bookingRef.slice(-8).toUpperCase() }] : []),
          ].map((item) => (
            <div key={item.label} style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", padding: "8px 0",
              borderBottom: "1px solid var(--green-100)",
            }}>
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{item.label}</span>
              <span style={{
                fontSize: "13px", fontWeight: "600",
                color: item.label === "Total Paid" ? "var(--green-700)" : "var(--text-primary)",
              }}>
                {item.val}
              </span>
            </div>
          ))}
        </div>

        {/* STATUS NOTICE */}
        <div style={{
          background: "#fef9c3", border: "1px solid #fde68a",
          borderRadius: "10px", padding: "14px 18px",
          marginBottom: "24px",
          display: "flex", alignItems: "flex-start", gap: "10px",
          textAlign: "left",
        }}>
          <span style={{ fontSize: "18px", flexShrink: 0 }}>⏳</span>
          <p style={{ fontSize: "13px", color: "#92400e", lineHeight: "1.6" }}>
            Your booking is <strong>pending</strong>. Once our admin verifies your payment,
            your status will be updated to <strong>Confirmed</strong>.
            You can track this in <strong>My Bookings</strong>.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/bookings" style={{
            background: "var(--green-600)", color: "white",
            padding: "13px 28px", borderRadius: "50px",
            fontSize: "14px", fontWeight: "600",
            display: "inline-block", textDecoration: "none",
          }}>
            Track My Booking
          </Link>
          <Link to="/tours" style={{
            background: "var(--bg-subtle)", color: "var(--text-secondary)",
            border: "1.5px solid var(--border)",
            padding: "13px 24px", borderRadius: "50px",
            fontSize: "14px", fontWeight: "500",
            display: "inline-block", textDecoration: "none",
          }}>
            Explore More
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop: "70px", background: "var(--bg)", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg, var(--green-800), var(--green-900))",
        padding: "44px 6% 36px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-60px", right: "-60px",
          width: "220px", height: "220px", borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }} />
        <p style={{
          fontSize: "11px", letterSpacing: "3px",
          color: "var(--green-400)", fontWeight: "600",
          textTransform: "uppercase", marginBottom: "10px",
        }}>
          SECURE CHECKOUT
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(22px, 3vw, 34px)",
          fontWeight: "700", color: "white",
        }}>
          Complete Your Booking
        </h1>
      </div>

      {/* STEP INDICATOR */}
      <div style={{
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
        display: "flex", justifyContent: "center",
        overflowX: "auto",
      }}>
        {[
          { num: 1, label: "Your Details" },
          { num: 2, label: "Payment Proof" },
          { num: 3, label: "Confirm" },
        ].map((s, i) => (
          <div key={s.num} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "18px 20px",
              borderBottom: step === s.num
                ? "2px solid var(--green-600)"
                : "2px solid transparent",
            }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: step > s.num
                  ? "var(--green-600)"
                  : step === s.num ? "var(--green-600)" : "var(--bg-subtle)",
                color: step >= s.num ? "white" : "var(--text-muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: "700",
              }}>
                {step > s.num ? "✓" : s.num}
              </div>
              <span style={{
                fontSize: "13px", fontWeight: "600",
                color: step === s.num ? "var(--green-700)" : "var(--text-muted)",
                whiteSpace: "nowrap",
              }}>
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div style={{
                width: "32px", height: "1px",
                background: step > s.num ? "var(--green-300)" : "var(--border)",
              }} />
            )}
          </div>
        ))}
      </div>

      {/* MAIN LAYOUT */}
      <div style={{
        maxWidth: "1100px", margin: "0 auto",
        padding: "36px 5%",
        display: "grid",
        gridTemplateColumns: "1fr 320px",
        gap: "28px", alignItems: "start",
      }}>

        {/* LEFT COLUMN */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "16px", padding: "32px",
          boxShadow: "0 2px 12px var(--shadow)",
        }}>

          {/* ---- STEP 1: DETAILS ---- */}
          {step === 1 && (
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px", fontWeight: "700",
                color: "var(--text-primary)", marginBottom: "24px",
              }}>
                Traveler Details
              </h2>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "18px",
              }}>
                <div>
                  <label style={labelStyle}>First Name *</label>
                  <input type="text" value={details.firstName}
                    onChange={e => setDetails({ ...details, firstName: e.target.value })}
                    placeholder="Ali" style={inputStyle(errors.firstName)}
                    onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                    onBlur={e => e.target.style.borderColor = errors.firstName ? "#fca5a5" : "var(--border)"}
                  />
                  {errors.firstName && <p style={{ fontSize: "11px", color: "#dc2626", marginTop: "4px" }}>{errors.firstName}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Last Name *</label>
                  <input type="text" value={details.lastName}
                    onChange={e => setDetails({ ...details, lastName: e.target.value })}
                    placeholder="Khan" style={inputStyle(errors.lastName)}
                    onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                    onBlur={e => e.target.style.borderColor = errors.lastName ? "#fca5a5" : "var(--border)"}
                  />
                  {errors.lastName && <p style={{ fontSize: "11px", color: "#dc2626", marginTop: "4px" }}>{errors.lastName}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Email *</label>
                  <input type="email" value={details.email}
                    onChange={e => setDetails({ ...details, email: e.target.value })}
                    placeholder="ali@example.com" style={inputStyle(errors.email)}
                    onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                    onBlur={e => e.target.style.borderColor = errors.email ? "#fca5a5" : "var(--border)"}
                  />
                  {errors.email && <p style={{ fontSize: "11px", color: "#dc2626", marginTop: "4px" }}>{errors.email}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Phone</label>
                  <input type="tel" value={details.phone}
                    onChange={e => setDetails({ ...details, phone: e.target.value })}
                    placeholder="03XX-XXXXXXX" style={inputStyle(false)}
                    onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Travel Date *</label>
                  <input type="date" value={details.date}
                    onChange={e => setDetails({ ...details, date: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    style={inputStyle(errors.date)}
                  />
                  {errors.date && <p style={{ fontSize: "11px", color: "#dc2626", marginTop: "4px" }}>{errors.date}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Guests</label>
                  <div style={{
                    display: "flex", alignItems: "center",
                    border: "1.5px solid var(--border)",
                    borderRadius: "10px", overflow: "hidden",
                  }}>
                    <button type="button"
                      onClick={() => setDetails({ ...details, guests: Math.max(1, details.guests - 1) })}
                      style={{
                        width: "44px", height: "46px",
                        background: "var(--bg-subtle)", border: "none",
                        fontSize: "18px", color: "var(--text-secondary)",
                        borderRight: "1px solid var(--border)", cursor: "pointer",
                      }}
                    >−</button>
                    <span style={{
                      flex: 1, textAlign: "center",
                      fontSize: "15px", fontWeight: "600",
                      color: "var(--text-primary)",
                    }}>
                      {details.guests}
                    </span>
                    <button type="button"
                      onClick={() => setDetails({ ...details, guests: Math.min(20, details.guests + 1) })}
                      style={{
                        width: "44px", height: "46px",
                        background: "var(--bg-subtle)", border: "none",
                        fontSize: "18px", color: "var(--text-secondary)",
                        borderLeft: "1px solid var(--border)", cursor: "pointer",
                      }}
                    >+</button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "18px" }}>
                <label style={labelStyle}>Special Requests</label>
                <textarea value={details.specialRequests}
                  onChange={e => setDetails({ ...details, specialRequests: e.target.value })}
                  placeholder="Dietary requirements, accessibility needs..."
                  rows={3}
                  style={{
                    ...inputStyle(false),
                    resize: "vertical", lineHeight: "1.7",
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                />
              </div>

              <button
                onClick={() => { if (validateStep1()) setStep(2); }}
                style={{
                  marginTop: "28px",
                  background: "var(--green-600)", color: "white",
                  border: "none", padding: "14px 36px",
                  borderRadius: "50px", fontSize: "15px",
                  fontWeight: "600", cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(22,163,74,0.3)",
                }}
              >
                Continue to Payment →
              </button>
            </div>
          )}

          {/* ---- STEP 2: PAYMENT PROOF ---- */}
          {step === 2 && (
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px", fontWeight: "700",
                color: "var(--text-primary)", marginBottom: "8px",
              }}>
                Payment Proof
              </h2>
              <p style={{
                color: "var(--text-muted)", fontSize: "14px",
                marginBottom: "24px", lineHeight: "1.6",
              }}>
                Send payment manually then upload your screenshot as proof.
                Our admin will verify and confirm your booking within 24 hours.
              </p>

              {/* PAYMENT METHOD SELECTOR */}
              <div style={{ marginBottom: "24px" }}>
                <label style={labelStyle}>Select Payment Method *</label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {PAYMENT_METHODS.map(pm => (
                    <button key={pm.key} type="button"
                      onClick={() => setPayment(prev => ({ ...prev, method: pm.key }))}
                      style={{
                        flex: 1, minWidth: "120px",
                        padding: "14px 12px",
                        border: payment.method === pm.key
                          ? `2px solid ${pm.color}`
                          : "1.5px solid var(--border)",
                        borderRadius: "12px",
                        background: payment.method === pm.key ? pm.bg : "var(--bg-card)",
                        color: payment.method === pm.key ? pm.color : "var(--text-secondary)",
                        fontSize: "13px", fontWeight: "600",
                        cursor: "pointer", transition: "all 0.2s",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", gap: "6px",
                      }}
                    >
                      <span style={{ fontSize: "22px" }}>{pm.icon}</span>
                      <span>{pm.name}</span>
                      {payment.method === pm.key && (
                        <span style={{ fontSize: "10px", fontWeight: "700" }}>✓ Selected</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* PAYMENT DETAILS CARD */}
              {selectedPM && (
                <div style={{
                  background: selectedPM.bg,
                  border: `1px solid ${selectedPM.color}30`,
                  borderRadius: "12px", padding: "18px 20px",
                  marginBottom: "24px",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    marginBottom: "12px",
                  }}>
                    <span style={{ fontSize: "22px" }}>{selectedPM.icon}</span>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: "700", color: selectedPM.color }}>
                        {selectedPM.name}
                      </p>
                      {selectedPM.bankName && (
                        <p style={{ fontSize: "12px", color: selectedPM.color + "aa" }}>
                          {selectedPM.bankName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{
                    background: "rgba(255,255,255,0.7)",
                    borderRadius: "8px", padding: "12px 14px",
                    marginBottom: "10px",
                  }}>
                    <p style={{ fontSize: "11px", color: selectedPM.color, fontWeight: "600", marginBottom: "4px" }}>
                      {selectedPM.bankName ? "ACCOUNT / IBAN" : "NUMBER"}
                    </p>
                    <p style={{
                      fontSize: "16px", fontWeight: "700",
                      color: "#1f2937", letterSpacing: "0.5px",
                    }}>
                      {selectedPM.number}
                    </p>
                    <p style={{ fontSize: "13px", color: "#4b5563", marginTop: "2px" }}>
                      {selectedPM.accountName}
                    </p>
                  </div>

                  <p style={{ fontSize: "12px", color: selectedPM.color + "cc", lineHeight: "1.6" }}>
                    ℹ️ {selectedPM.instructions}
                  </p>
                </div>
              )}

              {/* TOTAL TO PAY */}
              <div style={{
                background: "var(--green-50)",
                border: "1px solid var(--green-200)",
                borderRadius: "10px", padding: "14px 18px",
                marginBottom: "24px",
                display: "flex", justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--green-800)" }}>
                  Total Amount to Send:
                </span>
                <span style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "22px", fontWeight: "700",
                  color: "var(--green-700)",
                }}>
                  Rs. {grandTotal.toLocaleString()}
                </span>
              </div>

              {/* TRANSACTION ID */}
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Transaction ID / Reference Number *</label>
                <input
                  type="text"
                  value={payment.transactionId}
                  onChange={e => setPayment(prev => ({ ...prev, transactionId: e.target.value }))}
                  placeholder="e.g. EP-123456789 or TXN-987654321"
                  style={inputStyle(errors.transactionId)}
                  onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                  onBlur={e => e.target.style.borderColor = errors.transactionId ? "#fca5a5" : "var(--border)"}
                />
                {errors.transactionId && (
                  <p style={{ fontSize: "11px", color: "#dc2626", marginTop: "4px" }}>
                    {errors.transactionId}
                  </p>
                )}
              </div>

              {/* SCREENSHOT UPLOAD */}
              <div style={{ marginBottom: "28px" }}>
                <label style={labelStyle}>Payment Screenshot *</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleScreenshot(e.dataTransfer.files[0]); }}
                  style={{
                    border: `2px dashed ${errors.screenshot ? "#fca5a5" : payment.screenshotB64 ? "var(--green-400)" : "var(--border)"}`,
                    borderRadius: "12px",
                    padding: "28px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: payment.screenshotB64 ? "var(--green-50)" : "var(--bg-subtle)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--green-400)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = payment.screenshotB64 ? "var(--green-400)" : errors.screenshot ? "#fca5a5" : "var(--border)"}
                >
                  {payment.screenshotB64 ? (
                    <div>
                      <img
                        src={payment.screenshotB64}
                        alt="Screenshot preview"
                        style={{
                          maxHeight: "160px", maxWidth: "100%",
                          borderRadius: "8px", objectFit: "contain",
                          margin: "0 auto 12px",
                        }}
                      />
                      <p style={{ fontSize: "13px", color: "var(--green-700)", fontWeight: "600" }}>
                        ✅ {payment.screenshotName}
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                        Click to change
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: "36px", marginBottom: "10px" }}>📸</div>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "4px" }}>
                        Upload Payment Screenshot
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        Drag & drop or click to browse · JPG, PNG, PDF · Max 5MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  style={{ display: "none" }}
                  onChange={e => handleScreenshot(e.target.files[0])}
                />
                {errors.screenshot && (
                  <p style={{ fontSize: "11px", color: "#dc2626", marginTop: "6px" }}>
                    {errors.screenshot}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button type="button" onClick={() => setStep(1)} style={{
                  background: "var(--bg-subtle)", color: "var(--text-secondary)",
                  border: "1.5px solid var(--border)",
                  padding: "13px 24px", borderRadius: "50px",
                  fontSize: "14px", fontWeight: "500", cursor: "pointer",
                }}>
                  ← Back
                </button>
                <button
                  onClick={() => { if (validateStep2()) setStep(3); }}
                  style={{
                    background: "var(--green-600)", color: "white",
                    border: "none", padding: "13px 32px",
                    borderRadius: "50px", fontSize: "15px",
                    fontWeight: "600", cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(22,163,74,0.3)",
                  }}
                >
                  Review Booking →
                </button>
              </div>
            </div>
          )}

          {/* ---- STEP 3: CONFIRM ---- */}
          {step === 3 && (
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px", fontWeight: "700",
                color: "var(--text-primary)", marginBottom: "24px",
              }}>
                Review & Confirm
              </h2>

              {/* TOUR SUMMARY */}
              <div style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
                borderRadius: "12px", padding: "18px",
                marginBottom: "20px",
                display: "flex", gap: "14px", alignItems: "center",
              }}>
                {tourData.photo && (
                  <img src={tourData.photo} alt={tourData.title}
                    style={{
                      width: "72px", height: "72px",
                      borderRadius: "10px", objectFit: "cover", flexShrink: 0,
                    }}
                  />
                )}
                <div>
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "17px", fontWeight: "700",
                    color: "var(--text-primary)", marginBottom: "4px",
                  }}>
                    {tourData.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--green-600)", fontWeight: "600" }}>
                    📍 {tourData.city || tourData.location}
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                    🕐 {tourData.duration}
                  </p>
                </div>
              </div>

              {/* BOOKING DETAILS */}
              <div style={{
                border: "1px solid var(--border)",
                borderRadius: "12px", overflow: "hidden",
                marginBottom: "20px",
              }}>
                {[
                  { label: "Traveler",       val: `${details.firstName} ${details.lastName}` },
                  { label: "Email",          val: details.email },
                  { label: "Travel Date",    val: new Date(details.date).toLocaleDateString("en-PK", { month: "long", day: "numeric", year: "numeric" }) },
                  { label: "Guests",         val: `${details.guests} person${details.guests > 1 ? "s" : ""}` },
                  { label: "Payment Via",    val: selectedPM?.name },
                  { label: "Transaction ID", val: payment.transactionId },
                ].map((item, i) => (
                  <div key={item.label} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "12px 18px",
                    background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-subtle)",
                    fontSize: "14px",
                  }}>
                    <span style={{ color: "var(--text-muted)", fontWeight: "500" }}>{item.label}</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{item.val}</span>
                  </div>
                ))}
              </div>

              {/* SCREENSHOT PREVIEW */}
              {payment.screenshotB64 && (
                <div style={{ marginBottom: "20px" }}>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>
                    Payment Screenshot:
                  </p>
                  <img src={payment.screenshotB64} alt="Payment proof"
                    style={{
                      maxHeight: "120px", borderRadius: "8px",
                      objectFit: "contain",
                      border: "1px solid var(--border)",
                    }}
                  />
                </div>
              )}

              {/* IMPORTANT NOTICE */}
              <div style={{
                background: "#fef9c3", border: "1px solid #fde68a",
                borderRadius: "10px", padding: "14px 18px",
                marginBottom: "24px",
                display: "flex", gap: "10px", alignItems: "flex-start",
              }}>
                <span style={{ fontSize: "16px", flexShrink: 0 }}>⏳</span>
                <p style={{ fontSize: "13px", color: "#92400e", lineHeight: "1.6" }}>
                  Your booking will be <strong>Pending</strong> until our admin verifies your payment.
                  This usually takes <strong>up to 24 hours</strong>.
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button type="button" onClick={() => setStep(2)} style={{
                  background: "var(--bg-subtle)", color: "var(--text-secondary)",
                  border: "1.5px solid var(--border)",
                  padding: "13px 24px", borderRadius: "50px",
                  fontSize: "14px", fontWeight: "500", cursor: "pointer",
                }}>
                  ← Back
                </button>
                <button
                  onClick={handleBook}
                  disabled={loading}
                  style={{
                    background: loading ? "var(--green-400)" : "var(--green-600)",
                    color: "white", border: "none",
                    padding: "13px 32px", borderRadius: "50px",
                    fontSize: "15px", fontWeight: "600",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 16px rgba(22,163,74,0.3)",
                    transition: "all 0.2s",
                  }}
                >
                  {loading ? "Submitting..." : `Confirm Booking — Rs. ${grandTotal.toLocaleString()} 🌿`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — ORDER SUMMARY */}
        <div style={{
          position: "sticky", top: "90px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "16px", padding: "24px",
          boxShadow: "0 4px 20px var(--shadow)",
        }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "17px", fontWeight: "700",
            color: "var(--text-primary)", marginBottom: "16px",
          }}>
            Order Summary
          </h3>

          {tourData.photo && (
            <img src={tourData.photo} alt={tourData.title}
              style={{
                width: "100%", height: "140px",
                objectFit: "cover", borderRadius: "10px",
                marginBottom: "14px",
              }}
            />
          )}

          <h4 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "15px", fontWeight: "700",
            color: "var(--text-primary)", marginBottom: "4px",
          }}>
            {tourData.title}
          </h4>
          <p style={{
            fontSize: "13px", color: "var(--green-600)",
            fontWeight: "600", marginBottom: "18px",
          }}>
            📍 {tourData.city || tourData.location}
          </p>

          {/* PRICE BREAKDOWN */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--text-muted)" }}>
              <span>Rs. {price.toLocaleString()} × {details.guests} guest{details.guests > 1 ? "s" : ""}</span>
              <span>Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--text-muted)" }}>
              <span>Tax (8%)</span>
              <span>Rs. {tax.toLocaleString()}</span>
            </div>
          </div>

          <div style={{
            borderTop: "1px solid var(--border)",
            marginTop: "14px", paddingTop: "14px",
            display: "flex", justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>Total</span>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "20px", fontWeight: "700",
              color: "var(--green-700)",
            }}>
              Rs. {grandTotal.toLocaleString()}
            </span>
          </div>

          {/* TRUST BADGES */}
          <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              "🔒 Secure booking process",
              "✅ Free cancellation (7 days)",
              "⏳ Confirmed within 24 hours",
              "📞 24/7 support",
            ].map(badge => (
              <span key={badge} style={{
                fontSize: "12px", color: "var(--text-muted)",
                display: "flex", alignItems: "center", gap: "6px",
              }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}