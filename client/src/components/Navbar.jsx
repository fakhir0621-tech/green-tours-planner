import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [dropdown,   setDropdown]   = useState(false);
  const [modeOpen,   setModeOpen]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const modeRef     = useRef(null);
  const location    = useLocation();
  const navigate    = useNavigate();
  const { user, logout }          = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setDropdown(false);
    setModeOpen(false);
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdown(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (modeRef.current && !modeRef.current.contains(e.target))
        setModeOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdown(false);
    setMobileOpen(false);
    navigate("/");
  };

  // ---- Navigate to Account page and open a specific section ----
  const goToAccountSection = (section) => {
    setDropdown(false);
    setMobileOpen(false);
    navigate("/account", { state: { section } });
  };

  const solidNav = scrolled || !isHome || darkMode;

  const navStyle = {
    position: "fixed",
    top: 0, left: 0, right: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 5%",
    height: "70px",
    background: solidNav ? "var(--nav-bg)" : "rgba(0,0,0,0.15)",
    backdropFilter: "blur(18px)",
    borderBottom: `1px solid ${solidNav ? "var(--nav-border)" : "rgba(255,255,255,0.1)"}`,
    boxShadow: solidNav ? "0 2px 24px var(--shadow)" : "none",
    transition: "all 0.4s ease",
  };

  const linkColor  = solidNav ? "var(--text-secondary)" : "rgba(255,255,255,0.9)";
  const logoColor  = solidNav ? "var(--green-700)" : "white";
  const avatarSrc    = user?.photo;
  const avatarLetter = (user?.username || user?.name || user?.email || "U")[0].toUpperCase();

  return (
    <>
      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mobileMenuIn {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-desktop-links { display: flex !important; }
        .nav-desktop-right  { display: flex !important; }
        .nav-hamburger      { display: none !important; }
        .nav-mobile-menu    { display: none !important; }
        @media (max-width: 860px) {
          .nav-desktop-links { display: none !important; }
          .nav-desktop-right  { display: none !important; }
          .nav-hamburger      { display: flex !important; }
          .nav-mobile-menu    { display: flex !important; }
          .nav-logo-text { font-size: 17px !important; }
        }
        @media (max-width: 380px) {
          .nav-logo-text { font-size: 15px !important; }
        }
        .nav-mobile-menu {
          position: fixed;
          top: 70px; left: 0; right: 0; bottom: 0;
          z-index: 999;
          flex-direction: column;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          background: var(--nav-bg);
          border-top: 1px solid var(--nav-border);
          animation: mobileMenuIn 0.22s ease;
          padding: 8px 0 32px;
        }
        .mob-nav-link {
          display: flex; align-items: center; gap: 12px;
          padding: 15px 6%; font-size: 15px; font-weight: 500;
          color: var(--text-primary); text-decoration: none;
          border-bottom: 1px solid var(--border);
          transition: background 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .mob-nav-link:active, .mob-nav-link:hover { background: var(--bg-subtle); }
        .mob-nav-link:last-of-type { border-bottom: none; }
        .mob-section-label {
          padding: 18px 6% 8px; font-size: 10px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted);
        }
        .mob-mode-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 6%; border-bottom: 1px solid var(--border);
        }
        .mob-mode-label {
          font-size: 15px; font-weight: 500; color: var(--text-primary);
          display: flex; align-items: center; gap: 10px;
        }
        .mob-mode-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 50px;
          border: 1.5px solid var(--border); background: var(--bg-subtle);
          font-size: 13px; font-weight: 500; color: var(--text-secondary);
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .mob-mode-pill:active { background: var(--green-50); border-color: var(--green-400); color: var(--green-700); }
        .mob-auth-section { padding: 16px 6%; display: flex; flex-direction: column; gap: 10px; }
        .mob-auth-user-card {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px; background: var(--bg-subtle);
          border-radius: 12px; border: 1px solid var(--border); text-decoration: none;
        }
        .mob-auth-btn-row { display: flex; gap: 10px; }
        .mob-auth-btn-login {
          flex: 1; padding: 13px; text-align: center;
          border: 1.5px solid var(--border); border-radius: 10px;
          font-size: 14px; font-weight: 500; color: var(--text-primary);
          text-decoration: none; font-family: 'DM Sans', sans-serif; transition: background 0.15s;
        }
        .mob-auth-btn-register {
          flex: 1; padding: 13px; text-align: center;
          background: var(--green-600); border-radius: 10px;
          font-size: 14px; font-weight: 500; color: white;
          text-decoration: none; font-family: 'DM Sans', sans-serif; transition: background 0.15s;
        }
        .mob-auth-btn-register:active { background: var(--green-700); }
        .mob-signout-btn {
          width: 100%; padding: 13px 16px; background: #fef2f2;
          border: none; border-radius: 10px; text-align: left;
          font-size: 14px; color: #dc2626; font-weight: 500;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s;
        }
        .mob-signout-btn:active { background: #fee2e2; }
        .mob-nav-link-active { color: var(--green-600) !important; background: var(--green-50) !important; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={navStyle}>

        {/* LOGO */}
        <Link to="/" style={{
          display: "flex", alignItems: "center", gap: "10px",
          fontFamily: "'Playfair Display', serif", fontWeight: "700",
          color: logoColor, transition: "color 0.4s",
          textDecoration: "none", flexShrink: 0,
        }}>
          <div style={{
            width: "36px", height: "36px", flexShrink: 0,
            background: "linear-gradient(135deg, var(--green-500), var(--green-700))",
            borderRadius: "9px", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "18px",
          }}>🌿</div>
          <span className="nav-logo-text" style={{ fontSize: "22px" }}>
            GreenToursPlanner
          </span>
        </Link>

        {/* ── NAV LINKS (desktop) ── */}
        <ul className="nav-desktop-links" style={{
          gap: "32px", listStyle: "none", margin: 0, padding: 0, alignItems: "center",
        }}>
          {[
            { label: "Home",    path: "/" },
            { label: "Tours",   path: "/tours" },
            { label: "About",   path: "/about" },
            { label: "Contact", path: "/contact" },
          ].map((link) => (
            <li key={link.path}>
              <Link to={link.path} style={{
                color: linkColor, fontSize: "14px", fontWeight: "500",
                transition: "color 0.2s", textDecoration: "none",
                borderBottom: location.pathname === link.path
                  ? "2px solid var(--green-400)"
                  : "2px solid transparent",
                paddingBottom: "4px",
              }}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ── RIGHT SIDE (desktop) ── */}
        <div className="nav-desktop-right" style={{ gap: "10px", alignItems: "center" }}>

          {/* MODE DROPDOWN — unchanged */}
          <div ref={modeRef} style={{ position: "relative" }}>
            <button
              onClick={() => setModeOpen(prev => !prev)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: solidNav ? "var(--bg-subtle)" : "rgba(255,255,255,0.12)",
                border: solidNav ? "1.5px solid var(--border)" : "1.5px solid rgba(255,255,255,0.25)",
                borderRadius: "50px", padding: "7px 14px",
                cursor: "pointer", transition: "all 0.2s",
                fontSize: "13px", fontWeight: "500",
                color: solidNav ? "var(--text-secondary)" : "rgba(255,255,255,0.9)",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--green-400)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = solidNav ? "var(--border)" : "rgba(255,255,255,0.25)"}
            >
              {darkMode ? "🌙" : "☀️"}
              <span>Mode</span>
              <span style={{ fontSize: "9px", transition: "transform 0.2s", transform: modeOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
            </button>

            {modeOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "12px", boxShadow: "0 8px 24px var(--shadow-md)",
                minWidth: "150px", overflow: "hidden", zIndex: 300,
                animation: "fadeSlideDown 0.15s ease",
              }}>
                <button
                  onClick={() => { if (darkMode) toggleTheme(); setModeOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    width: "100%", padding: "12px 16px",
                    border: "none", textAlign: "left",
                    background: !darkMode ? "var(--green-50)" : "transparent",
                    color: !darkMode ? "var(--green-700)" : "var(--text-secondary)",
                    fontSize: "13px", fontWeight: !darkMode ? "600" : "400",
                    cursor: "pointer", transition: "background 0.15s",
                    borderBottom: "1px solid var(--border)",
                  }}
                  onMouseEnter={e => { if (darkMode) e.currentTarget.style.background = "var(--bg-subtle)"; }}
                  onMouseLeave={e => { if (darkMode) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ fontSize: "16px" }}>☀️</span>
                  <div>
                    <div>Light Mode</div>
                    <div style={{ fontSize: "11px", color: !darkMode ? "var(--green-600)" : "var(--text-muted)", marginTop: "1px" }}>Clean white theme</div>
                  </div>
                  {!darkMode && <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--green-600)", fontWeight: "700" }}>✓</span>}
                </button>
                <button
                  onClick={() => { if (!darkMode) toggleTheme(); setModeOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    width: "100%", padding: "12px 16px",
                    border: "none", textAlign: "left",
                    background: darkMode ? "var(--green-50)" : "transparent",
                    color: darkMode ? "var(--green-700)" : "var(--text-secondary)",
                    fontSize: "13px", fontWeight: darkMode ? "600" : "400",
                    cursor: "pointer", transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { if (!darkMode) e.currentTarget.style.background = "var(--bg-subtle)"; }}
                  onMouseLeave={e => { if (!darkMode) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ fontSize: "16px" }}>🌙</span>
                  <div>
                    <div>Dark Mode</div>
                    <div style={{ fontSize: "11px", color: darkMode ? "var(--green-600)" : "var(--text-muted)", marginTop: "1px" }}>Easy on the eyes</div>
                  </div>
                  {darkMode && <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--green-600)", fontWeight: "700" }}>✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* ── AUTH AREA — FIXED DROPDOWN ── */}
          {user ? (
            <div ref={dropdownRef} style={{ position: "relative" }}>
              {/* Main button — clicking name goes to /account */}
              <button
                onClick={() => navigate("/account")}
                style={{
                  display: "flex", alignItems: "center", gap: "9px",
                  background: solidNav ? "var(--bg-subtle)" : "rgba(255,255,255,0.15)",
                  border: solidNav ? "1.5px solid var(--border)" : "1.5px solid rgba(255,255,255,0.3)",
                  borderRadius: "50px", padding: "5px 14px 5px 5px",
                  cursor: "pointer", transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "var(--green-400)";
                  e.currentTarget.style.background = solidNav ? "var(--green-50)" : "rgba(255,255,255,0.25)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = solidNav ? "var(--border)" : "rgba(255,255,255,0.3)";
                  e.currentTarget.style.background = solidNav ? "var(--bg-subtle)" : "rgba(255,255,255,0.15)";
                }}
              >
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: "var(--green-600)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: "700", color: "white",
                  overflow: "hidden", flexShrink: 0,
                }}>
                  {avatarSrc
                    ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : avatarLetter}
                </div>
                <span style={{
                  fontSize: "13px", fontWeight: "500",
                  color: solidNav ? "var(--text-primary)" : "white",
                  maxWidth: "110px", overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {user.username || user.name || "My Account"}
                </span>
                {/* Arrow opens dropdown */}
                <span
                  onClick={(e) => { e.stopPropagation(); setDropdown(!dropdown); }}
                  style={{
                    fontSize: "10px",
                    color: solidNav ? "var(--text-muted)" : "rgba(255,255,255,0.7)",
                    padding: "2px 4px", borderRadius: "4px",
                    transition: "background 0.2s", cursor: "pointer",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.08)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  title="Quick links"
                >▼</span>
              </button>

              {/* ── CLEANED DROPDOWN — only working links ── */}
              {dropdown && (
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: "14px", boxShadow: "0 8px 32px var(--shadow-md)",
                  minWidth: "220px", overflow: "hidden", zIndex: 200,
                  animation: "fadeSlideDown 0.15s ease",
                }}>
                  {/* USER INFO HEADER */}
                  <div style={{
                    padding: "14px 18px",
                    borderBottom: "1px solid var(--border)",
                    background: "var(--bg-subtle)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: "var(--green-600)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "14px", fontWeight: "700", color: "white",
                        overflow: "hidden", flexShrink: 0,
                      }}>
                        {avatarSrc
                          ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : avatarLetter}
                      </div>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>
                          {user.username || user.name}
                        </p>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* MY ACCOUNT — goes to /account (all sections inside) */}
                  <button
                    onClick={() => { setDropdown(false); navigate("/account"); }}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      width: "100%", padding: "12px 18px",
                      border: "none", borderBottom: "1px solid var(--border)",
                      textAlign: "left", background: "transparent",
                      fontSize: "14px", color: "var(--text-secondary)",
                      cursor: "pointer", transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span>👤</span>
                    <div>
                      <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>My Account</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
                        Profile, bookings, wishlist & reviews
                      </div>
                    </div>
                  </button>

                  {/* QUICK SECTION LINKS — all go to /account and open correct tab */}
                  {[
                    { label: "📋 My Bookings", section: "bookings" },
                    { label: "❤️ Wishlist",    section: "wishlist" },
                    { label: "⭐ My Reviews",  section: "reviews"  },
                  ].map((item) => (
                    <button
                      key={item.section}
                      onClick={() => goToAccountSection(item.section)}
                      style={{
                        display: "block", width: "100%", padding: "11px 18px",
                        border: "none", borderBottom: "1px solid var(--border)",
                        textAlign: "left", background: "transparent",
                        fontSize: "14px", color: "var(--text-secondary)",
                        cursor: "pointer", transition: "background 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {item.label}
                    </button>
                  ))}

                  {/* ADMIN LINKS — only shown if admin */}
                  {user.role === "admin" && (
                    <>
                      <Link
                        to="/admin"
                        onClick={() => setDropdown(false)}
                        style={{
                          display: "block", padding: "11px 18px",
                          fontSize: "14px", color: "var(--text-secondary)",
                          borderBottom: "1px solid var(--border)",
                          transition: "background 0.15s", textDecoration: "none",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        📊 Admin Dashboard
                      </Link>
                    </>
                  )}

                  {/* SIGN OUT */}
                  <button
                    onClick={handleLogout}
                    style={{
                      display: "block", width: "100%", padding: "11px 18px",
                      textAlign: "left", fontSize: "14px", color: "#dc2626",
                      background: "none", border: "none",
                      cursor: "pointer", transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" style={{
                color: linkColor, fontSize: "14px", fontWeight: "500",
                transition: "color 0.2s", textDecoration: "none",
              }}>
                Login
              </Link>
              <Link to="/register" style={{
                background: "var(--green-600)", color: "white",
                padding: "9px 22px", borderRadius: "50px",
                fontSize: "14px", fontWeight: "500",
                boxShadow: "0 2px 10px rgba(22,163,74,0.3)",
                transition: "all 0.2s", textDecoration: "none",
              }}>
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* ── HAMBURGER (mobile only) ── */}
        <button
          className="nav-hamburger"
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          style={{
            background: solidNav ? "var(--bg-subtle)" : "rgba(255,255,255,0.12)",
            border: solidNav ? "1.5px solid var(--border)" : "1.5px solid rgba(255,255,255,0.25)",
            borderRadius: "9px", width: "42px", height: "42px",
            flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: "5px", cursor: "pointer", padding: 0,
            transition: "all 0.2s", flexShrink: 0,
          }}
        >
          {[0, 1, 2].map((i) => (
            <span key={i} style={{
              display: "block", width: "18px", height: "2px",
              background: solidNav ? "var(--text-primary)" : "white",
              borderRadius: "2px", transition: "all 0.25s ease",
              transformOrigin: "center",
              transform: mobileOpen
                ? i === 0 ? "rotate(45deg) translate(5px, 5px)"
                : i === 1 ? "scaleX(0)"
                : "rotate(-45deg) translate(5px, -5px)"
                : "none",
              opacity: mobileOpen && i === 1 ? 0 : 1,
            }} />
          ))}
        </button>
      </nav>

      {/* ── MOBILE MENU PANEL — FIXED LINKS ── */}
      {mobileOpen && (
        <div className="nav-mobile-menu">

          {/* NAV LINKS */}
          <div style={{ borderBottom: "1px solid var(--border)", marginBottom: "4px" }}>
            {[
              { label: "Home",    path: "/",        icon: "🏠" },
              { label: "Tours",   path: "/tours",   icon: "🗺️" },
              { label: "About",   path: "/about",   icon: "ℹ️" },
              { label: "Contact", path: "/contact", icon: "📞" },
            ].map((link) => (
              <Link
                key={link.path} to={link.path}
                className={`mob-nav-link${location.pathname === link.path ? " mob-nav-link-active" : ""}`}
              >
                <span style={{ fontSize: "18px", width: "24px", textAlign: "center" }}>{link.icon}</span>
                <span>{link.label}</span>
                {location.pathname === link.path && (
                  <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--green-600)", fontWeight: "700" }}>●</span>
                )}
              </Link>
            ))}
          </div>

          {/* MODE TOGGLE */}
          <div className="mob-mode-row">
            <span className="mob-mode-label">
              {darkMode ? "🌙" : "☀️"}
              <span style={{ fontSize: "15px", fontWeight: "500", color: "var(--text-primary)" }}>
                {darkMode ? "Dark Mode" : "Light Mode"}
              </span>
            </span>
            <button className="mob-mode-pill" onClick={toggleTheme}>
              Switch to {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>

          {/* AUTH */}
          <div className="mob-auth-section">
            {user ? (
              <>
                {/* User card → goes to /account */}
                <Link to="/account" className="mob-auth-user-card" onClick={() => setMobileOpen(false)}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: "var(--green-600)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "15px", fontWeight: "700", color: "white",
                    overflow: "hidden", flexShrink: 0,
                  }}>
                    {avatarSrc
                      ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : avatarLetter}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.username || user.name || "My Account"}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.email}
                    </p>
                  </div>
                  <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "13px", flexShrink: 0 }}>›</span>
                </Link>

                {/* Quick section links — all open correct tab in /account */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {[
                    { label: "👤 My Account",  section: null     },  // goes to /account directly
                    { label: "📋 My Bookings", section: "bookings" },
                    { label: "❤️ Wishlist",    section: "wishlist" },
                    { label: "⭐ My Reviews",  section: "reviews"  },
                    ...(user.role === "admin"
                      ? [{ label: "📊 Admin Dashboard", section: null, path: "/admin" }]
                      : []),
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setMobileOpen(false);
                        if (item.path) {
                          navigate(item.path);
                        } else if (item.section) {
                          navigate("/account", { state: { section: item.section } });
                        } else {
                          navigate("/account");
                        }
                      }}
                      style={{
                        display: "block", padding: "12px 14px", width: "100%",
                        background: "var(--bg-subtle)", borderRadius: "10px",
                        fontSize: "14px", color: "var(--text-secondary)",
                        textDecoration: "none", transition: "background 0.15s",
                        border: "1px solid var(--border)",
                        textAlign: "left", cursor: "pointer",
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <button className="mob-signout-btn" onClick={handleLogout}>
                  🚪 Sign Out
                </button>
              </>
            ) : (
              <div className="mob-auth-btn-row">
                <Link to="/login" className="mob-auth-btn-login" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="mob-auth-btn-register" onClick={() => setMobileOpen(false)}>
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}