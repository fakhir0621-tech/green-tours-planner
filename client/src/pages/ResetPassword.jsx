import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const BASE_URL = "http://localhost:5000/api";

export default function ResetPassword() {
  const { token }     = useParams();
  const navigate      = useNavigate();
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [validating, setValidating]   = useState(true);
  const [tokenValid, setTokenValid]   = useState(false);
  const [success, setSuccess]         = useState("");
  const [error, setError]             = useState("");

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        const res  = await fetch(`${BASE_URL}/users/reset-password/${token}`);
        const data = await res.json();
        if (res.ok && data.valid) {
          setTokenValid(true);
        } else {
          setError(data.message || "This reset link is invalid or has expired.");
        }
      } catch {
        setError("Failed to validate reset link. Please try again.");
      } finally {
        setValidating(false);
      }
    };
    if (token) validateToken();
    else { setError("No reset token found."); setValidating(false); }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${BASE_URL}/users/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password.");
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getStrength = (p) => {
    if (!p) return { label: "", color: "transparent", width: "0%" };
    if (p.length < 6) return { label: "Too short", color: "#dc2626", width: "20%" };
    if (p.length < 8) return { label: "Weak", color: "#f59e0b", width: "40%" };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p) && p.length >= 8)
      return { label: "Strong", color: "#16a34a", width: "100%" };
    return { label: "Medium", color: "#ca8a04", width: "65%" };
  };
  const strength = getStrength(password);

  const inputStyle = {
    width: "100%", padding: "13px 16px",
    border: "1.5px solid var(--border)",
    borderRadius: "12px", fontSize: "15px",
    fontFamily: "'DM Sans', sans-serif",
    color: "var(--text-primary)", background: "var(--bg-card)",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
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
        borderRadius: "20px", padding: "40px 36px",
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
          }}>🔒</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "26px", fontWeight: "700",
            color: "var(--text-primary)", marginBottom: "8px",
          }}>Reset Password</h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Enter your new password below.
          </p>
        </div>

        {/* VALIDATING STATE */}
        {validating && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{
              width: "36px", height: "36px",
              border: "3px solid var(--green-100)",
              borderTop: "3px solid var(--green-500)",
              borderRadius: "50%", margin: "0 auto 12px",
              animation: "spin 0.8s linear infinite",
            }} />
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Validating reset link...
            </p>
          </div>
        )}

        {/* INVALID TOKEN */}
        {!validating && !tokenValid && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>⛔</div>
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              color: "#dc2626", padding: "16px",
              borderRadius: "12px", fontSize: "14px",
              lineHeight: "1.6", marginBottom: "20px",
            }}>
              {error}
            </div>
            <Link to="/forgot-password" style={{
              background: "var(--green-600)", color: "white",
              padding: "11px 28px", borderRadius: "50px",
              fontSize: "13px", fontWeight: "600",
              display: "inline-block", textDecoration: "none",
            }}>
              Request New Link
            </Link>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div style={{
            background: "#dcfce7", border: "1px solid #86efac",
            color: "#16a34a", padding: "20px",
            borderRadius: "12px", fontSize: "14px",
            lineHeight: "1.6", textAlign: "center",
          }}>
            ✅ {success}
            <div style={{ marginTop: "8px" }}>
              <div style={{
                width: "32px", height: "32px",
                border: "3px solid #86efac",
                borderTop: "3px solid #16a34a",
                borderRadius: "50%", margin: "8px auto",
                animation: "spin 0.8s linear infinite",
              }} />
            </div>
          </div>
        )}

        {/* RESET FORM */}
        {!validating && tokenValid && !success && (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca",
                color: "#dc2626", padding: "12px 16px",
                borderRadius: "10px", fontSize: "13px", marginBottom: "20px",
              }}>⚠️ {error}</div>
            )}

            {/* NEW PASSWORD */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block", fontSize: "13px", fontWeight: "600",
                color: "var(--text-secondary)", marginBottom: "8px",
                textTransform: "uppercase", letterSpacing: "0.5px",
              }}>
                New Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="Minimum 6 characters"
                  style={{ ...inputStyle, paddingRight: "50px" }}
                  onFocus={e => e.target.style.borderColor = "#16a34a"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{
                    position: "absolute", right: "14px", top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none",
                    fontSize: "18px", cursor: "pointer", color: "var(--text-muted)",
                  }}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {/* STRENGTH BAR */}
              {password && (
                <div style={{ marginTop: "8px" }}>
                  <div style={{
                    height: "4px", background: "var(--border)",
                    borderRadius: "4px", overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%", width: strength.width,
                      background: strength.color,
                      borderRadius: "4px", transition: "all 0.3s",
                    }} />
                  </div>
                  <p style={{
                    fontSize: "11px", color: strength.color,
                    marginTop: "4px", fontWeight: "600",
                  }}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block", fontSize: "13px", fontWeight: "600",
                color: "var(--text-secondary)", marginBottom: "8px",
                textTransform: "uppercase", letterSpacing: "0.5px",
              }}>
                Confirm Password
              </label>
              <input
                type={showPass ? "text" : "password"}
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(""); }}
                placeholder="Re-enter your password"
                style={{
                  ...inputStyle,
                  borderColor: confirm && confirm !== password ? "#dc2626" : "var(--border)",
                }}
                onFocus={e => e.target.style.borderColor = "#16a34a"}
                onBlur={e => e.target.style.borderColor =
                  confirm && confirm !== password ? "#dc2626" : "var(--border)"}
              />
              {confirm && confirm !== password && (
                <p style={{ fontSize: "12px", color: "#dc2626", marginTop: "5px" }}>
                  ⚠️ Passwords do not match
                </p>
              )}
              {confirm && confirm === password && (
                <p style={{ fontSize: "12px", color: "#16a34a", marginTop: "5px" }}>
                  ✅ Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || password !== confirm || password.length < 6}
              style={{
                width: "100%", padding: "14px",
                background: loading || password !== confirm || password.length < 6
                  ? "var(--green-400)" : "var(--green-600)",
                color: "white", border: "none",
                borderRadius: "12px", fontSize: "15px",
                fontWeight: "600",
                cursor: loading || password !== confirm || password.length < 6
                  ? "not-allowed" : "pointer",
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
                  Resetting...
                </>
              ) : "🔒 Reset Password"}
            </button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link to="/login" style={{
            fontSize: "14px", color: "var(--text-muted)", textDecoration: "none",
          }}>
            ← Back to Login
          </Link>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}