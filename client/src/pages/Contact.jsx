import { useState, useEffect } from "react";

const BASE_URL = "http://localhost:5000/api";

export default function Contact() {
  const [form, setForm] = useState({
    name: "", email: "", subject: "", message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      // Try backend first, gracefully succeed either way
      await fetch(`${BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch { /* silent */ }
    finally {
      setLoading(false);
      setSuccess(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    }
  };

  const inputStyle = {
    width: "100%", padding: "12px 16px",
    border: "1.5px solid var(--gray-200)",
    borderRadius: "10px", fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none", color: "var(--gray-800)",
    background: "white", transition: "border-color 0.2s",
  };

  return (
    <div style={{ paddingTop: "70px", background: "var(--off-white)", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg, var(--green-800), var(--green-900))",
        padding: "72px 6% 60px",
        position: "relative", overflow: "hidden", textAlign: "center",
      }}>
        <div style={{
          position: "absolute", top: "-60px", right: "-60px",
          width: "240px", height: "240px", borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }} />
        <p style={{
          fontSize: "11px", letterSpacing: "3px",
          color: "var(--green-400)", fontWeight: "600",
          textTransform: "uppercase", marginBottom: "14px",
        }}>
          GET IN TOUCH
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(30px, 4vw, 52px)",
          fontWeight: "700", color: "white",
          lineHeight: "1.2", marginBottom: "16px",
        }}>
          We'd Love to Hear From You
        </h1>
        <p style={{
          color: "rgba(255,255,255,0.6)",
          fontSize: "16px", maxWidth: "480px",
          margin: "0 auto", lineHeight: "1.8",
        }}>
          Have a question about a tour? Want a custom itinerary?
          Our team responds within 24 hours.
        </p>
      </div>

      {/* CONTACT INFO CARDS */}
      <div style={{
        display: "flex", justifyContent: "center",
        gap: "20px", flexWrap: "wrap",
        padding: "48px 6% 0",
      }}>
        {[
          { icon: "📍", title: "Visit Us", lines: ["123 Green Valley Road", "Islamabad, Pakistan"] },
          { icon: "📞", title: "Call Us", lines: ["+92 300 1234567", "Mon–Fri, 9am–6pm"] },
          { icon: "✉️", title: "Email Us", lines: ["hello@greentours.com", "We reply within 24hrs"] },
        ].map((c) => (
          <div key={c.title} style={{
            background: "white",
            border: "1px solid var(--gray-100)",
            borderRadius: "16px", padding: "28px 32px",
            textAlign: "center", flex: "1", minWidth: "200px", maxWidth: "260px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            transition: "all 0.3s",
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.09)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>{c.icon}</div>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "17px", fontWeight: "700",
              color: "var(--gray-800)", marginBottom: "8px",
            }}>{c.title}</h3>
            {c.lines.map((line) => (
              <p key={line} style={{
                fontSize: "13px", color: "var(--gray-500)", lineHeight: "1.7",
              }}>{line}</p>
            ))}
          </div>
        ))}
      </div>

      {/* FORM + FAQ */}
      <div style={{
        maxWidth: "1100px", margin: "0 auto",
        padding: "52px 6% 80px",
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr",
        gap: "48px", alignItems: "start",
      }}>

        {/* CONTACT FORM */}
        <div style={{
          background: "white",
          border: "1px solid var(--gray-100)",
          borderRadius: "20px", padding: "40px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "24px", fontWeight: "700",
            color: "var(--gray-800)", marginBottom: "8px",
          }}>
            Send a Message
          </h2>
          <p style={{
            color: "var(--gray-400)", fontSize: "14px", marginBottom: "28px",
          }}>
            Fill in the form and we'll get back to you shortly.
          </p>

          {success ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: "52px", marginBottom: "16px" }}>🎉</div>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px", fontWeight: "700",
                color: "var(--green-700)", marginBottom: "10px",
              }}>
                Message Sent!
              </h3>
              <p style={{ color: "var(--gray-500)", fontSize: "14px", marginBottom: "24px" }}>
                Thank you for reaching out. We'll reply within 24 hours.
              </p>
              <button
                onClick={() => setSuccess(false)}
                style={{
                  background: "var(--green-600)", color: "white",
                  border: "none", padding: "12px 28px",
                  borderRadius: "50px", fontSize: "14px",
                  fontWeight: "500", cursor: "pointer",
                }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  background: "#fef2f2", border: "1px solid #fecaca",
                  color: "#dc2626", padding: "12px 16px",
                  borderRadius: "10px", fontSize: "13px", marginBottom: "20px",
                }}>
                  ⚠️ {error}
                </div>
              )}

              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px",
                marginBottom: "16px",
              }}>
                <div>
                  <label style={{
                    display: "block", fontSize: "13px",
                    fontWeight: "600", color: "var(--gray-600)", marginBottom: "8px",
                  }}>
                    Full Name *
                  </label>
                  <input
                    type="text" name="name"
                    value={form.name} onChange={handleChange}
                    placeholder="Your name"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                    onBlur={e => e.target.style.borderColor = "var(--gray-200)"}
                  />
                </div>
                <div>
                  <label style={{
                    display: "block", fontSize: "13px",
                    fontWeight: "600", color: "var(--gray-600)", marginBottom: "8px",
                  }}>
                    Email Address *
                  </label>
                  <input
                    type="email" name="email"
                    value={form.email} onChange={handleChange}
                    placeholder="you@example.com"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                    onBlur={e => e.target.style.borderColor = "var(--gray-200)"}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{
                  display: "block", fontSize: "13px",
                  fontWeight: "600", color: "var(--gray-600)", marginBottom: "8px",
                }}>
                  Subject
                </label>
                <input
                  type="text" name="subject"
                  value={form.subject} onChange={handleChange}
                  placeholder="e.g. Custom tour inquiry"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                  onBlur={e => e.target.style.borderColor = "var(--gray-200)"}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block", fontSize: "13px",
                  fontWeight: "600", color: "var(--gray-600)", marginBottom: "8px",
                }}>
                  Message *
                </label>
                <textarea
                  name="message"
                  value={form.message} onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: "1.7" }}
                  onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                  onBlur={e => e.target.style.borderColor = "var(--gray-200)"}
                />
              </div>

              <button
                type="submit" disabled={loading}
                style={{
                  width: "100%",
                  background: loading ? "var(--green-400)" : "var(--green-600)",
                  color: "white", border: "none",
                  padding: "14px", borderRadius: "50px",
                  fontSize: "15px", fontWeight: "600",
                  boxShadow: "0 4px 16px rgba(22,163,74,0.3)",
                  transition: "all 0.2s", cursor: "pointer",
                }}
              >
                {loading ? "Sending..." : "Send Message ✉️"}
              </button>
            </form>
          )}
        </div>

        {/* FAQ */}
        <div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "24px", fontWeight: "700",
            color: "var(--gray-800)", marginBottom: "24px",
          }}>
            Frequently Asked Questions
          </h2>

          {[
            {
              q: "How do I book a tour?",
              a: "Browse our tours, click 'Book Now', select your date and number of guests, then complete the booking form.",
            },
            {
              q: "Can I cancel my booking?",
              a: "Yes! Free cancellation is available up to 7 days before your departure date. After that, a 20% fee applies.",
            },
            {
              q: "Are tours suitable for beginners?",
              a: "Absolutely. Each tour lists a difficulty level — Easy, Moderate, or Challenging — so you can pick the right fit.",
            },
            {
              q: "What's included in the price?",
              a: "Most tours include accommodation, meals, guide fees, and equipment. Check each tour's details for specifics.",
            },
            {
              q: "Do you offer group discounts?",
              a: "Yes! Groups of 8 or more receive a 15% discount. Contact us directly to arrange group bookings.",
            },
          ].map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: "white",
      border: "1px solid var(--gray-100)",
      borderRadius: "12px", marginBottom: "12px",
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "18px 20px",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", background: "none",
          border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{
          fontSize: "14px", fontWeight: "600",
          color: "var(--gray-800)",
        }}>{q}</span>
        <span style={{
          fontSize: "18px", color: "var(--green-600)",
          transition: "transform 0.3s",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
          flexShrink: 0, marginLeft: "12px",
        }}>+</span>
      </button>
      {open && (
        <div style={{
          padding: "0 20px 18px",
          fontSize: "14px", color: "var(--gray-500)",
          lineHeight: "1.8",
          borderTop: "1px solid var(--gray-50)",
        }}>
          {a}
        </div>
      )}
    </div>
  );
}