import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Tours from "./pages/Tours";
import TourDetails from "./pages/TourDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import BookingPage from "./pages/BookingPage";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/tours/:id" element={<TourDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<Account />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/book/:tourId" element={<BookingPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;