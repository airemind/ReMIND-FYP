import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiX
} from 'react-icons/fi';

import '../styles/Sidebar.css';

const MAX_PINS = 3;
const PINS_KEY = 'remind_pinned_chats';

const loadPins = () => {
  try {
    return JSON.parse(localStorage.getItem(PINS_KEY)) || [];
  } catch {
    return [];
  }
};

const savePins = (ids) => {
  localStorage.setItem(PINS_KEY, JSON.stringify(ids));
};

/* Portal Dropdown */

const DropdownPortal = ({ anchorRect, onClose, children }) => {
  const ref = useRef(null);

  // Position below the anchor button, aligned to its right edge
  const style = {
    position: 'fixed',
    top: anchorRect.bottom + 4,
    left: anchorRect.right - 148, // 148 = min-width of dropdown
    zIndex: 9999
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    // Use capture so we catch the event before anything else
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [onClose]);

  // Close on scroll anywhere
  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener('scroll', handler, true);
    return () => window.removeEventListener('scroll', handler, true);
  }, [onClose]);

  return createPortal(
    <div ref={ref} className="chat-dropdown" style={style}>
      {children}
    </div>,
    document.body
  );
};

/* Main Sidebar */

const Sidebar = ({
  chats = [],
  activeChatId,
  setActiveChatId,
  createNewChat,
  deleteChat,
  renameChat,
  searchTerm,
  setSearchTerm,
  isCollapsed,
  toggleSidebar,

  // Mobile
  isMobileOpen = false,
  closeMobileSidebar = () => {},
  toggleMobileSidebar = () => {}
}) => {
  const [editingId, setEditingId] = useState(null);
  const [tempTitle, setTempTitle] = useState('');
  const [chatToDelete, setChatToDelete] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null); // DOMRect of the ⋮ button
  const [pinnedIds, setPinnedIds] = useState(loadPins);

  const isMobile = window.innerWidth <= 768;

  /* Filtered + sorted: pinned chats on top */
  const filteredChats = useMemo(() => {
    const validChats = chats.filter((chat) => chat && typeof chat === 'object');

    const searched = !searchTerm.trim()
      ? validChats
      : validChats.filter((chat) =>
          (chat.title || '').toLowerCase().includes(searchTerm.trim().toLowerCase())
        );

    return [...searched].sort((a, b) => {
      const aPin = pinnedIds.includes(a.id);
      const bPin = pinnedIds.includes(b.id);
      if (aPin && !bPin) return -1;
      if (!aPin && bPin) return 1;
      return 0;
    });
  }, [chats, searchTerm, pinnedIds]);

  /* Open three-dot menu */
  const handleOpenMenu = (chatId, e) => {
    e.stopPropagation();
    if (openMenuId === chatId) {
      setOpenMenuId(null);
      setMenuAnchor(null);
    } else {
      // Get the button's viewport position for the portal
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuAnchor(rect);
      setOpenMenuId(chatId);
    }
  };

  const closeMenu = useCallback(() => {
    setOpenMenuId(null);
    setMenuAnchor(null);
  }, []);

  /* Pin / Unpin */
  const handleTogglePin = (chatId, e) => {
    e.stopPropagation();
    closeMenu();

    if (pinnedIds.includes(chatId)) {
      const updated = pinnedIds.filter((id) => id !== chatId);
      setPinnedIds(updated);
      savePins(updated);
    } else {
      if (pinnedIds.length >= MAX_PINS) {
        alert('Only 3 chats can be pinned. Unpin a chat to pin a new one.');
        return;
      }
      const updated = [...pinnedIds, chatId];
      setPinnedIds(updated);
      savePins(updated);
    }
  };

  /* Rename */
  const handleRename = (id) => {
    if (!tempTitle.trim()) return;
    renameChat(id, tempTitle.trim());
    setEditingId(null);
  };

  /* Chat select */
  const handleChatSelect = (chatId) => {
    setActiveChatId(chatId);
    if (isMobile) closeMobileSidebar();
  };

  const handleCreateChat = () => {
    createNewChat();
    if (isMobile) closeMobileSidebar();
  };

  /* Active menu chat (for the portal) */
  const activeMenuChat = filteredChats.find((c) => c.id === openMenuId);
  const isActiveMenuPinned = activeMenuChat ? pinnedIds.includes(activeMenuChat.id) : false;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && isMobile && (
        <div className="sidebar-mobile-overlay" onClick={closeMobileSidebar} />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Collapse toggle */}
        <div
          className="sidebar-toggle"
          onClick={() => {
            if (isMobile) toggleMobileSidebar();
            else toggleSidebar();
          }}
        >
          {isMobile ? (
            isMobileOpen ? (
              <FiX />
            ) : (
              <FiMenu />
            )
          ) : isCollapsed ? (
            <FiChevronRight />
          ) : (
            <FiChevronLeft />
          )}
        </div>

        {/* Collapsed icon-only state */}
        {isCollapsed && !isMobile ? (
          <div className="sidebar-collapsed-icons">
            <div className="sidebar-icon tooltip-wrapper" onClick={handleCreateChat}>
              <FiPlus />
            </div>
          </div>
        ) : (
          <>
            <div className="sidebar-header">ReMIND</div>

            <div className="search-box">
              <FiSearch />
              <input
                placeholder="Search chats"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button className="new-chat-btn" onClick={handleCreateChat}>
              <FiPlus />
              <span>New Chat</span>
            </button>

            {/* Chat list — overflow-y: auto is fine; dropdown escapes via portal */}
            <div className="chat-list">
              {filteredChats.map((chat) => {
                const isPinned = pinnedIds.includes(chat.id);

                return (
                  <div
                    key={chat.id}
                    className={`chat-item ${activeChatId === chat.id ? 'active' : ''} ${
                      isPinned ? 'pinned' : ''
                    }`}
                    onClick={() => handleChatSelect(chat.id)}
                  >
                    {editingId === chat.id ? (
                      <input
                        autoFocus
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        onBlur={() => handleRename(chat.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(chat.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <span className="chat-title">
                          {isPinned && <span className="pin-badge">📌</span>}
                          {chat.title || 'New Chat'}
                        </span>

                        {/* Three-dot button — dropdown rendered via portal */}
                        <div className="chat-actions">
                          <button
                            className="chat-menu-btn"
                            onClick={(e) => handleOpenMenu(chat.id, e)}
                            title="Options"
                          >
                            <FiMoreVertical />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Portal Dropdown */}
      {openMenuId && menuAnchor && activeMenuChat && (
        <DropdownPortal anchorRect={menuAnchor} onClose={closeMenu}>
          <button
            className="chat-dropdown-item"
            onClick={(e) => handleTogglePin(activeMenuChat.id, e)}
          >
            {isActiveMenuPinned ? 'Unpin' : 'Pin Chat'}
          </button>

          <button
            className="chat-dropdown-item"
            onClick={(e) => {
              e.stopPropagation();
              closeMenu();
              setEditingId(activeMenuChat.id);
              setTempTitle(activeMenuChat.title || '');
            }}
          >
            Rename
          </button>

          <button
            className="chat-dropdown-item danger"
            onClick={(e) => {
              e.stopPropagation();
              closeMenu();
              setChatToDelete(activeMenuChat.id);
            }}
          >
            Delete
          </button>
        </DropdownPortal>
      )}

      {/* Delete Confirmation Modal */}
      {chatToDelete && (
        <div className="delete-modal-overlay" onClick={() => setChatToDelete(null)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h3>Delete Chat</h3>
            </div>

            <div className="delete-modal-body">
              <p>Are you sure you want to delete this chat?</p>
              <span className="delete-warning">This action cannot be undone.</span>
            </div>

            <div className="delete-modal-actions">
              <button className="cancel-btn" onClick={() => setChatToDelete(null)}>
                Cancel
              </button>

              <button
                className="confirm-delete-btn"
                onClick={() => {
                  deleteChat(chatToDelete);
                  if (pinnedIds.includes(chatToDelete)) {
                    const updated = pinnedIds.filter((id) => id !== chatToDelete);
                    setPinnedIds(updated);
                    savePins(updated);
                  }
                  setChatToDelete(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
