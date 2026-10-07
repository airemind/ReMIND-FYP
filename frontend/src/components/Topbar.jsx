import { useEffect, useRef, useState } from 'react';
import { FiMenu, FiMoon, FiSun, FiUser } from 'react-icons/fi';

import { useTheme } from '../context/ThemeContext';

import ProfileDropdown from './ProfileDropdown';

import '../styles/Topbar.css';

const Topbar = ({ toggleMobileSidebar = () => {} }) => {
  const { theme, toggleTheme } = useTheme();

  const [open, setOpen] = useState(false);

  const profileContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileContainerRef.current &&
        !profileContainerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-right">

        {/* Mobile Menu */}

        <div
          className="topbar-icon-wrapper mobile-menu-btn"
          onClick={toggleMobileSidebar}
        >
          <FiMenu className="topbar-icon" />
        </div>

        {/* Theme Toggle */}

        <div
          className="topbar-icon-wrapper"
          onClick={toggleTheme}
        >
          {theme === 'light' ? (
            <FiMoon className="topbar-icon" />
          ) : (
            <FiSun className="topbar-icon sun" />
          )}
        </div>

        {/* Profile */}

        <div
          className="profile-container"
          ref={profileContainerRef}
        >
          <div
            className="topbar-icon-wrapper"
            onClick={() => setOpen((prev) => !prev)}
          >
            <FiUser className="topbar-icon" />
          </div>

          {open && <ProfileDropdown />}
        </div>

      </div>
    </div>
  );
};

export default Topbar;
