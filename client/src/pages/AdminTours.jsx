import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://localhost:5000/api";

const EMPTY_FORM = {
  tourName: "",
  location: "",
  price: "",
  duration: "",
  description: "",
  category: "Adventure",
  images: [""],
  availableSeats: 10,
  virtualTourLink: "",
  itinerary: [{ day: 1, description: "" }],
};

const CATEGORIES = ["Adventure", "Nature", "Culture", "Beach", "City", "Historical"];

export default function AdminTours() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [tours, setTours]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [success, setSuccess]     = useState("");
  const [error, setError]         = useState("");
  const [form, setForm]           = useState(EMPTY_FORM);
  const [search, setSearch]       = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "admin") { navigate("/"); return; }
    fetchTours();
    window.scrollTo(0, 0);
  }, [user, navigate]);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/tours`);
      const data = await res.json();
      setTours(Array.isArray(data) ? data : data.tours || []);
    } catch {
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tourName || !form.location || !form.price) {
      setError("Tour name, location and price are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        availableSeats: Number(form.availableSeats),
        images: form.images.filter(img => img.trim() !== ""),
        itinerary: form.itinerary.filter(item => item.description.trim() !== ""),
      };

      const url    = editingId
        ? `${BASE_URL}/tours/${editingId}`
        : `${BASE_URL}/tours/add`;
      const method = editingId ? "PUT" : "POST";

      const res  = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(editingId ? "Tour updated! ✅" : "Tour added! ✅");
        setTimeout(() => setSuccess(""), 3000);
        resetForm();
        fetchTours();
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch {
      setError("Failed to save tour. Check your connection.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (tour) => {
    setForm({
      tourName:       tour.tourName || "",
      location:       tour.location || "",
      price:          tour.price || "",
      duration:       tour.duration || "",
      description:    tour.description || "",
      category:       tour.category || "Adventure",
      images:         tour.images?.length > 0 ? tour.images : [""],
      availableSeats: tour.availableSeats || 10,
      virtualTourLink: tour.virtualTourLink || "",
      itinerary:      tour.itinerary?.length > 0
        ? tour.itinerary
        : [{ day: 1, description: "" }],
    });
    setEditingId(tour._id);
    setShowForm(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this tour permanently?")) return;
    setDeletingId(id);
    try {
      await fetch(`${BASE_URL}/tours/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setTours(prev => prev.filter(t => t._id !== id));
      setSuccess("Tour deleted! ✅");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to delete tour.");
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  // ---- ITINERARY HELPERS ----
  const addDay = () => {
    setForm(prev => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        { day: prev.itinerary.length + 1, description: "" },
      ],
    }));
  };

  const removeDay = (index) => {
    setForm(prev => ({
      ...prev,
      itinerary: prev.itinerary
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, day: i + 1 })),
    }));
  };

  const updateDay = (index, value) => {
    setForm(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((item, i) =>
        i === index ? { ...item, description: value } : item
      ),
    }));
  };

  // ---- IMAGE HELPERS ----
  const addImage = () => {
    setForm(prev => ({ ...prev, images: [...prev.images, ""] }));
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const updateImage = (index, value) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img),
    }));
  };

  const filtered = tours.filter(t =>
    (t.tourName || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.location || "").toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid var(--border)",
    borderRadius: "10px", fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    background: "var(--bg-card)",
    color: "var(--text-primary)",
    outline: "none", transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block", fontSize: "13px",
    fontWeight: "600", color: "var(--text-secondary)",
    marginBottom: "7px",
  };

  return (
    <div style={{
      paddingTop: "70px",
      background: "var(--bg)",
      minHeight: "100vh",
    }}>

      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg, var(--green-800), var(--green-900))",
        padding: "48px 6% 36px",
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
          ADMIN PANEL
        </p>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", flexWrap: "wrap", gap: "16px",
        }}>
          <div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(24px, 3vw, 38px)",
              fontWeight: "700", color: "white", marginBottom: "6px",
            }}>
              🗺️ Manage Tours
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
              {tours.length} tours in database
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => navigate("/admin")}
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.25)",
                padding: "10px 20px", borderRadius: "50px",
                fontSize: "13px", fontWeight: "500",
                cursor: "pointer",
              }}
            >
              ← Dashboard
            </button>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              style={{
                background: "var(--green-500)", color: "white",
                border: "none", padding: "10px 24px",
                borderRadius: "50px", fontSize: "13px",
                fontWeight: "600", cursor: "pointer",
                boxShadow: "0 4px 14px rgba(34,197,94,0.4)",
              }}
            >
              + Add New Tour
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "36px 6%" }}>

        {/* SUCCESS / ERROR */}
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

        {/* ---- ADD / EDIT FORM ---- */}
        {showForm && (
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px", padding: "36px",
            marginBottom: "36px",
            boxShadow: "0 4px 24px var(--shadow)",
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: "28px",
            }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "22px", fontWeight: "700",
                color: "var(--text-primary)",
              }}>
                {editingId ? "✏️ Edit Tour" : "➕ Add New Tour"}
              </h2>
              <button onClick={resetForm} style={{
                background: "none", border: "none",
                fontSize: "20px", cursor: "pointer",
                color: "var(--text-muted)",
              }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>

              {/* ROW 1 — NAME + LOCATION */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px", marginBottom: "20px",
              }}>
                <div>
                  <label style={labelStyle}>Tour Name *</label>
                  <input
                    type="text"
                    value={form.tourName}
                    onChange={e => setForm({ ...form, tourName: e.target.value })}
                    placeholder="e.g. Hunza Valley Explorer"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Location *</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Hunza, Gilgit-Baltistan"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                </div>
              </div>

              {/* ROW 2 — PRICE + DURATION + SEATS + CATEGORY */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: "20px", marginBottom: "20px",
              }}>
                <div>
                  <label style={labelStyle}>Price (USD) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="e.g. 450"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Duration</label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={e => setForm({ ...form, duration: e.target.value })}
                    placeholder="e.g. 7 Days"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Available Seats</label>
                  <input
                    type="number"
                    value={form.availableSeats}
                    onChange={e => setForm({ ...form, availableSeats: e.target.value })}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    style={{
                      ...inputStyle,
                      cursor: "pointer",
                    }}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe this tour in detail..."
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: "vertical", lineHeight: "1.7",
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                />
              </div>

              {/* VIRTUAL TOUR LINK */}
              <div style={{ marginBottom: "28px" }}>
                <label style={labelStyle}>Virtual Tour Link (optional)</label>
                <input
                  type="url"
                  value={form.virtualTourLink}
                  onChange={e => setForm({ ...form, virtualTourLink: e.target.value })}
                  placeholder="https://..."
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                />
              </div>

              {/* IMAGES */}
              <div style={{ marginBottom: "28px" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: "12px",
                }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>
                    Tour Images (URLs)
                  </label>
                  <button
                    type="button" onClick={addImage}
                    style={{
                      background: "var(--green-50)",
                      color: "var(--green-700)",
                      border: "1.5px solid var(--green-200)",
                      padding: "5px 14px", borderRadius: "50px",
                      fontSize: "12px", fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    + Add Image
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {form.images.map((img, i) => (
                    <div key={i} style={{ display: "flex", gap: "10px" }}>
                      <input
                        type="url"
                        value={img}
                        onChange={e => updateImage(i, e.target.value)}
                        placeholder={`Image ${i + 1} URL — https://...`}
                        style={{ ...inputStyle, flex: 1 }}
                        onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                        onBlur={e => e.target.style.borderColor = "var(--border)"}
                      />
                      {/* PREVIEW */}
                      {img && (
                        <img
                          src={img} alt=""
                          style={{
                            width: "46px", height: "46px",
                            borderRadius: "8px", objectFit: "cover",
                            border: "1px solid var(--border)", flexShrink: 0,
                          }}
                          onError={e => e.target.style.display = "none"}
                        />
                      )}
                      {form.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          style={{
                            background: "#fef2f2", color: "#dc2626",
                            border: "1px solid #fecaca",
                            width: "46px", height: "46px",
                            borderRadius: "8px", fontSize: "16px",
                            cursor: "pointer", flexShrink: 0,
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ITINERARY */}
              <div style={{ marginBottom: "32px" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: "16px",
                }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>
                    Itinerary (Day by Day Plan)
                  </label>
                  <button
                    type="button" onClick={addDay}
                    style={{
                      background: "var(--green-50)",
                      color: "var(--green-700)",
                      border: "1.5px solid var(--green-200)",
                      padding: "5px 14px", borderRadius: "50px",
                      fontSize: "12px", fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    + Add Day
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {form.itinerary.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", gap: "12px", alignItems: "flex-start",
                    }}>
                      {/* DAY CIRCLE */}
                      <div style={{
                        width: "40px", height: "40px",
                        borderRadius: "50%",
                        background: "var(--green-600)",
                        color: "white",
                        display: "flex", alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px", fontWeight: "700",
                        flexShrink: 0, marginTop: "2px",
                      }}>
                        {item.day}
                      </div>

                      <textarea
                        value={item.description}
                        onChange={e => updateDay(i, e.target.value)}
                        placeholder={`Day ${item.day} — What happens on this day?`}
                        rows={2}
                        style={{
                          ...inputStyle,
                          flex: 1, resize: "vertical", lineHeight: "1.6",
                        }}
                        onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                        onBlur={e => e.target.style.borderColor = "var(--border)"}
                      />

                      {form.itinerary.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDay(i)}
                          style={{
                            background: "#fef2f2", color: "#dc2626",
                            border: "1px solid #fecaca",
                            width: "40px", height: "40px",
                            borderRadius: "8px", fontSize: "14px",
                            cursor: "pointer", flexShrink: 0,
                            marginTop: "2px",
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SUBMIT */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="submit" disabled={saving}
                  style={{
                    background: saving ? "var(--green-400)" : "var(--green-600)",
                    color: "white", border: "none",
                    padding: "13px 36px", borderRadius: "50px",
                    fontSize: "15px", fontWeight: "600",
                    cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 16px rgba(22,163,74,0.3)",
                    transition: "all 0.2s",
                  }}
                >
                  {saving
                    ? "Saving..."
                    : editingId ? "Update Tour ✅" : "Add Tour 🌿"}
                </button>
                <button
                  type="button" onClick={resetForm}
                  style={{
                    background: "var(--bg-subtle)",
                    color: "var(--text-secondary)",
                    border: "1.5px solid var(--border)",
                    padding: "13px 24px", borderRadius: "50px",
                    fontSize: "14px", fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SEARCH */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "24px",
          flexWrap: "wrap", gap: "12px",
        }}>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "20px", fontWeight: "700",
            color: "var(--text-primary)",
          }}>
            All Tours ({filtered.length})
          </h3>
          <input
            type="text"
            placeholder="Search tours..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              ...inputStyle,
              width: "260px", paddingLeft: "16px",
            }}
            onFocus={e => e.target.style.borderColor = "var(--green-400)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{
              width: "44px", height: "44px",
              border: "4px solid var(--green-100)",
              borderTop: "4px solid var(--green-500)",
              borderRadius: "50%", margin: "0 auto 16px",
              animation: "spin 0.8s linear infinite",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* TOURS TABLE */}
        {!loading && (
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px", overflow: "hidden",
            boxShadow: "0 2px 12px var(--shadow)",
          }}>
            {filtered.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "60px 20px",
              }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🗺️</div>
                <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
                  No tours found. Add your first tour!
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Tour", "Location", "Category", "Price", "Seats", "Days", "Actions"].map(h => (
                        <th key={h} style={{
                          padding: "14px 16px", textAlign: "left",
                          fontSize: "11px", fontWeight: "700",
                          color: "var(--text-muted)",
                          letterSpacing: "1px", textTransform: "uppercase",
                          background: "var(--bg-subtle)",
                          borderBottom: "1px solid var(--border)",
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((tour, i) => (
                      <tr key={tour._id} style={{
                        background: i % 2 === 0
                          ? "var(--bg-card)" : "var(--bg-subtle)",
                      }}>

                        {/* TOUR NAME + IMAGE */}
                        <td style={{
                          padding: "14px 16px",
                          borderBottom: "1px solid var(--border)",
                        }}>
                          <div style={{
                            display: "flex", alignItems: "center", gap: "12px",
                          }}>
                            <img
                              src={tour.images?.[0] ||
                                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&q=60"}
                              alt={tour.tourName}
                              style={{
                                width: "48px", height: "48px",
                                borderRadius: "8px", objectFit: "cover",
                                flexShrink: 0,
                                border: "1px solid var(--border)",
                              }}
                              onError={e => e.target.src =
                                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&q=60"}
                            />
                            <span style={{
                              fontSize: "14px", fontWeight: "600",
                              color: "var(--text-primary)",
                              maxWidth: "180px",
                            }}>
                              {tour.tourName}
                            </span>
                          </div>
                        </td>

                        <td style={{
                          padding: "14px 16px", fontSize: "13px",
                          color: "var(--text-secondary)",
                          borderBottom: "1px solid var(--border)",
                        }}>
                          📍 {tour.location}
                        </td>

                        <td style={{
                          padding: "14px 16px",
                          borderBottom: "1px solid var(--border)",
                        }}>
                          <span style={{
                            background: "var(--green-50)",
                            color: "var(--green-700)",
                            padding: "3px 12px", borderRadius: "50px",
                            fontSize: "12px", fontWeight: "600",
                          }}>
                            {tour.category || "—"}
                          </span>
                        </td>

                        <td style={{
                          padding: "14px 16px", fontSize: "14px",
                          fontWeight: "700", color: "var(--green-700)",
                          borderBottom: "1px solid var(--border)",
                        }}>
                          ${Number(tour.price).toLocaleString()}
                        </td>

                        <td style={{
                          padding: "14px 16px", fontSize: "13px",
                          color: "var(--text-secondary)",
                          borderBottom: "1px solid var(--border)",
                        }}>
                          {tour.availableSeats}
                        </td>

                        <td style={{
                          padding: "14px 16px", fontSize: "13px",
                          color: "var(--text-secondary)",
                          borderBottom: "1px solid var(--border)",
                        }}>
                          {tour.itinerary?.length || 0} days
                        </td>

                        {/* ACTIONS */}
                        <td style={{
                          padding: "14px 16px",
                          borderBottom: "1px solid var(--border)",
                        }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleEdit(tour)}
                              style={{
                                background: "var(--green-50)",
                                color: "var(--green-700)",
                                border: "1.5px solid var(--green-200)",
                                padding: "6px 14px", borderRadius: "50px",
                                fontSize: "12px", fontWeight: "500",
                                cursor: "pointer", transition: "all 0.2s",
                              }}
                              onMouseEnter={e => {
                                e.target.style.background = "var(--green-600)";
                                e.target.style.color = "white";
                              }}
                              onMouseLeave={e => {
                                e.target.style.background = "var(--green-50)";
                                e.target.style.color = "var(--green-700)";
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(tour._id)}
                              disabled={deletingId === tour._id}
                              style={{
                                background: "none", color: "#dc2626",
                                border: "1.5px solid #fecaca",
                                padding: "6px 14px", borderRadius: "50px",
                                fontSize: "12px", fontWeight: "500",
                                cursor: deletingId === tour._id
                                  ? "not-allowed" : "pointer",
                                transition: "all 0.2s",
                              }}
                            >
                              {deletingId === tour._id ? "..." : "🗑️ Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}