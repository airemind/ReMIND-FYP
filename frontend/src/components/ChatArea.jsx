import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import logoDark from '../assets/images/logo-dark.png';
import logoLight from '../assets/images/logo-light.png';
import '../styles/ChatArea.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const ChatArea = ({ activeChat, isThinking, handleEnhanceImage }) => {
  const { theme } = useTheme();
  const logo = theme === 'dark' ? logoDark : logoLight;
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [activeChat?.messages, isThinking]);

  /* file download*/

  const handleFileDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/files/${fileId}/download`, {
        method: 'GET',
        headers: {
          ...(token && {
            Authorization: `Bearer ${token}`
          })
        }
      });

      /* 401 */

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

  /* empty chat */

  if (!activeChat && !isThinking) {
    return (
      <div className="chat-area">
        <div className="chat-center">
          <img src={logo} alt="ReMIND Logo" className="chat-logo" />
          <h2>Hi! I am ReMIND, How can I help You?</h2>
          <p>
            ReMIND helps you preserve memories, recall important moments, manage conversations, and
            stay connected through intelligent AI assistance via text, images, and audio. Start a
            new chat.
          </p>
        </div>
      </div>
    );
  }

  /* main chat */

  return (
    <div className="chat-area">
      <div className="messages-container">
        {activeChat.messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`message-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}
          >
            {/* text */}

            {msg.type === 'text' && <div className="message-text">{msg.content}</div>}

            {/* memory */}

            {msg.type === 'memory' && (
              <div className="memory-card">
                {/* RESPONSE */}

                {msg.content && <div className="memory-response">{msg.content}</div>}

                {/* IMAGE */}

                {msg.enhancedImage && (
                  <div className="memory-image">
                    <img src={msg.enhancedImage} alt="Memory" className="memory-preview-image" />

                    {/* IMAGE ACTIONS */}

                    {msg.role === 'assistant' && (
                      <div className="image-actions">
                        {/* ENHANCE */}

                        {!msg.isEnhanced && (
                          <button
                            className="image-action-btn"
                            disabled={msg.isEnhancing}
                            title="Enhance image quality"
                            onClick={() => handleEnhanceImage(msg.id)}
                          >
                            {msg.isEnhancing ? 'Enhancing...' : 'Enhance Image'}
                          </button>
                        )}

                        {/* DOWNLOAD ENHANCED */}

                        {msg.isEnhanced && msg.enhancedDownloadUrl && (
                          <a
                            href={msg.enhancedDownloadUrl}
                            download="enhanced-image"
                            className="image-action-btn"
                          >
                            Download Enhanced
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* AUDIO */}

                {msg.generatedAudio && (
                  <div className="memory-audio">
                    <audio controls src={msg.generatedAudio} />
                  </div>
                )}

                {/* TRANSCRIPT */}

                {msg.transcript && (
                  <div className="memory-section">
                    <h4>Transcript</h4>
                    <p>{msg.transcript}</p>
                  </div>
                )}

                {/* IMAGE UNDERSTANDING */}

                {msg.caption && (
                  <div className="memory-section">
                    <h4>Image Understanding</h4>
                    <p>{msg.caption}</p>
                  </div>
                )}

                {/* EMOTION */}

                {msg.emotion && (
                  <div className="memory-section">
                    <h4>Detected Emotion</h4>
                    <p>{msg.emotion}</p>
                  </div>
                )}

                {/* TONES */}

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

                {/* CONTEXT */}

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

            {/* FILE */}

            {msg.type === 'file' && (
              <div className="file-message">
                {/* IMAGE */}

                {msg.fileType === 'image' && (
                  <button
                    className="file-open"
                    onClick={() => handleFileDownload(msg.fileId, msg.fileName)}
                  >
                    View Image
                  </button>
                )}

                {/* AUDIO */}

                {msg.fileType === 'audio' && (
                  <button
                    className="file-open"
                    onClick={() => handleFileDownload(msg.fileId, msg.fileName)}
                  >
                    Play Audio
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* THINKING */}

        {isThinking && (
          <div className="thinking-indicator">ReMIND is understanding the context...</div>
        )}
        <div ref={messagesEndRef}></div>
      </div>
    </div>
  );
};

export default ChatArea;
