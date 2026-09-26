import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./dashboard.css";

export default function TeacherDashboard() {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [time, setTime] = useState(new Date());
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  // Render backend URL
  const API_URL = "https://eduslot-smart-class.onrender.com";

  const email =
    localStorage.getItem("userEmail") || "teacher@example.com";

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);

    fetchSeats();

    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch all seats
  const fetchSeats = async () => {
    setLoading(true);

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

      console.log("Teacher seats data:", res.data);

      setSeats(res.data);
    } catch (err) {
      console.log(
        "Teacher fetch error:",
        err.response?.data || err.message
      );

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset all seats
  const resetSeats = async () => {
  try {
    const token = localStorage.getItem("token");

    console.log("Reset button clicked");
    console.log("Token exists:", !!token);

    if (!token) {
      navigate("/");
      return;
    }

    const response = await axios.delete(
      "https://eduslot-smart-class.onrender.com/api/seat/reset",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Reset response:", response.data);

    setConfirm(false);

    await fetchSeats();
  } catch (err) {
    console.log(
      "RESET ERROR:",
      err.response?.data || err.message
    );
  }
};

  // Only booked seats
  const bookedSeats = seats.filter(
    (s) => s.isBooked === true
  );

  // Search by email or seat number
  const filtered = bookedSeats.filter(
    (s) =>
      !search ||
      s.bookedBy
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      String(s.seatNumber).includes(search)
  );

  return (
    <div className="dash-page">
      <div
        className="dash-bg-orb orb1"
        style={{ background: "#7c3aed" }}
      />

      <div className="dash-bg-orb orb2" />

      {/* Reset Confirm Modal */}
      {confirm && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Reset All Seats?</h3>

            <p>
              This will remove all bookings. This action cannot be
              undone.
            </p>

            <div className="modal-actions">
              <button
                className="modal-cancel"
                onClick={() => setConfirm(false)}
              >
                Cancel
              </button>

              <button
                className="modal-confirm"
                onClick={resetSeats}
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className={`dash-nav ${mounted ? "nav-in" : ""}`}>
        <div className="dash-logo">⬡ EduSlot</div>

        <div className="dash-nav-right">
          <span className="dash-email">{email}</span>

          <span className="dash-role-badge teacher-badge">
            Teacher
          </span>

          <button
            className="dash-logout"
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <main
        className={`dash-main ${mounted ? "main-in" : ""}`}
      >
        <div className="dash-header">
          <div>
            <p className="dash-greeting">
              Classroom Overview 📋
            </p>

            <h1 className="dash-title">
              Teacher Dashboard
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

        {/* Stats */}
        <div className="stat-cards">
          <div className="stat-card card-blue">
            <span className="stat-icon">🪑</span>
            <span className="stat-val">25</span>
            <span className="stat-name">Total</span>
          </div>

          <div className="stat-card card-red">
            <span className="stat-icon">🔴</span>
            <span className="stat-val">
              {bookedSeats.length}
            </span>
            <span className="stat-name">Booked</span>
          </div>

          <div className="stat-card card-green">
            <span className="stat-icon">✅</span>
            <span className="stat-val">
              {25 - bookedSeats.length}
            </span>
            <span className="stat-name">Free</span>
          </div>

          <div className="stat-card card-purple">
            <span className="stat-icon">📊</span>

            <span className="stat-val">
              {Math.round(
                (bookedSeats.length / 25) * 100
              )}
              %
            </span>

            <span className="stat-name">Filled</span>
          </div>
        </div>

        {/* Occupancy Bar */}
        <div className="occupancy-section">
          <div className="occ-header">
            <span className="section-label">
              OCCUPANCY
            </span>

            <span className="occ-val">
              {bookedSeats.length} / 25 seats
            </span>
          </div>

          <div className="occ-bar">
            <div
              className="occ-fill"
              style={{
                width: `${
                  (bookedSeats.length / 25) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Seat Grid Visual */}
        <div className="teacher-seat-grid-section">
          <p className="section-label">SEAT MAP</p>

          <div className="teacher-seat-grid">
            {Array.from({ length: 25 }, (_, i) => {
              const seat = seats.find(
                (s) => Number(s.seatNumber) === i + 1
              );

              return (
                <div
                  key={i}
                  className={`t-seat ${
                    seat?.isBooked
                      ? "t-booked"
                      : "t-free"
                  }`}
                  title={
                    seat?.isBooked
                      ? `Booked by ${seat.bookedBy}`
                      : `Seat ${i + 1} - Free`
                  }
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bookings List */}
        <div className="bookings-section">
          <div className="bookings-header">
            <p className="section-label">
              BOOKED SEATS ({filtered.length})
            </p>

            <input
              className="search-input"
              placeholder="🔍 Search by email or seat#"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          {loading ? (
            <div className="loading-row">
              <span className="spinner-blue" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              No bookings found
            </div>
          ) : (
            <div className="bookings-list">
              {filtered.map((s, i) => (
                <div
                  key={s._id}
                  className="booking-row"
                  style={{
                    animationDelay: `${i * 0.05}s`,
                  }}
                >
                  <div className="booking-num">
                    Seat #{s.seatNumber}
                  </div>

                  <div className="booking-email">
                    {s.bookedBy}
                  </div>

                  <span className="booking-badge">
                    Booked
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="teacher-actions">
          <button
            className="refresh-btn"
            onClick={fetchSeats}
          >
            🔄 Refresh Data
          </button>

          <button
            className="reset-btn"
            onClick={() => setConfirm(true)}
          >
            ⚠️ Reset All Seats
          </button>
        </div>
      </main>
    </div>
  );
}