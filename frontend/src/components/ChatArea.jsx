import { useEffect, useRef } from 'react';
import {
  FiClock,
  FiHeart,
  FiImage,
  FiLayers,
  FiMic,
  FiShield,
  FiUsers
} from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import logoDark from '../assets/images/logo-dark.png';
import logoLight from '../assets/images/logo-light.png';
import '../styles/ChatArea.css';

const ChatArea = ({ activeChat, isThinking }) => {
  const { theme } = useTheme();
  const logo = theme === 'dark' ? logoDark : logoLight;
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [activeChat?.messages, isThinking]);

  const handleFileDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/files/${fileId}/download`,
        {
          method: 'GET',
          headers: {
            ...(token && {
              Authorization: `Bearer ${token}`
            })
          }
        }
      );

      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error('Download failed');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);

      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('File download failed.');
    }
  };

  const hasMessages = Boolean(
    activeChat &&
      Array.isArray(activeChat.messages) &&
      activeChat.messages.length > 0
  );

  if (!hasMessages && !isThinking) {
    return (
      <div className="chat-area empty-chat-view">
        <div className="chat-center empty-state-container">
          <img src={logo} alt="ReMIND Logo" className="chat-logo" />
          <h2 className="chat-title-center">What memory would you like to explore?</h2>
          <p className="chat-welcome-subtitle">
            ReMIND is your personal memory companion. Share an old photograph, record a voice note, or describe a moment to begin reconstructing your memories.
          </p>

          <div className="suggestion-grid">
            <div className="suggestion-card">
              <div className="suggestion-icon icon-users">
                <FiUsers />
              </div>
              <div className="suggestion-text">
                <span className="suggestion-title">Recall Family Moments</span>
                <span className="suggestion-desc">Discuss past family gatherings, birthdays, or celebrations</span>
              </div>
            </div>

            <div className="suggestion-card">
              <div className="suggestion-icon icon-image">
                <FiImage />
              </div>
              <div className="suggestion-text">
                <span className="suggestion-title">Explore Photographs</span>
                <span className="suggestion-desc">Attach a memory photo to enhance details and identify familiar faces</span>
              </div>
            </div>

            <div className="suggestion-card">
              <div className="suggestion-icon icon-mic">
                <FiMic />
              </div>
              <div className="suggestion-text">
                <span className="suggestion-title">Voice Memories</span>
                <span className="suggestion-desc">Speak or upload an audio note to preserve spoken stories</span>
              </div>
            </div>

            <div className="suggestion-card">
              <div className="suggestion-icon icon-clock">
                <FiClock />
              </div>
              <div className="suggestion-text">
                <span className="suggestion-title">Review Saved Memories</span>
                <span className="suggestion-desc">Revisit and connect details preserved across past conversations</span>
              </div>
            </div>
          </div>

          <div className="empty-features-hint">
            <span className="hint-pill">
              <FiLayers className="hint-icon" /> Multimodal (Text, Photos & Audio)
            </span>
            <span className="hint-dot">•</span>
            <span className="hint-pill">
              <FiShield className="hint-icon" /> Private & Secure
            </span>
            <span className="hint-dot">•</span>
            <span className="hint-pill">
              <FiHeart className="hint-icon" /> Empathetic Recall
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      <div className="messages-container">
        {activeChat.messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`message-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}
          >
            {msg.type === 'text' && (
              <div className="message-text">
                {msg.content}
                {msg.role === 'user' && msg.enhancedImage && (
                  <div className="memory-image" style={{ marginTop: '8px' }}>
                    <img
                      src={msg.enhancedImage}
                      alt="Uploaded preview"
                      className="memory-preview-image"
                      onError={(e) => {
                        if (e.target.parentElement) {
                          e.target.parentElement.style.display = 'none';
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {msg.type === 'memory' && (
              <div className="memory-card">
                {msg.content && msg.content.trim() && (
                  <div className="memory-response">
                    {msg.content
                      .replace(/\[Image Uploaded\]/gi, '')
                      .replace(/\[Audio Uploaded\]/gi, '')
                      .trim()}
                  </div>
                )}

                {msg.role === 'user' && msg.enhancedImage && (
                  <div className="memory-image">
                    <img
                      src={msg.enhancedImage}
                      alt="Uploaded preview"
                      className="memory-preview-image"
                      onError={(e) => {
                        if (e.target.parentElement) {
                          e.target.parentElement.style.display = 'none';
                        }
                      }}
                    />
                  </div>
                )}

                {msg.generatedAudio && (
                  <div className="memory-audio">
                    <audio controls src={msg.generatedAudio} />
                  </div>
                )}

                {msg.transcript && (
                  <div className="memory-section">
                    <h4>Transcript</h4>
                    <p>{msg.transcript}</p>
                  </div>
                )}

                {msg.caption && (
                  <div className="memory-section">
                    <h4>Image Understanding</h4>
                    <p>{msg.caption}</p>
                  </div>
                )}

                {msg.emotion && (
                  <div className="memory-section">
                    <h4>Detected Emotion</h4>
                    <p>{msg.emotion}</p>
                  </div>
                )}

                {msg.tones?.length > 0 && (
                  <div className="memory-section">
                    <h4>Detected Tones</h4>

                    <div className="tones-container">
                      {msg.tones.map((tone, index) => (
                        <span key={index} className="tone-badge">
                          {tone}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {msg.retrievedContext?.length > 0 && (
                  <div className="memory-section">
                    <h4>Retrieved Memories</h4>

                    <ul className="retrieved-context-list">
                      {msg.retrievedContext.map((memory, index) => (
                        <li key={index}>{memory}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {msg.type === 'file' && (
              <div className="file-message">
                {(msg.fileType === 'image' || msg.fileType === 'audio') && (
                  <button
                    className="file-open"
                    onClick={() => handleFileDownload(msg.fileId, msg.fileName)}
                  >
                    {msg.fileType === 'image' ? 'View Image' : 'Play Audio'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="thinking-indicator">ReMIND is understanding the context...</div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
export default ChatArea;
