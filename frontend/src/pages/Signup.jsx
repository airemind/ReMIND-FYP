import { useState } from 'react';
import { FiMoon, FiSun, FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo-light.png';
import { saveProfileSetup } from '../middleware/profileMiddleware';
import ProfileSetup from '../components/ProfileSetup';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { signupUser } from '../middleware/authMiddleware';
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

  /* SIGNUP */
  const handleSignup = async (e) => {
    e.preventDefault();

    /* VALIDATION */
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill all required fields.');
      return;
    }
    try {
      setLoading(true);
      setError('');

      /* USER DATA */
      const userData = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role: 'patient'
      };

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

      if (!passwordRegex.test(password)) {
        setError(
          'Password must be at least 8 characters long and contain an uppercase letter, lowercase letter, number, and special character.'
        );
        return;
      }

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
          'Signup failed.'
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
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="signup-input password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
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

            {/* BUTTON */}
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
        <ProfileSetup
          onComplete={async (profileData) => {
            try {
              setLoading(true);

              /* NORMAL SIGNUP */
              await signupUser(pendingPatientData);
              await login({
                username: pendingPatientData.email,
                password: pendingPatientData.password
              });

              /* NOW SAVE PROFILE */
              await saveProfileSetup(profileData);

              /* CLOSE POPUP */
              setShowProfileSetup(false);

              /* CLEAR DATA */
              setPendingPatientData(null);

              /* REDIRECT */
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
          }}
          onClose={() => {
            localStorage.removeItem('token');

            setShowProfileSetup(false);
            setPendingPatientData(null);
          }}
        />
      )}
    </>
  );
};
export default Signup;
