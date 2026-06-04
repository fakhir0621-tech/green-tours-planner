import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ThemeProvider } from "./context/ThemeContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
         <WishlistProvider>
        <App />
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);