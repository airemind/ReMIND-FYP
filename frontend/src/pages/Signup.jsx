import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/logo-light.png";
import { saveProfileSetup } from "../middleware/profileMiddleware";

import ProfileSetup from "../components/ProfileSetup";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import { signupUser } from "../middleware/authMiddleware";

import "../styles/Signup.css";

const Signup = () => {
  const navigate = useNavigate();

  const { theme, toggleTheme } = useTheme();

  const { login, loginWithGoogle } = useAuth();

  /* STATES */

  const [pendingPatientData, setPendingPatientData] = useState(null);

  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const [username, setUsername] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /* SIGNUP */

  const handleSignup = async (e) => {
    e.preventDefault();

    /* VALIDATION */

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("Please fill all required fields.");

      return;
    }

    try {
      setLoading(true);

      setError("");

      /* USER DATA */

      const userData = {
        username: username.trim(),

        email: email.trim().toLowerCase(),

        password: password.trim(),

        role: "patient",
      };

      /* SAVE TEMPORARILY */

      setPendingPatientData(userData);

      /* OPEN PROFILE SETUP */

      setShowProfileSetup(true);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.error ||
          error?.response?.data?.detail ||
          error?.message ||
          "Signup failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="signup-page">
        {/* THEME TOGGLE */}

        <div className="signup-theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? (
            <FiMoon className="signup-theme-icon" />
          ) : (
            <FiSun className="signup-theme-icon sun" />
          )}
        </div>

        {/* CARD */}

        <div className="signup-card">
          {/* LOGO */}

          <div className="signup-logo">
            <img src={logo} alt="ReMIND Logo" />
          </div>

          {/* FORM */}

          <form className="signup-form" onSubmit={handleSignup}>
            {/* USERNAME */}

            <input
              type="text"
              placeholder="Username"
              className="signup-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            {/* EMAIL */}

            <input
              type="email"
              placeholder="Email"
              className="signup-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* PASSWORD */}

            <input
              type="password"
              placeholder="Password"
              className="signup-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* ERROR */}

            {error && <p className="signup-error">{error}</p>}

            {/* BUTTON */}

            <button
              type="submit"
              className="signup-primary-btn"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* DIVIDER */}

          <div className="signup-divider">
            <span></span>
          </div>

          {/* GOOGLE */}

          <div className="signup-google-btn">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  setLoading(true);

                  setError("");

                  /* SAVE GOOGLE DATA TEMPORARILY */

                  setPendingPatientData({
                    googleToken: credentialResponse.credential,

                    isGoogleSignup: true,
                  });

                  /* OPEN PROFILE SETUP */

                  setShowProfileSetup(true);
                } catch (error) {
                  console.error(error);

                  setError(
                    error?.response?.data?.error || "Google signup failed.",
                  );
                } finally {
                  setLoading(false);
                }
              }}
              onError={() => {
                setError("Google signup failed.");
              }}
            />
          </div>
          {/* FOOTER */}

          <p className="signup-footer">
            Already have an account?{" "}
            <span className="signup-link" onClick={() => navigate("/login")}>
              <u>Login</u>
            </span>
          </p>
        </div>
      </div>

      {/* PROFILE SETUP */}

      {showProfileSetup && (
        <ProfileSetup
          onComplete={async (profileData) => {
            try {
              setLoading(true);

              /* NORMAL SIGNUP */

              if (!pendingPatientData?.isGoogleSignup) {
                /* CREATE ACCOUNT */

                await signupUser(pendingPatientData);

                /* LOGIN */

                await login({
                  username: pendingPatientData.email,
                  password: pendingPatientData.password,
                });
              } else {
                /* GOOGLE SIGNUP */

                const response = await loginWithGoogle({
                  token: pendingPatientData.googleToken,
                  role: "patient",
                });

                localStorage.setItem("token", response.access_token);
              }

              /* NOW SAVE PROFILE */

              await saveProfileSetup(profileData);

              /* CLOSE POPUP */

              setShowProfileSetup(false);

              /* CLEAR DATA */

              setPendingPatientData(null);

              /* REDIRECT */

              navigate("/dashboard", {
                replace: true,
              });
            } catch (error) {
              console.error(error);

              setError(
                error?.response?.data?.error ||
                  error?.response?.data?.detail ||
                  error?.message ||
                  "Failed to create account.",
              );
            } finally {
              setLoading(false);
            }
          }}
          onClose={() => {
            localStorage.removeItem("token");

            setShowProfileSetup(false);

            setPendingPatientData(null);
          }}
        />
      )}
    </>
  );
};

export default Signup;
