import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();
const BASE_URL = "http://localhost:5000/api";

export function WishlistProvider({ children }) {
  const { user, token } = useAuth();
  const [wishlistTours, setWishlistTours] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // ---- Load wishlist from BACKEND when user logs in ----
  useEffect(() => {
    if (user && token) {
      fetchWishlist();
    } else {
      // User logged out — clear state only, data stays in MongoDB
      setWishlistTours([]);
      setLoaded(false);
    }
  }, [user, token]);

  const fetchWishlist = async () => {
    try {
      const res = await fetch(`${BASE_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // Handle different response shapes from your backend
      const list = data.wishlist || data.tours || data.data ||
        (Array.isArray(data) ? data : []);
      // Each item might be { tour: {...} } or the tour object directly
      const tours = list.map(item => item.tour || item).filter(Boolean);
      setWishlistTours(tours);
    } catch {
      setWishlistTours([]);
    } finally {
      setLoaded(true);
    }
  };

  const isWishlisted = (tourId) =>
    wishlistTours.some(t => (t._id || t.id) === tourId);

  const toggleWishlist = async (tour) => {
    if (!user) return false;

    const tourId  = tour._id || tour.id;
    const already = isWishlisted(tourId);

    // Optimistic update — instant UI
    if (already) {
      setWishlistTours(prev => prev.filter(t => (t._id || t.id) !== tourId));
    } else {
      setWishlistTours(prev => [...prev, tour]);
    }

    // Sync to backend — data saved in MongoDB permanently
    try {
      if (already) {
        await fetch(`${BASE_URL}/wishlist/${tourId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await fetch(`${BASE_URL}/wishlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tourId }),
        });
      }
    } catch {
      // If backend fails, revert the optimistic update
      if (already) {
        setWishlistTours(prev => [...prev, tour]);
      } else {
        setWishlistTours(prev => prev.filter(t => (t._id || t.id) !== tourId));
      }
    }

    return !already;
  };

  return (
    <WishlistContext.Provider value={{
      wishlistTours,
      setWishlistTours,
      isWishlisted,
      toggleWishlist,
      loaded,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);