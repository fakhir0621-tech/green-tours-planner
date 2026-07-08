import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/green tours logo.png";


export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: "var(--green-900)",
      color: "rgba(255,255,255,0.7)",
      paddingTop: "64px",
    }}>

      <style>{`
        /* ── FOOTER GRID ── */
        .footer-main-grid {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 6% 48px;
          display: grid;
          grid-template-columns: 1.8fr 1fr 1fr 1.2fr;
          gap: 48px;
        }

        /* Medium screens — tablets landscape */
        @media (max-width: 1024px) {
          .footer-main-grid {
            grid-template-columns: 1.4fr 1fr 1fr;
            gap: 36px;
          }
          /* Newsletter col spans full width on its own row */
          .footer-col-newsletter {
            grid-column: 1 / -1;
          }
        }

        /* Tablets portrait */
        @media (max-width: 768px) {
          .footer-main-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            padding: 0 6% 40px;
          }
          .footer-col-brand {
            grid-column: 1 / -1;
          }
          .footer-col-newsletter {
            grid-column: 1 / -1;
          }
        }

        /* Mobile phones */
        @media (max-width: 480px) {
          .footer-main-grid {
            grid-template-columns: 1fr;
            gap: 28px;
            padding: 0 5% 36px;
          }
          .footer-col-brand,
          .footer-col-newsletter {
            grid-column: auto;
          }
        }

        /* ── BOTTOM BAR ── */
        .footer-bottom-bar {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 6%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .footer-legal-links {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }
        @media (max-width: 480px) {
          .footer-bottom-bar {
            flex-direction: column;
            align-items: flex-start;
            padding: 16px 5%;
            gap: 10px;
          }
          .footer-legal-links {
            gap: 16px;
          }
        }

        /* ── TRUST BAR (in reviews section used separately) ── */
        .footer-trust-inner {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 24px;
        }

        /* Brand description max-width relaxes on single-col */
        @media (max-width: 480px) {
          .footer-brand-desc {
            max-width: 100% !important;
          }
        }

        /* Newsletter input container */
        .footer-newsletter-form {
          display: flex;
          gap: 0;
        }
        .footer-newsletter-input {
          flex: 1;
          min-width: 0;
          padding: 11px 14px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-right: none;
          border-radius: 8px 0 0 8px;
          font-size: 13px;
          color: white;
          font-family: 'DM Sans', sans-serif;
          outline: none;
        }
        .footer-newsletter-btn {
          background: var(--green-600);
          border: none;
          color: white;
          padding: 11px 16px;
          border-radius: 0 8px 8px 0;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
        }
        .footer-newsletter-btn:hover { background: var(--green-500); }

        /* Divider */
        .footer-divider {
          border-top: 1px solid rgba(255,255,255,0.08);
          max-width: 1200px;
          margin: 0 auto;
        }
      `}</style>

      {/* MAIN FOOTER GRID */}
      <div className="footer-main-grid">

{/* BRAND COLUMN */}
<div className="footer-col-brand">
  <Link
    to="/"
    style={{
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      marginBottom: "16px",
    }}
  >
    <img
      src={logo}
      alt="Green Tours Planner"
      style={{
        height: "70px",
        width: "auto",
        objectFit: "contain",
        display: "block",
      }}
    />
  </Link>
          <p className="footer-brand-desc" style={{
            fontSize: "14px", lineHeight: "1.9",
            color: "rgba(255,255,255,0.55)",
            maxWidth: "280px", marginBottom: "24px",
          }}>
            Crafting responsible, unforgettable travel experiences
            since 2015. Your adventure, our passion.
          </p>

          {/* SOCIAL ICONS */}
          <div style={{ display: "flex", gap: "10px" }}>
            {[
              { icon: "𝕏", label: "Twitter" },
              { icon: "f", label: "Facebook" },
              { icon: "in", label: "Instagram" },
              { icon: "▶", label: "YouTube" },
            ].map((s) => (
              <button key={s.label}
                title={s.label}
                style={{
                  width: "36px", height: "36px", borderRadius: "8px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "13px", fontWeight: "600",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "var(--green-600)";
                  e.currentTarget.style.borderColor = "var(--green-600)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }}
              >
                {s.icon}
              </button>
            ))}
          </div>
        </div>

        {/* EXPLORE COLUMN */}
        <div className="footer-col-explore">
          <h4 style={{
            color: "white", fontSize: "14px",
            fontWeight: "700", letterSpacing: "1px",
            textTransform: "uppercase",
            marginBottom: "20px",
          }}>
            Explore
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "All Tours", path: "/tours" },
              { label: "Adventure", path: "/tours?category=Adventure" },
              { label: "Nature",    path: "/tours?category=Nature" },
              { label: "Culture",   path: "/tours?category=Culture" },
              { label: "Beach",     path: "/tours?category=Beach" },
            ].map((link) => (
              <li key={link.path}>
                <Link to={link.path} style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "14px", textDecoration: "none",
                  transition: "color 0.2s",
                  display: "flex", alignItems: "center", gap: "6px",
                }}
                  onMouseEnter={e => e.target.style.color = "var(--green-400)"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.55)"}
                >
                  → {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* COMPANY COLUMN */}
        <div className="footer-col-company">
          <h4 style={{
            color: "white", fontSize: "14px",
            fontWeight: "700", letterSpacing: "1px",
            textTransform: "uppercase", marginBottom: "20px",
          }}>
            Company
          </h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "About Us",    path: "/about" },
              { label: "Contact",     path: "/contact" },
              { label: "My Bookings", path: "/bookings" },
              { label: "My Profile",  path: "/profile" },
              { label: "Register",    path: "/register" },
            ].map((link) => (
              <li key={link.path}>
                <Link to={link.path} style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "14px", textDecoration: "none",
                  transition: "color 0.2s",
                  display: "flex", alignItems: "center", gap: "6px",
                }}
                  onMouseEnter={e => e.target.style.color = "var(--green-400)"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.55)"}
                >
                  → {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* NEWSLETTER COLUMN */}
        <div className="footer-col-newsletter">
          <h4 style={{
            color: "white", fontSize: "14px",
            fontWeight: "700", letterSpacing: "1px",
            textTransform: "uppercase", marginBottom: "20px",
          }}>
            Stay Updated
          </h4>
          <p style={{
            fontSize: "14px", color: "rgba(255,255,255,0.55)",
            lineHeight: "1.8", marginBottom: "16px",
          }}>
            Get exclusive deals and travel inspiration straight to your inbox.
          </p>
          <NewsletterForm />

          {/* TRUST BADGES */}
          <div className="footer-trust-inner">
            {[
              "✅ Free cancellation up to 7 days",
              "🛡️ Secure payments",
              "⭐ 4.9 average rating",
            ].map((badge) => (
              <span key={badge} style={{
                fontSize: "12px", color: "rgba(255,255,255,0.5)",
                display: "flex", alignItems: "center", gap: "6px",
              }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="footer-divider" />

      {/* BOTTOM BAR */}
      <div className="footer-bottom-bar">
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: 0 }}>
          © {year} GreenTours Planner. All rights reserved.
        </p>
        <div className="footer-legal-links">
          {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
            <span key={item} style={{
              fontSize: "12px", color: "rgba(255,255,255,0.35)",
              cursor: "pointer", transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = "var(--green-400)"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.35)"}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setDone(true);
  };

  if (done) return (
    <div style={{
      background: "rgba(74,222,128,0.15)",
      border: "1px solid rgba(74,222,128,0.3)",
      borderRadius: "10px", padding: "12px 16px",
      fontSize: "13px", color: "var(--green-400)",
    }}>
      ✅ You're subscribed! Thanks for joining.
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="footer-newsletter-form">
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="footer-newsletter-input"
        onFocus={e => e.target.style.borderColor = "var(--green-500)"}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
      />
      <button type="submit" className="footer-newsletter-btn">
        Subscribe
      </button>
    </form>
  );
}

