import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import '../styles/TermsConditions.css';
import logoLight from '../assets/images/logo-light.png';
import logoDark from '../assets/images/logo-dark.png';
import { FiMoon, FiSun, FiHelpCircle } from 'react-icons/fi';

const TermsConditions = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);
  const handleAccept = () => {
    navigate('/login');
  };

  return (
    <>
      <div className={`page ${showHelp ? 'blur-active' : ''}`}>
        <header className="header">
          <div className="logo">
            <img
              src={theme === 'dark' ? logoDark : logoLight}
              alt="ReMIND Logo"
              className="logo-image"
            />

            <span className="logo-text">ReMIND</span>
          </div>

          <div className="header-actions">
            <div className="theme-toggle-container" onClick={toggleTheme}>
              {theme === 'light' ? (
                <FiMoon className="theme-toggle-icon" />
              ) : (
                <FiSun className="theme-toggle-icon sun" />
              )}
            </div>
          </div>
        </header>
        <main className="content">
          <h2 className="title center-title">Terms & Conditions</h2>
          <ol className="terms-list centered-list">
            <li>User must login to start using the app.</li>
            <li>
              Please cooperate what you are required to perform. If you are new{' '}
              <span className="link" onClick={() => navigate('/signup')}>
                <u>
                  <b>Get Started </b>
                </u>
              </span>
              here.
            </li>
            <li>We apologize in advance if you face any inconvenience, as this is beta version.</li>
            <li>Your personal information will be fully secured and end-to-end encrypted.</li>
            <li>AI can make mistakes, please double check before reaching any final conclusion.</li>
          </ol>
          <div className="terms-warning">
            By using our product, you hereby accept our above mentioned
            <span className="highlight"> Terms & Conditions</span>.
          </div>
          <button className="login-button bottom-login" onClick={handleAccept}>
            Continue to Login
          </button>
        </main>
        <div className="help-button" onClick={() => setShowHelp(true)}>
          <FiHelpCircle size={18} />
          <span>Need Help?</span>
        </div>
      </div>
      {showHelp && (
        <div className="help-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <div className="help-modal-header">
              <h3>Welcome to ReMIND AI</h3>
              <button className="close-help" onClick={() => setShowHelp(false)}>
                ×
              </button>
            </div>
            <div className="help-modal-content">
              <p>
                ReMIND is an AI-powered memory reconstruction and journaling platform designed to
                help users preserve, organize, and reflect on meaningful experiences through
                intelligent AI assistance.
              </p>
              <h4>Getting Started</h4>
              <ul>
                <li>Create an account and sign in securely.</li>
                <li>
                  Share your thoughts, memories, conversations, voice notes, images, or experiences.
                </li>
                <li>
                  Allow ReMIND AI to help reconstruct memories and generate meaningful insights.
                </li>
                <li>
                  Review your memory timeline, conversations, and AI-generated reflections anytime.
                </li>
                <li>
                  Use the platform responsibly and verify important information before making
                  decisions.
                </li>
              </ul>
              <h4>How to use ReMIND AI?</h4>
              <ul>
                <li>
                  <strong>Supported Images:</strong> You can upload photographs in{' '}
                  <strong>JPG, JPEG, PNG, or WebP</strong> format. ReMIND analyzes visual cues,
                  people, clothing, and surroundings to help reconstruct forgotten moments.
                </li>
                <li>
                  <strong>Supported Audio & Voice Notes:</strong> You can upload voice notes and
                  audio clips in <strong>MP3, WAV, or OGG</strong> format (including standard
                  WhatsApp voice notes). The AI transcribes your words and detects emotional tones.
                </li>
                <li>
                  <strong>Document Uploads:</strong> Please note that{' '}
                  <strong>PDF documents are not supported yet</strong>.
                </li>
                <li>
                  <strong>Interactive Memory Prompts:</strong> Combine your uploads with specific
                  questions (e.g., <em>"What do you see in this photo?"</em> or{' '}
                  <em>"Remind me where this was taken"</em>) to guide memory reconstruction.
                </li>
                <li>
                  <strong>Personalized Context:</strong> Set up your patient profile with familiar
                  places, loved ones, and routines to help ReMIND provide accurate, context-aware
                  memory assistance.
                </li>
                <li>
                  <strong>Memory Timelines:</strong> Access your past conversations, media previews,
                  and AI-generated reflections anytime from your dashboard.
                </li>
              </ul>
              <h4>Need Assistance?</h4>
              <p>
                If you encounter any issues, have questions, or would like to provide feedback,
                please contact our support team.
              </p>
              <div className="support-email">xremind.3@gmail.com</div>
              <p className="help-footer-text">Thank you for choosing ReMIND AI.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default TermsConditions;
