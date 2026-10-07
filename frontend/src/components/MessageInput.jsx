import { useEffect, useRef, useState } from 'react';
import {
  FiImage,
  FiMic,
  FiMusic,
  FiPaperclip,
  FiSend,
  FiX
} from 'react-icons/fi';

import '../styles/MessageInput.css';

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav']
};

const MessageInput = ({ sendMessage, activeChat }) => {
  const hasActiveChat = Boolean(activeChat);

  const [text, setText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);

  const menuRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);

  /* ---------------- Speech Recognition ---------------- */

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText((prev) => `${prev} ${transcript}`.trim());
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, []);

  /* ---------------- Auto Textarea Height ---------------- */

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = 'auto';

    const maxHeight = 120;
    const scrollHeight = textarea.scrollHeight;

    if (scrollHeight <= maxHeight) {
      textarea.style.height = `${scrollHeight}px`;
      textarea.style.overflowY = 'hidden';
    } else {
      textarea.style.height = `${maxHeight}px`;
      textarea.style.overflowY = 'auto';
    }
  }, [text]);

  /* ---------------- Close Attachment Menu ---------------- */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () =>
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
  }, []);

  /* ---------------- Microphone ---------------- */

  const handleMicClick = () => {
    if (!hasActiveChat) return;

    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  /* ---------------- File Upload ---------------- */

  const handleFileChange = (event, type) => {
    if (!hasActiveChat) return;

    const file = event.target.files[0];

    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert(`File size exceeds ${MAX_FILE_SIZE_MB}MB.`);
      event.target.value = '';
      return;
    }

    if (!ALLOWED_TYPES[type].includes(file.type)) {
      alert(`Invalid ${type} file.`);
      event.target.value = '';
      return;
    }

    setPendingFiles((prev) => [
      ...prev,
      {
        id: Date.now(),
        file,
        fileName: file.name,
        fileType: type
      }
    ]);

    event.target.value = '';
    setShowMenu(false);
  };

  /* ---------------- Send ---------------- */

  const handleSend = () => {
    if (!hasActiveChat) return;

    if (!text.trim() && pendingFiles.length === 0) return;

    sendMessage({
      text: text.trim(),
      files: pendingFiles
    });

    setText('');
    setPendingFiles([]);
  };

  if (!activeChat) {
    return null;
  }

  return (
    <div className="message-input-container">
      <div className="message-input">

        {!hasActiveChat && (
          <div className="disabled-chat-warning">
            Please create a new chat to start messaging.
          </div>
        )}

        {pendingFiles.length > 0 && hasActiveChat && (
          <div className="pending-files">
            {pendingFiles.map((fileItem) => (
              <div
                className="pending-file"
                key={fileItem.id}
              >
                <div className="pending-file-left">

                  {fileItem.fileType === 'image' && <FiImage />}

                  {fileItem.fileType === 'audio' && <FiMusic />}

                  <span className="pending-file-name">
                    {fileItem.fileName}
                  </span>

                </div>

                <FiX
                  className="remove-file"
                  onClick={() =>
                    setPendingFiles((prev) =>
                      prev.filter(
                        (f) => f.id !== fileItem.id
                      )
                    )
                  }
                />
              </div>
            ))}
          </div>
        )}

        <div className="input-row">

          <div
            className="attachment-wrapper"
            ref={menuRef}
          >
            <FiPaperclip
              className={`attachment-icon ${
                !hasActiveChat ? 'disabled-icon' : ''
              }`}
              onClick={() =>
                hasActiveChat &&
                setShowMenu((prev) => !prev)
              }
              title={
                !hasActiveChat
                  ? 'Create a chat to attach files'
                  : 'Attach files'
              }
            />

            {showMenu && hasActiveChat && (
              <div className="attachment-menu">

                <div
                  className="attachment-item"
                  onClick={() =>
                    imageInputRef.current.click()
                  }
                >
                  <FiImage className="attachment-item-icon" />

                  <div>
                    <div>Image</div>
                    <small>
                      JPG, PNG • Max {MAX_FILE_SIZE_MB}MB
                    </small>
                  </div>
                </div>

                <div
                  className="attachment-item"
                  onClick={() =>
                    audioInputRef.current.click()
                  }
                >
                  <FiMusic className="attachment-item-icon" />

                  <div>
                    <div>Audio</div>
                    <small>
                      MP3, WAV • Max {MAX_FILE_SIZE_MB}MB
                    </small>
                  </div>
                </div>

              </div>
            )}

            <input
              ref={imageInputRef}
              type="file"
              hidden
              accept=".jpg,.jpeg,.png"
              onChange={(e) =>
                handleFileChange(e, 'image')
              }
            />

            <input
              ref={audioInputRef}
              type="file"
              hidden
              accept=".mp3,.wav"
              onChange={(e) =>
                handleFileChange(e, 'audio')
              }
            />
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            rows={1}
            className="auto-textarea"
            disabled={!hasActiveChat}
            placeholder={
              hasActiveChat
                ? 'Message ReMIND...'
                : 'Create a new chat to start typing...'
            }
            onChange={(e) =>
              setText(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <button
            className={`mic-btn ${
              isRecording ? 'recording' : ''
            }`}
            onClick={handleMicClick}
            disabled={
              !hasActiveChat || !speechSupported
            }
            title={
              !speechSupported
                ? 'Voice recognition unsupported in this browser'
                : ''
            }
          >
            <FiMic />
          </button>

          <button
            className="send-btn"
            onClick={handleSend}
            disabled={
              !hasActiveChat &&
              (!text.trim() &&
                pendingFiles.length === 0)
            }
            title={
              !hasActiveChat
                ? 'Create a chat first'
                : 'Send Message'
            }
          >
            <FiSend />
          </button>

        </div>
      </div>
    </div>
  );
};

export default MessageInput;
