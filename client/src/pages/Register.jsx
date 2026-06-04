import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";


export default function Register() {
  const navigate = useNavigate();


  const [form, setForm] = useState({
    username: "", email: "", password: "", confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.username || !form.email || !form.password || !form.confirmPassword) {
    setError("Please fill in all fields.");
    return;
  }
  if (form.password !== form.confirmPassword) {
    setError("Passwords do not match.");
    return;
  }
  if (form.password.length < 6) {
    setError("Password must be at least 6 characters.");
    return;
  }
  setLoading(true);
  try {
    const data = await authAPI.register({
      name: form.username,   // your backend expects "name" not "username"
      email: form.email,
      password: form.password,
    });
    if (data.user || data.message === "User registered successfully") {
      // Backend doesn't return token on register, so redirect to login
      navigate("/login?registered=true");
    } else {
      setError(data.message || "Registration failed. Try again.");
    }
  } catch {
    setError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const inputStyle = {
    width: "100%", padding: "12px 16px",
    border: "1.5px solid var(--gray-200)",
    borderRadius: "10px", fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none", color: "var(--gray-800)",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{
      minHeight: "100vh",
      paddingTop: "70px",
      background: "var(--off-white)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "100px 5% 60px",
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        width: "100%",
        maxWidth: "920px",
        background: "white",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 8px 48px rgba(0,0,0,0.10)",
        border: "1px solid var(--gray-100)",
      }}>

        {/* LEFT — FORM */}
        <div style={{ padding: "60px 48px" }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "26px", fontWeight: "700",
            color: "var(--gray-800)", marginBottom: "8px",
          }}>
            Create Account
          </h3>
          <p style={{
            color: "var(--gray-400)", fontSize: "14px",
            marginBottom: "32px",
          }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--green-600)", fontWeight: "600" }}>
              Sign in
            </Link>
          </p>

          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              color: "#dc2626", padding: "12px 16px",
              borderRadius: "10px", fontSize: "13px",
              marginBottom: "20px",
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* USERNAME */}
            <div style={{ marginBottom: "18px" }}>
              <label style={{
                display: "block", fontSize: "13px",
                fontWeight: "600", color: "var(--gray-600)", marginBottom: "8px",
              }}>
                Full Name
              </label>
              <input
                type="text" name="username"
                placeholder="John Doe"
                value={form.username} onChange={handleChange}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                onBlur={e => e.target.style.borderColor = "var(--gray-200)"}
              />
            </div>

            {/* EMAIL */}
            <div style={{ marginBottom: "18px" }}>
              <label style={{
                display: "block", fontSize: "13px",
                fontWeight: "600", color: "var(--gray-600)", marginBottom: "8px",
              }}>
                Email Address
              </label>
              <input
                type="email" name="email"
                placeholder="you@example.com"
                value={form.email} onChange={handleChange}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                onBlur={e => e.target.style.borderColor = "var(--gray-200)"}
              />
            </div>

            {/* PASSWORD */}
            <div style={{ marginBottom: "18px" }}>
              <label style={{
                display: "block", fontSize: "13px",
                fontWeight: "600", color: "var(--gray-600)", marginBottom: "8px",
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Min. 6 characters"
                  value={form.password} onChange={handleChange}
                  style={{ ...inputStyle, paddingRight: "44px" }}
                  onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                  onBlur={e => e.target.style.borderColor = "var(--gray-200)"}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", right: "14px", top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none",
                    fontSize: "16px", cursor: "pointer",
                    color: "var(--gray-400)",
                  }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div style={{ marginBottom: "28px" }}>
              <label style={{
                display: "block", fontSize: "13px",
                fontWeight: "600", color: "var(--gray-600)", marginBottom: "8px",
              }}>
                Confirm Password
              </label>
              <input
                type="password" name="confirmPassword"
                placeholder="Repeat your password"
                value={form.confirmPassword} onChange={handleChange}
                style={inputStyle}
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
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { if (!loading) e.target.style.background = "var(--green-700)"; }}
              onMouseLeave={e => { if (!loading) e.target.style.background = "var(--green-600)"; }}
            >
              {loading ? "Creating account..." : "Create Account 🌿"}
            </button>
          </form>
        </div>

        {/* RIGHT — GREEN PANEL */}
        <div style={{
          background: "linear-gradient(160deg, var(--green-700) 0%, var(--green-900) 100%)",
          padding: "60px 48px",
          display: "flex", flexDirection: "column",
          justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: "-60px", left: "-60px",
            width: "200px", height: "200px", borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }} />
          <div style={{
            position: "absolute", bottom: "-40px", right: "-40px",
            width: "160px", height: "160px", borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }} />

          <div style={{ fontSize: "42px", marginBottom: "20px" }}>🗺️</div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "32px", fontWeight: "700",
            color: "white", lineHeight: "1.2", marginBottom: "16px",
          }}>
            Start Your Adventure Today
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "15px", lineHeight: "1.8", marginBottom: "32px",
          }}>
            Join thousands of travellers who trust GreenTours for unforgettable eco-friendly experiences.
          </p>

          {[
            "100% money-back guarantee",
            "24/7 travel support",
            "Eco-certified tour guides",
            "Exclusive member discounts",
          ].map((item) => (
            <div key={item} style={{
              display: "flex", alignItems: "center",
              gap: "10px", marginBottom: "12px",
            }}>
              <div style={{
                width: "22px", height: "22px", borderRadius: "50%",
                background: "rgba(74,222,128,0.25)",
                border: "1px solid rgba(74,222,128,0.4)",
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "12px", flexShrink: 0,
              }}>✓</div>
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px" }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}