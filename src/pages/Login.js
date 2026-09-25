import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import axios from "axios";

export default function Login() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login"); // login | signup
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

const handleLogin = async () => {
  if (!email || !password) {
    return showToast("Please enter email and password");
  }

  setLoading(true);

  try {
    const res = await axios.post(
      "http://localhost:5000/api/auth/login",
      { email, password, role }
    );

    const user = res.data.user;
    const token = res.data.token;

    localStorage.setItem("token", token);
    localStorage.setItem("role", user.role);
    localStorage.setItem("userEmail", user.email);

    showToast("Welcome back! Redirecting...", "success");

    setTimeout(() => {
      navigate(user.role === "student" ? "/student" : "/teacher");
    }, 1000);

  } catch (err) {
    showToast(
      err.response?.data?.message || "Invalid credentials. Try again."
    );
  } finally {
    setLoading(false);
  }
};

  const handleSignup = async () => {
    if (!email || !password) return showToast("Enter email & password first");
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/signup", { email, password, role });
      showToast("Account created! Now login.", "success");
      setMode("login");
    } catch {
      showToast("Signup failed. Email may already exist.");
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-bg-orb orb-a" />
      <div className="login-bg-orb orb-b" />

      {/* Toast */}
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      {/* Back */}
      <button className="back-btn" onClick={() => navigate("/")}>← Back</button>

      <div className={`login-card ${mounted ? "card-visible" : ""}`}>
        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo-icon">⬡</span>
          <span>EduSlot</span>
        </div>

        <h2 className="login-title">{mode === "login" ? "Welcome back" : "Create account"}</h2>
        <p className="login-sub">{mode === "login" ? "Sign in to book your seat" : "Join the smart classroom system"}</p>

        {/* Role Toggle */}
        <div className="role-toggle">
          <button className={`role-btn ${role === "student" ? "role-active" : ""}`} onClick={() => setRole("student")}>
            🎓 Student
          </button>
          <button className={`role-btn ${role === "teacher" ? "role-active" : ""}`} onClick={() => setRole("teacher")}>
            📚 Teacher
          </button>
        </div>

        {/* Fields */}
        <div className="field-group">
          <label>Email</label>
          <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="login-input" />
        </div>
        <div className="field-group">
          <label>Password</label>
          <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="login-input" onKeyDown={(e) => e.key === "Enter" && (mode === "login" ? handleLogin() : handleSignup())} />
        </div>

        {/* Action */}
        <button className={`login-btn ${loading ? "btn-loading" : ""}`} onClick={mode === "login" ? handleLogin : handleSignup} disabled={loading}>
          {loading ? <span className="spinner" /> : (mode === "login" ? "Sign In" : "Create Account")}
        </button>

        {/* Switch mode */}
        <p className="mode-switch">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}
          <button className="switch-btn" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? " Sign up" : " Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
