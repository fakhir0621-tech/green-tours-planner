const BASE_URL = "http://localhost:5000/api";

// ---- TOURS ----
export const toursAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/tours?${query}`);
    return res.json();
  },
  getOne: async (id) => {
    const res = await fetch(`${BASE_URL}/tours/${id}`);
    return res.json();
  },
};

// ---- BOOKINGS ----
export const bookingsAPI = {
  create: async (bookingData, token) => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bookingData),
    });
    return res.json();
  },
    getUserBookings: async (token, userId) => {
     const res = await fetch(`${BASE_URL}/bookings/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
    });
     return res.json();
    },

  cancel: async (id, token) => {
    const res = await fetch(`${BASE_URL}/bookings/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};

// ---- AUTH ----
export const authAPI = {
  login: async (credentials) => {
    const res = await fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },
  register: async (userData) => {
    const res = await fetch(`${BASE_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return res.json();
  },
};

// ---- USER ----
export const userAPI = {
  update: async (id, data, token) => {
    const res = await fetch(`${BASE_URL}/users/profile/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};