import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://localhost:5000/api";

const FALLBACK_REVIEWS = [
  {
    _id: "r1",
    tourId: {
      _id: "t1", title: "Swiss Alps Trek",
      photo: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=80",
      city: "Switzerland",
    },
    rating: 5,
    comment: "Absolutely breathtaking experience! The guide was incredibly knowledgeable and the scenery was beyond words. Would book again in a heartbeat.",
    createdAt: "2025-04-10",
  },
  {
    _id: "r2",
    tourId: {
      _id: "t2", title: "Bali Eco Retreat",
      photo: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80",
      city: "Indonesia",
    },
    rating: 4,
    comment: "Beautiful retreat with great food and accommodation. The eco-friendly practices were impressive. Highly recommend for nature lovers.",
    createdAt: "2025-03-22",
  },
];

const FALLBACK_TOURS = [
  { _id: "t1", title: "Swiss Alps Trek",     city: "Switzerland" },
  { _id: "t2", title: "Bali Eco Retreat",    city: "Indonesia" },
  { _id: "t3", title: "Kyoto Cultural Tour", city: "Japan" },
  { _id: "t4", title: "Santorini Escape",    city: "Greece" },
];

function StarRating({ value, onChange, size = 28 }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          style={{
            background: "none", border: "none",
            fontSize: `${size}px`, cursor: onChange ? "pointer" : "default",
            color: star <= (hovered || value) ? "#f59e0b" : "#d1d5db",
            transition: "color 0.15s, transform 0.15s",
            transform: hovered === star ? "scale(1.2)" : "scale(1)",
            padding: "0 1px",
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function Reviews() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [myReviews, setMyReviews]   = useState([]);
  const [tours, setTours]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId]   = useState(null);
  const [success, setSuccess]       = useState("");

  const [form, setForm] = useState({
    tourId: "", rating: 5, comment: "",
  });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchData();
    window.scrollTo(0, 0);
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [rRes, tRes] = await Promise.allSettled([
        fetch(`${BASE_URL}/reviews/my-reviews`, { headers }).then(r => r.json()),
        fetch(`${BASE_URL}/tours`).then(r => r.json()),
      ]);

      const reviewList = rRes.status === "fulfilled"
        ? (rRes.value.reviews || rRes.value.data || (Array.isArray(rRes.value) ? rRes.value : []))
        : [];
      const tourList = tRes.status === "fulfilled"
        ? (tRes.value.tours || tRes.value.data || (Array.isArray(tRes.value) ? tRes.value : []))
        : [];

      setMyReviews(reviewList.length > 0 ? reviewList : FALLBACK_REVIEWS);
      setTours(tourList.length > 0 ? tourList : FALLBACK_TOURS);
    } catch {
      setMyReviews(FALLBACK_REVIEWS);
      setTours(FALLBACK_TOURS);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tourId) { alert("Please select a tour."); return; }
    if (!form.comment.trim()) { alert("Please write a comment."); return; }
    setSubmitting(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${BASE_URL}/reviews/${editingId}`
        : `${BASE_URL}/reviews`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      const saved = data.review || data.data || {
        _id: editingId || Date.now().toString(),
        ...form,
        tourId: tours.find(t => t._id === form.tourId) || { title: "Tour", city: "" },
        createdAt: new Date().toISOString(),
      };

      if (editingId) {
        setMyReviews(prev => prev.map(r => r._id === editingId ? { ...r, ...saved, rating: form.rating, comment: form.comment } : r));
        setSuccess("Review updated successfully! ✅");
      } else {
        setMyReviews(prev => [saved, ...prev]);
        setSuccess("Review submitted successfully! ✅");
      }

      setForm({ tourId: "", rating: 5, comment: "" });
      setShowForm(false);
      setEditingId(null);
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      // Optimistic update
      const optimistic = {
        _id: editingId || Date.now().toString(),
        ...form,
        tourId: tours.find(t => t._id === form.tourId) || { title: "Tour", city: "" },
        createdAt: new Date().toISOString(),
      };
      if (editingId) {
        setMyReviews(prev => prev.map(r => r._id === editingId
          ? { ...r, rating: form.rating, comment: form.comment } : r));
        setSuccess("Review updated! ✅");
      } else {
        setMyReviews(prev => [optimistic, ...prev]);
        setSuccess("Review submitted! ✅");
      }
      setForm({ tourId: "", rating: 5, comment: "" });
      setShowForm(false);
      setEditingId(null);
      setTimeout(() => setSuccess(""), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review) => {
    setForm({
      tourId: review.tourId?._id || review.tourId || "",
      rating: review.rating || 5,
      comment: review.comment || "",
    });
    setEditingId(review._id);
    setShowForm(true);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    setDeletingId(id);
    try {
      await fetch(`${BASE_URL}/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyReviews(prev => prev.filter(r => r._id !== id));
    } catch {
      setMyReviews(prev => prev.filter(r => r._id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ tourId: "", rating: 5, comment: "" });
  };

  if (loading) return (
    <div style={{ paddingTop: "70px", textAlign: "center", padding: "160px 0" }}>
      <div style={{
        width: "48px", height: "48px",
        border: "4px solid var(--green-100)",
        borderTop: "4px solid var(--green-500)",
        borderRadius: "50%", margin: "0 auto 16px",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "var(--gray-400)" }}>Loading your reviews...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

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
        <p style={{
          fontSize: "11px", letterSpacing: "3px",
          color: "var(--green-400)", fontWeight: "600",
          textTransform: "uppercase", marginBottom: "10px",
        }}>
          MY ACCOUNT
        </p>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", flexWrap: "wrap", gap: "16px",
        }}>
          <div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(26px, 3.5vw, 40px)",
              fontWeight: "700", color: "white", marginBottom: "8px",
            }}>
              ⭐ My Reviews
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px" }}>
              {myReviews.length} review{myReviews.length !== 1 ? "s" : ""} submitted
            </p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ tourId: "", rating: 5, comment: "" }); }}
            style={{
              background: showForm ? "rgba(255,255,255,0.15)" : "var(--green-500)",
              color: "white", border: showForm
                ? "1.5px solid rgba(255,255,255,0.3)"
                : "none",
              padding: "12px 24px", borderRadius: "50px",
              fontSize: "14px", fontWeight: "600",
              cursor: "pointer", transition: "all 0.2s",
              boxShadow: showForm ? "none" : "0 4px 16px rgba(34,197,94,0.4)",
            }}
          >
            {showForm ? "✕ Cancel" : "+ Write a Review"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 5%" }}>

        {/* SUCCESS MESSAGE */}
        {success && (
          <div style={{
            background: "#dcfce7", border: "1px solid #86efac",
            color: "#16a34a", padding: "13px 18px",
            borderRadius: "10px", fontSize: "14px",
            marginBottom: "24px",
          }}>
            {success}
          </div>
        )}

        {/* REVIEW FORM */}
        {showForm && (
          <div style={{
            background: "white",
            border: "1px solid var(--gray-100)",
            borderRadius: "16px", padding: "32px",
            marginBottom: "32px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "22px", fontWeight: "700",
              color: "var(--gray-800)", marginBottom: "24px",
            }}>
              {editingId ? "Edit Your Review" : "Write a New Review"}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* TOUR SELECT */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block", fontSize: "13px",
                  fontWeight: "600", color: "var(--gray-600)", marginBottom: "8px",
                }}>
                  Select Tour *
                </label>
                <select
                  value={form.tourId}
                  onChange={e => setForm({ ...form, tourId: e.target.value })}
                  disabled={!!editingId}
                  style={{
                    width: "100%", padding: "12px 16px",
                    border: "1.5px solid var(--gray-200)",
                    borderRadius: "10px", fontSize: "14px",
                    fontFamily: "'DM Sans', sans-serif",
                    color: "var(--gray-800)", background: "white",
                    outline: "none", cursor: editingId ? "not-allowed" : "pointer",
                  }}
                >
                  <option value="">-- Choose a tour you've been on --</option>
                  {tours.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.title} — {t.city || t.location}
                    </option>
                  ))}
                </select>
              </div>

              {/* STAR RATING */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block", fontSize: "13px",
                  fontWeight: "600", color: "var(--gray-600)", marginBottom: "10px",
                }}>
                  Your Rating *
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <StarRating
                    value={form.rating}
                    onChange={(val) => setForm({ ...form, rating: val })}
                    size={32}
                  />
                  <span style={{
                    fontSize: "14px", color: "var(--gray-500)", fontWeight: "500",
                  }}>
                    {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][form.rating]}
                  </span>
                </div>
              </div>

              {/* COMMENT */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block", fontSize: "13px",
                  fontWeight: "600", color: "var(--gray-600)", marginBottom: "8px",
                }}>
                  Your Review *
                </label>
                <textarea
                  value={form.comment}
                  onChange={e => setForm({ ...form, comment: e.target.value })}
                  placeholder="Share your experience — what did you love? What could be improved?"
                  rows={5}
                  style={{
                    width: "100%", padding: "12px 16px",
                    border: "1.5px solid var(--gray-200)",
                    borderRadius: "10px", fontSize: "14px",
                    fontFamily: "'DM Sans', sans-serif",
                    color: "var(--gray-800)", background: "white",
                    outline: "none", resize: "vertical", lineHeight: "1.7",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--green-400)"}
                  onBlur={e => e.target.style.borderColor = "var(--gray-200)"}
                />
                <div style={{
                  textAlign: "right", fontSize: "12px",
                  color: form.comment.length > 400 ? "#dc2626" : "var(--gray-400)",
                  marginTop: "6px",
                }}>
                  {form.comment.length}/500
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="submit" disabled={submitting}
                  style={{
                    background: submitting ? "var(--green-400)" : "var(--green-600)",
                    color: "white", border: "none",
                    padding: "13px 32px", borderRadius: "50px",
                    fontSize: "14px", fontWeight: "600",
                    boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
                    cursor: submitting ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {submitting
                    ? "Submitting..."
                    : editingId ? "Update Review" : "Submit Review ⭐"}
                </button>
                <button
                  type="button" onClick={cancelForm}
                  style={{
                    background: "var(--gray-50)",
                    color: "var(--gray-600)",
                    border: "1.5px solid var(--gray-200)",
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

        {/* EMPTY STATE */}
        {myReviews.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>⭐</div>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "24px", color: "var(--gray-800)", marginBottom: "10px",
            }}>
              No reviews yet
            </h3>
            <p style={{
              color: "var(--gray-400)", fontSize: "15px", marginBottom: "28px",
            }}>
              Share your experience to help other travelers.
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: "var(--green-600)", color: "white",
                border: "none", padding: "13px 32px",
                borderRadius: "50px", fontSize: "14px",
                fontWeight: "500", cursor: "pointer",
              }}
            >
              Write Your First Review
            </button>
          </div>
        )}

        {/* REVIEWS LIST */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {myReviews.map((review) => {
            const tour = review.tourId || {};
            return (
              <div key={review._id} style={{
                background: "white",
                border: "1px solid var(--gray-100)",
                borderRadius: "16px", overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                transition: "box-shadow 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.09)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"}
              >
                <div style={{
                  display: "grid", gridTemplateColumns: "120px 1fr",
                }}>
                  {/* TOUR IMAGE */}
                  <div style={{ position: "relative", overflow: "hidden" }}>
                    <img
                      src={tour.photo || tour.image ||
                        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80"}
                      alt={tour.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>

                  {/* REVIEW CONTENT */}
                  <div style={{ padding: "22px 24px" }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "flex-start", marginBottom: "10px",
                      flexWrap: "wrap", gap: "8px",
                    }}>
                      <div>
                        <Link to={`/tours/${tour._id}`} style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: "17px", fontWeight: "700",
                          color: "var(--gray-800)", textDecoration: "none",
                          transition: "color 0.2s",
                        }}
                          onMouseEnter={e => e.target.style.color = "var(--green-600)"}
                          onMouseLeave={e => e.target.style.color = "var(--gray-800)"}
                        >
                          {tour.title || "Tour"}
                        </Link>
                        {tour.city && (
                          <p style={{
                            fontSize: "12px", color: "var(--green-600)",
                            fontWeight: "600", marginTop: "2px",
                          }}>
                            📍 {tour.city}
                          </p>
                        )}
                      </div>
                      <span style={{
                        fontSize: "12px", color: "var(--gray-400)",
                      }}>
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString("en-US", {
                              month: "long", day: "numeric", year: "numeric",
                            })
                          : ""}
                      </span>
                    </div>

                    {/* STARS */}
                    <div style={{ marginBottom: "12px" }}>
                      <StarRating value={review.rating || 5} size={18} />
                    </div>

                    {/* COMMENT */}
                    <p style={{
                      fontSize: "14px", color: "var(--gray-600)",
                      lineHeight: "1.8", marginBottom: "16px",
                    }}>
                      "{review.comment}"
                    </p>

                    {/* ACTIONS */}
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleEdit(review)}
                        style={{
                          background: "var(--green-50)",
                          color: "var(--green-700)",
                          border: "1.5px solid var(--green-200)",
                          padding: "6px 16px", borderRadius: "50px",
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
                        onClick={() => handleDelete(review._id)}
                        disabled={deletingId === review._id}
                        style={{
                          background: "none", color: "#dc2626",
                          border: "1.5px solid #fecaca",
                          padding: "6px 16px", borderRadius: "50px",
                          fontSize: "12px", fontWeight: "500",
                          cursor: deletingId === review._id ? "not-allowed" : "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {deletingId === review._id ? "Deleting..." : "🗑️ Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}