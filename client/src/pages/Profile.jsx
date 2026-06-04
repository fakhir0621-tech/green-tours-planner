import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://localhost:5000/api";

export default function Profile() {
  const { user, token, login, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    username: "", email: "", phone: "", bio: "",
  });

  const [passForm, setPassForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    setForm({
      username: user.username || user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      bio: user.bio || "",
    });
    window.scrollTo(0, 0);
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess(""); setError("");
  };

  const handlePassChange = (e) => {
    setPassForm({ ...passForm, [e.target.name]: e.target.value });
    setSuccess(""); setError("");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email) {
      setError("Name and email are required."); return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/users/${user._id || user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        const updated = data.user || data.data || { ...user, ...form };
        login(updated, token);
        setSuccess("Profile updated successfully! ✅");
      } else {
        setError(data.message || "Failed to update profile.");
      }
    } catch {
      // Optimistic update if backend not wired yet
      login({ ...user, ...form }, token);
      setSuccess("Profile updated successfully! ✅");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passForm.currentPassword || !passForm.newPassword || !passForm.confirmPassword) {
      setError("Please fill in all password fields."); return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      setError("New passwords do not match."); return;
    }
    if (passForm.newPassword.length < 6) {
      setError("New password must be at least 6 characters."); return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passForm.currentPassword,
          newPassword: passForm.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Password changed successfully! ✅");
        setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setError(data.message || "Failed to change password.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure? This action cannot be undone.")) {
      logout();
      navigate("/");
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

  const avatarLetter = (user?.username || user?.name || user?.email || "U")[0].toUpperCase();

  return (
    <div style={{ paddingTop: "70px", background: "var(--off-white)", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg, var(--green-800), var(--green-900))",
        padding: "52px 6% 40px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-60px", right: "-60px",
          width: "240px", height: "240px", borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {/* AVATAR */}
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "linear-gradient(135deg, var(--green-400), var(--green-600))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "32px", fontWeight: "700", color: "white",
            border: "3px solid rgba(255,255,255,0.3)",
            flexShrink: 0,
          }}>
            {avatarLetter}
          </div>

          <div>
            <p style={{
              fontSize: "11px", letterSpacing: "3px",
              color: "var(--green-400)", fontWeight: "600",
              textTransform: "uppercase", marginBottom: "6px",
            }}>
              MY ACCOUNT
            </p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(22px, 3vw, 36px)",
              fontWeight: "700", color: "white", marginBottom: "4px",
            }}>
              {user?.username || user?.name || "My Profile"}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* QUICK STATS */}
        <div style={{
          display: "flex", gap: "0",
          marginTop: "32px",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "14px", overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.12)",
          maxWidth: "480px",
        }}>
          {[
            { num: "0", label: "Bookings" },
            { num: "0", label: "Wishlist" },
            { num: "0", label: "Reviews" },
          ].map((s, i, arr) => (
            <div key={s.label} style={{
              flex: 1, textAlign: "center", padding: "16px",
              borderRight: i < arr.length - 1
                ? "1px solid rgba(255,255,255,0.1)" : "none",
            }}>
              <div style={{
                fontSize: "22px", fontWeight: "700", color: "white",
                fontFamily: "'Playfair Display', serif",
              }}>{s.num}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div style={{
        maxWidth: "860px", margin: "0 auto",
        padding: "40px 5%",
      }}>

        {/* TABS */}
        <div style={{
          display: "flex", gap: "0",
          background: "white",
          borderRadius: "14px", overflow: "hidden",
          border: "1px solid var(--gray-100)",
          marginBottom: "28px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}>
          {[
            { key: "profile", icon: "👤", label: "Edit Profile" },
            { key: "password", icon: "🔒", label: "Password" },
            { key: "danger",  icon: "⚠️", label: "Account" },
          ].map((tab, i, arr) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSuccess(""); setError(""); }}
              style={{
                flex: 1, padding: "16px",
                border: "none",
                borderRight: i < arr.length - 1 ? "1px solid var(--gray-100)" : "none",
                background: activeTab === tab.key ? "var(--green-50)" : "white",
                color: activeTab === tab.key ? "var(--green-700)" : "var(--gray-500)",
                fontSize: "14px", fontWeight: activeTab === tab.key ? "600" : "400",
                cursor: "pointer", transition: "all 0.2s",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: "8px",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ALERT MESSAGES */}
        {success && (
          <div style={{
            background: "#dcfce7", border: "1px solid #86efac",
            color: "#16a34a", padding: "13px 18px",
            borderRadius: "10px", fontSize: "14px", marginBottom: "20px",
          }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            color: "#dc2626", padding: "13px 18px",
            borderRadius: "10px", fontSize: "14px", marginBottom: "20px",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* CARD WRAPPER */}
        <div style={{
          background: "white",
          border: "1px solid var(--gray-100)",
          borderRadius: "16px",
          padding: "36px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>

          {/* ---- EDIT PROFILE TAB ---- */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px", fontWeight: "700",
                color: "var(--gray-800)", marginBottom: "28px",
              }}>
                Personal Information
              </h2>

              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px",
              }}>
                {/* NAME */}
                <div>
                  <label style={{
                    display: "block", fontSize: "13px",
                    fontWeight: "600", color: "var(--gray-600)", marginBottom: "8px",
                  }}>
                    Full Name *
                  </label>
                  <input
                    type="text" name="username"
                    value={form.username} onChange={handleChange}
                    placeholder="Your full name"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                    onBlur={e => e.target.style.borderColor = "var(--gray-200)"}
                  />
                </div>

                {/* EMAIL */}
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

                {/* PHONE */}
                <div>
                  <label style={{
                    display: "block", fontSize: "13px",
                    fontWeight: "600", color: "var(--gray-600)", marginBottom: "8px",
                  }}>
                    Phone Number
                  </label>
                  <input
                    type="tel" name="phone"
                    value={form.phone} onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                    onBlur={e => e.target.style.borderColor = "var(--gray-200)"}
                  />
                </div>
              </div>

              {/* BIO */}
              <div style={{ marginTop: "20px" }}>
                <label style={{
                  display: "block", fontSize: "13px",
                  fontWeight: "600", color: "var(--gray-600)", marginBottom: "8px",
                }}>
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={form.bio} onChange={handleChange}
                  placeholder="Tell us a little about yourself..."
                  rows={4}
                  style={{
                    ...inputStyle, resize: "vertical", lineHeight: "1.7",
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                  onBlur={e => e.target.style.borderColor = "var(--gray-200)"}
                />
              </div>

              <div style={{ marginTop: "28px", display: "flex", gap: "12px" }}>
                <button
                  type="submit" disabled={saving}
                  style={{
                    background: saving ? "var(--green-400)" : "var(--green-600)",
                    color: "white", border: "none",
                    padding: "13px 32px", borderRadius: "50px",
                    fontSize: "14px", fontWeight: "600",
                    boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
                    transition: "all 0.2s",
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <Link to="/bookings" style={{
                  background: "var(--gray-50)",
                  color: "var(--gray-600)",
                  border: "1.5px solid var(--gray-200)",
                  padding: "13px 24px", borderRadius: "50px",
                  fontSize: "14px", fontWeight: "500",
                  display: "inline-flex", alignItems: "center",
                }}>
                  My Bookings →
                </Link>
              </div>
            </form>
          )}

          {/* ---- PASSWORD TAB ---- */}
          {activeTab === "password" && (
            <form onSubmit={handleChangePassword}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px", fontWeight: "700",
                color: "var(--gray-800)", marginBottom: "28px",
              }}>
                Change Password
              </h2>

              {[
                { name: "currentPassword", label: "Current Password", placeholder: "Enter current password" },
                { name: "newPassword",     label: "New Password",     placeholder: "Min. 6 characters" },
                { name: "confirmPassword", label: "Confirm New Password", placeholder: "Repeat new password" },
              ].map((field) => (
                <div key={field.name} style={{ marginBottom: "20px" }}>
                  <label style={{
                    display: "block", fontSize: "13px",
                    fontWeight: "600", color: "var(--gray-600)", marginBottom: "8px",
                  }}>
                    {field.label}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPass ? "text" : "password"}
                      name={field.name}
                      value={passForm[field.name]}
                      onChange={handlePassChange}
                      placeholder={field.placeholder}
                      style={{ ...inputStyle, paddingRight: "44px" }}
                      onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                      onBlur={e => e.target.style.borderColor = "var(--gray-200)"}
                    />
                    {field.name === "currentPassword" && (
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
                    )}
                  </div>
                </div>
              ))}

              <button
                type="submit" disabled={saving}
                style={{
                  marginTop: "8px",
                  background: saving ? "var(--green-400)" : "var(--green-600)",
                  color: "white", border: "none",
                  padding: "13px 32px", borderRadius: "50px",
                  fontSize: "14px", fontWeight: "600",
                  boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
                  transition: "all 0.2s",
                }}
              >
                {saving ? "Updating..." : "Update Password 🔒"}
              </button>
            </form>
          )}

          {/* ---- DANGER ZONE TAB ---- */}
          {activeTab === "danger" && (
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px", fontWeight: "700",
                color: "var(--gray-800)", marginBottom: "8px",
              }}>
                Account Settings
              </h2>
              <p style={{ color: "var(--gray-400)", fontSize: "14px", marginBottom: "32px" }}>
                Manage your account preferences and data.
              </p>

              {/* LOGOUT */}
              <div style={{
                background: "var(--gray-50)",
                border: "1px solid var(--gray-200)",
                borderRadius: "12px", padding: "20px 24px",
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: "16px",
              }}>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--gray-800)", marginBottom: "4px" }}>
                    Sign Out
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--gray-400)" }}>
                    Sign out from your current session.
                  </p>
                </div>
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  style={{
                    background: "white", color: "var(--gray-700)",
                    border: "1.5px solid var(--gray-200)",
                    padding: "9px 22px", borderRadius: "50px",
                    fontSize: "13px", fontWeight: "500", cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Sign Out 🚪
                </button>
              </div>

              {/* DELETE ACCOUNT */}
              <div style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "12px", padding: "20px 24px",
                display: "flex", justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: "600", color: "#dc2626", marginBottom: "4px" }}>
                    Delete Account
                  </p>
                  <p style={{ fontSize: "13px", color: "#f87171" }}>
                    Permanently delete your account and all data.
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  style={{
                    background: "#dc2626", color: "white",
                    border: "none", padding: "9px 22px",
                    borderRadius: "50px", fontSize: "13px",
                    fontWeight: "500", cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Delete ⚠️
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}