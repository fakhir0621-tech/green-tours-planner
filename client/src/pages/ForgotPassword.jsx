import { useState } from "react";
import { Link } from "react-router-dom";

const BASE_URL = "http://localhost:5000/api";

export default function ForgotPassword() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const res  = await fetch(`${BASE_URL}/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong.");
      setSuccess("Password reset link sent! Check your inbox (and spam folder).");
      setEmail("");
    } catch (err) {
      setError(err.message || "Failed to send reset email. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center",
      justifyContent: "center", padding: "20px",
      paddingTop: "90px",
    }}>
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "20px",
        padding: "40px 36px",
        width: "100%", maxWidth: "440px",
        boxShadow: "0 8px 32px var(--shadow-md)",
      }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "56px", height: "56px",
            background: "linear-gradient(135deg, var(--green-500), var(--green-700))",
            borderRadius: "14px",
            display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "26px",
            margin: "0 auto 16px",
          }}>🔑</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "26px", fontWeight: "700",
            color: "var(--text-primary)", marginBottom: "8px",
          }}>Forgot Password?</h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.7" }}>
            Enter your registered email and we'll send you a secure reset link.
          </p>
        </div>

        {/* SUCCESS STATE */}
        {success && (
          <div style={{
            background: "#dcfce7", border: "1px solid #86efac",
            color: "#16a34a", padding: "16px",
            borderRadius: "12px", fontSize: "14px",
            lineHeight: "1.6", marginBottom: "20px",
            textAlign: "center",
          }}>
            ✅ {success}
            <div style={{ marginTop: "12px" }}>
              <Link to="/login" style={{
                color: "#16a34a", fontWeight: "600",
                textDecoration: "underline", fontSize: "13px",
              }}>
                Back to Login →
              </Link>
            </div>
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

        {/* FORM */}
        {!success && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block", fontSize: "13px",
                fontWeight: "600", color: "var(--text-secondary)",
                marginBottom: "8px", textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="you@example.com"
                style={{
                  width: "100%", padding: "13px 16px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "12px", fontSize: "15px",
                  fontFamily: "'DM Sans', sans-serif",
                  color: "var(--text-primary)",
                  background: "var(--bg-card)",
                  outline: "none", boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "#16a34a"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "14px",
                background: loading ? "var(--green-400)" : "var(--green-600)",
                color: "white", border: "none",
                borderRadius: "12px", fontSize: "15px",
                fontWeight: "600", cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(22,163,74,0.35)",
                transition: "all 0.2s",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: "8px",
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: "16px", height: "16px",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTop: "2px solid white", borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  Sending...
                </>
              ) : "📧 Send Reset Link"}
            </button>
          </form>
        )}

        {/* BACK TO LOGIN */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link to="/login" style={{
            fontSize: "14px", color: "var(--text-muted)",
            textDecoration: "none", transition: "color 0.2s",
          }}>
            ← Back to Login
          </Link>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}