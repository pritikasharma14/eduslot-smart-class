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

  const email =
    localStorage.getItem("userEmail") || "student@example.com";

  // Render backend URL
  const API_URL = "https://eduslot-smart-class.onrender.com";

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);

    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    fetchSeats();
    fetchNotification();

    return () => clearInterval(interval);
  }, []);

  // Fetch seats
  const fetchSeats = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const res = await axios.get(
        `${API_URL}/api/seat`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Student seats:", res.data);

      setSeats(res.data);
    } catch (err) {
      console.log(
        "Fetch seats error:",
        err.response?.data || err.message
      );

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/");
      }
    }
  };

  // Fetch teacher notification
  const fetchNotification = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const res = await axios.get(
        `${API_URL}/api/seat/notification`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Notification:", res.data);

      if (res.data) {
        const notificationTime = new Date(
          res.data.createdAt
        );

        const now = new Date();

        const hours =
          (now - notificationTime) /
          (1000 * 60 * 60);

        // Show notification for 24 hours
        if (hours < 24) {
          setNotification(res.data);
        } else {
          setNotification(null);
        }
      } else {
        setNotification(null);
      }
    } catch (err) {
      console.log(
        "Notification error:",
        err.response?.data || err.message
      );
    }
  };

  // Refresh both seats and notification
  const refreshData = () => {
    fetchSeats();
    fetchNotification();
  };

  const booked = seats.filter(
    (s) => s.isBooked === true
  ).length;

  const available = 25 - booked;

  const mySeat = seats.find(
    (s) =>
      s.bookedBy === email &&
      s.isBooked === true
  );

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="dash-page">
      <div className="dash-bg-orb orb1" />
      <div className="dash-bg-orb orb2" />

      {/* Navbar */}
      <nav className={`dash-nav ${mounted ? "nav-in" : ""}`}>
        <div className="dash-logo">
          ⬡ EduSlot
        </div>

        <div className="dash-nav-right">
          <span className="dash-email">
            {email}
          </span>

          <span className="dash-role-badge">
            Student
          </span>

          <button
            className="dash-logout"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </nav>

      <main
        className={`dash-main ${
          mounted ? "main-in" : ""
        }`}
      >
        {/* Header */}
        <div className="dash-header">
          <div>
            <p className="dash-greeting">
              Good{" "}
              {time.getHours() < 12
                ? "morning"
                : time.getHours() < 17
                ? "afternoon"
                : "evening"}{" "}
              👋
            </p>

            <h1 className="dash-title">
              Student Dashboard
            </h1>
          </div>

          <div className="dash-clock">
            {time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
        </div>

        {/* Teacher Notification */}
        {notification && (
          <div className="my-seat-banner">
            <span className="msb-icon">
              🔔
            </span>

            <div>
              <p className="msb-title">
                Important Notice
              </p>

              <p className="msb-sub">
                {notification.message}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="stat-cards">
          <div className="stat-card card-blue">
            <span className="stat-icon">
              🪑
            </span>

            <span className="stat-val">
              {available}
            </span>

            <span className="stat-name">
              Available
            </span>
          </div>

          <div className="stat-card card-red">
            <span className="stat-icon">
              🔴
            </span>

            <span className="stat-val">
              {booked}
            </span>

            <span className="stat-name">
              Booked
            </span>
          </div>

          <div className="stat-card card-green">
            <span className="stat-icon">
              ✅
            </span>

            <span className="stat-val">
              {mySeat
                ? mySeat.seatNumber
                : "—"}
            </span>

            <span className="stat-name">
              My Seat
            </span>
          </div>

          <div className="stat-card card-purple">
            <span className="stat-icon">
              📊
            </span>

            <span className="stat-val">
              {Math.round(
                (available / 25) * 100
              )}
              %
            </span>

            <span className="stat-name">
              Free
            </span>
          </div>
        </div>

        {/* My booking status */}
        {mySeat ? (
          <div className="my-seat-banner">
            <span className="msb-icon">
              🎉
            </span>

            <div>
              <p className="msb-title">
                You're all set!
              </p>

              <p className="msb-sub">
                You have Seat{" "}
                <strong>
                  #{mySeat.seatNumber}
                </strong>{" "}
                reserved for today's class.
              </p>
            </div>
          </div>
        ) : (
          <div className="book-cta">
            <div>
              <p className="cta-title">
                No seat booked yet
              </p>

              <p className="cta-sub">
                Book your seat now —{" "}
                {available} seats still available!
              </p>
            </div>

            <button
              className="cta-btn"
              onClick={() =>
                navigate("/booking")
              }
            >
              🪑 Book a Seat →
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <p className="section-label">
            QUICK ACTIONS
          </p>

          <div className="action-grid">
            <button
              className="action-card"
              onClick={() =>
                navigate("/booking")
              }
            >
              <span className="action-icon">
                🪑
              </span>

              <span className="action-title">
                Book Seat
              </span>

              <span className="action-sub">
                Choose your spot
              </span>
            </button>

            <button
              className="action-card"
              onClick={refreshData}
            >
              <span className="action-icon">
                🔄
              </span>

              <span className="action-title">
                Refresh
              </span>

              <span className="action-sub">
                Update availability
              </span>
            </button>

            <button
              className="action-card"
              onClick={() =>
                navigate("/")
              }
            >
              <span className="action-icon">
                🏠
              </span>

              <span className="action-title">
                Home
              </span>

              <span className="action-sub">
                Back to landing
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}