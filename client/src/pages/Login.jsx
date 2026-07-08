import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const registered = new URLSearchParams(window.location.search).get("registered");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.email || !form.password) {
    setError("Please fill in all fields.");
    return;
  }
  setLoading(true);
  try {
    const data = await authAPI.login(form);
    // Your backend returns token at top level: { token, _id, name, email, role }
    if (data.token) {
const user = {
  _id: data._id,
  name: data.name,
  email: data.email,
  phone: data.phone,
  address: data.address,
  photo: data.photo,
  role: data.role,
};

      login(user, data.token);
      navigate("/");
    } else {
      setError(data.message || "Invalid email or password.");
    }
  } catch {
    setError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
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

        {/* LEFT — GREEN PANEL */}
        <div style={{
          background: "linear-gradient(160deg, var(--green-700) 0%, var(--green-900) 100%)",
          padding: "60px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* DECORATIVE CIRCLES */}
          <div style={{
            position: "absolute", top: "-60px", right: "-60px",
            width: "200px", height: "200px", borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }} />
          <div style={{
            position: "absolute", bottom: "-40px", left: "-40px",
            width: "160px", height: "160px", borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }} />

          <div style={{ fontSize: "42px", marginBottom: "20px" }}>🌿</div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "32px", fontWeight: "700",
            color: "white", lineHeight: "1.2",
            marginBottom: "16px",
          }}>
            Welcome Back, Explorer
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "15px", lineHeight: "1.8",
            marginBottom: "32px",
          }}>
            Sign in to manage your bookings, explore new destinations, and continue your journey with us.
          </p>

          {[
            "Access your bookings anytime",
            "Save your favourite tours",
            "Exclusive member deals",
          ].map((item) => (
            <div key={item} style={{
              display: "flex", alignItems: "center", gap: "10px",
              marginBottom: "12px",
            }}>
              <div style={{
                width: "22px", height: "22px", borderRadius: "50%",
                background: "rgba(74,222,128,0.25)",
                border: "1px solid rgba(74,222,128,0.4)",
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "12px",
                flexShrink: 0,
              }}>✓</div>
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px" }}>
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* RIGHT — FORM */}
        <div style={{ padding: "60px 48px" }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "26px", fontWeight: "700",
            color: "var(--gray-800)", marginBottom: "8px",
          }}>
            Sign In
          </h3>
          <p style={{
            color: "var(--gray-400)", fontSize: "14px",
            marginBottom: "32px",
          }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--green-600)", fontWeight: "600" }}>
              Create one
            </Link>
          </p>
            
            {registered && (
  <div style={{
    background: "#dcfce7", border: "1px solid #86efac",
    color: "#16a34a", padding: "12px 16px",
    borderRadius: "10px", fontSize: "13px",
    marginBottom: "20px",
  }}>
    ✅ Account created! Please sign in.
  </div>
)}

          {/* ERROR */}
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
            {/* EMAIL */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block", fontSize: "13px",
                fontWeight: "600", color: "var(--gray-600)",
                marginBottom: "8px",
              }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                style={{
                  width: "100%", padding: "12px 16px",
                  border: "1.5px solid var(--gray-200)",
                  borderRadius: "10px", fontSize: "14px",
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none", color: "var(--gray-800)",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                onBlur={e => e.target.style.borderColor = "var(--gray-200)"}
              />
            </div>

            {/* PASSWORD */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block", fontSize: "13px",
                fontWeight: "600", color: "var(--gray-600)",
                marginBottom: "8px",
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  style={{
                    width: "100%", padding: "12px 44px 12px 16px",
                    border: "1.5px solid var(--gray-200)",
                    borderRadius: "10px", fontSize: "14px",
                    fontFamily: "'DM Sans', sans-serif",
                    outline: "none", color: "var(--gray-800)",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                  onBlur={e => e.target.style.borderColor = "var(--gray-200)"}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", right: "14px", top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none",
                    fontSize: "16px", cursor: "pointer",
                    color: "var(--gray-400)",
                  }}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              <div style={{ textAlign: "right", marginTop: "8px" }}>
                <Link to="/forgot-password" style={{
                  fontSize: "12px", color: "var(--green-600)", fontWeight: "500",
                }}>
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
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
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}