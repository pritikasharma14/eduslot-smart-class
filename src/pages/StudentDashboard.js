import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./dashboard.css";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [seats, setSeats] = useState([]);
  const [notification, setNotification] = useState(null);
  const [time, setTime] = useState(new Date());
  const email = localStorage.getItem("userEmail") || "student@example.com";

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
    const interval = setInterval(() => setTime(new Date()), 1000);
    fetchSeats();
    fetchNotification();
    return () => clearInterval(interval);
  }, []);

  const fetchSeats = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      "http://localhost:5000/api/seat",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setSeats(res.data);

  } catch (err) {
    console.log(
      "Fetch seats error:",
      err.response?.data || err.message
    );
  }
};
const fetchNotification = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      "http://localhost:5000/api/seat/notification",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
if (res.data) {
  const notificationTime = new Date(res.data.createdAt);
  const now = new Date();

  const hours = (now - notificationTime) / (1000 * 60 * 60);

  if (hours < 24) {
    setNotification(res.data);
  }
}
    

  } catch (err) {
    console.log(
      "Notification error:",
      err.response?.data || err.message
    );
  }
};

  const booked = seats.filter(s => s.isBooked).length;
  const available = 25 - booked;
  const mySeat = seats.find(s => s.bookedBy === email);

  const logout = () => { localStorage.clear(); navigate("/"); };

  return (
    <div className="dash-page">
      <div className="dash-bg-orb orb1" />
      <div className="dash-bg-orb orb2" />

      {/* Navbar */}
      <nav className={`dash-nav ${mounted ? "nav-in" : ""}`}>
        <div className="dash-logo">⬡ EduSlot</div>
        <div className="dash-nav-right">
          <span className="dash-email">{email}</span>
          <span className="dash-role-badge">Student</span>
          <button className="dash-logout" onClick={logout}>Logout</button>
        </div>
      </nav>

      <main className={`dash-main ${mounted ? "main-in" : ""}`}>
        {/* Header */}
        <div className="dash-header">
          <div>
            <p className="dash-greeting">Good {time.getHours() < 12 ? "morning" : time.getHours() < 17 ? "afternoon" : "evening"} 👋</p>
            <h1 className="dash-title">Student Dashboard</h1>
          </div>
          <div className="dash-clock">
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
        </div>
        {notification && (
  <div className="my-seat-banner">
    <span className="msb-icon">🔔</span>
    <div>
      <p className="msb-title">Important Notice</p>
      <p className="msb-sub">
        {notification.message}
      </p>
    </div>
  </div>
)}
        {/* Stats */}
        <div className="stat-cards">
          <div className="stat-card card-blue">
            <span className="stat-icon">🪑</span>
            <span className="stat-val">{available}</span>
            <span className="stat-name">Available</span>
          </div>
          <div className="stat-card card-red">
            <span className="stat-icon">🔴</span>
            <span className="stat-val">{booked}</span>
            <span className="stat-name">Booked</span>
          </div>
          <div className="stat-card card-green">
            <span className="stat-icon">✅</span>
            <span className="stat-val">{mySeat ? mySeat.seatNumber : "—"}</span>
            <span className="stat-name">My Seat</span>
          </div>
          <div className="stat-card card-purple">
            <span className="stat-icon">📊</span>
            <span className="stat-val">{Math.round((available / 25) * 100)}%</span>
            <span className="stat-name">Free</span>
          </div>
        </div>

        {/* My booking status */}
        {mySeat ? (
          <div className="my-seat-banner">
            <span className="msb-icon">🎉</span>
            <div>
              <p className="msb-title">You're all set!</p>
              <p className="msb-sub">You have Seat <strong>#{mySeat.seatNumber}</strong> reserved for today's class.</p>
            </div>
          </div>
        ) : (
          <div className="book-cta">
            <div>
              <p className="cta-title">No seat booked yet</p>
              <p className="cta-sub">Book your seat now — {available} seats still available!</p>
            </div>
            <button className="cta-btn" onClick={() => navigate("/booking")}>
              🪑 Book a Seat →
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <p className="section-label">QUICK ACTIONS</p>
          <div className="action-grid">
            <button className="action-card" onClick={() => navigate("/booking")}>
              <span className="action-icon">🪑</span>
              <span className="action-title">Book Seat</span>
              <span className="action-sub">Choose your spot</span>
            </button>
            <button className="action-card" onClick={fetchSeats}>
              <span className="action-icon">🔄</span>
              <span className="action-title">Refresh</span>
              <span className="action-sub">Update availability</span>
            </button>
            <button className="action-card" onClick={() => navigate("/")}>
              <span className="action-icon">🏠</span>
              <span className="action-title">Home</span>
              <span className="action-sub">Back to landing</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
