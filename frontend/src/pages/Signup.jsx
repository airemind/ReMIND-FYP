import { useState } from 'react';
import { FiEye, FiEyeOff, FiMoon, FiSun } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ProfileSetup from '../components/ProfileSetup';
import logo from '../assets/images/logo-light.png';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { signupUser } from '../middleware/authMiddleware';
import { saveProfileSetup } from '../middleware/profileMiddleware';
import '../styles/Signup.css';

const Signup = () => {
  const navigate = useNavigate();

  const { theme, toggleTheme } = useTheme();
  const { login } = useAuth();
  const [pendingPatientData, setPendingPatientData] = useState(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* SIGN UP */

  const handleSignup = async (event) => {
    event.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill all required fields.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!passwordRegex.test(password)) {
      setError(
        'Password must be at least 8 characters long and contain an uppercase letter, lowercase letter, number, and special character.'
      );
      return;
    }

    try {
      setLoading(true);
      setError('');

      const userData = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role: 'patient'
      };

      setPendingPatientData(userData);

      setShowProfileSetup(true);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.error ||
          error?.response?.data?.detail ||
          error?.message ||
          'Signup failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* COMPLETE PROFILE */

  const handleProfileComplete = async (profileData) => {
    try {
      setLoading(true);

      await signupUser(pendingPatientData);

      await login({
        username: pendingPatientData.email,
        password: pendingPatientData.password
      });

      await saveProfileSetup(profileData);

      setShowProfileSetup(false);
      setPendingPatientData(null);

      navigate('/dashboard', {
        replace: true
      });
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.error ||
          error?.response?.data?.detail ||
          error?.message ||
          'Failed to create account.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* CLOSE PROFILE POPUP */

  const handleProfileClose = () => {
    localStorage.removeItem('token');

    setShowProfileSetup(false);
    setPendingPatientData(null);
  };

  return (
    <>
      <div className="signup-page">
        {/* THEME */}

        <div className="signup-theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? (
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
              className="signup-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            {/* EMAIL */}

            <input
              type="email"
              className="signup-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* PASSWORD */}

            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="signup-input password-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {/* PASSWORD REQUIREMENTS */}

            <div className="password-requirements">
              <div className="password-requirements-title">Password Requirements</div>

              <ul>
                <li>Minimum 8 characters</li>

                <li>At least 1 uppercase letter (A-Z)</li>

                <li>At least 1 lowercase letter (a-z)</li>

                <li>At least 1 number (0-9)</li>

                <li>At least 1 special character (!@#$%^&*)</li>
              </ul>
            </div>

            {/* ERROR */}

            {error && <p className="signup-error">{error}</p>}

            {/* SIGN UP */}

            <button type="submit" className="signup-primary-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {/* FOOTER */}

          <p className="signup-footer">
            Already have an account?{' '}
            <span className="signup-link" onClick={() => navigate('/login')}>
              <u>Login</u>
            </span>
          </p>
        </div>
      </div>

      {/* PROFILE SETUP */}

      {showProfileSetup && (
        <ProfileSetup onComplete={handleProfileComplete} onClose={handleProfileClose} />
      )}
    </>
  );
};

export default Signup;
