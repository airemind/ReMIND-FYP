import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatArea from '../components/ChatArea';
import MessageInput from '../components/MessageInput';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import { createChat, deleteChatById, getChats, renameChatById } from '../middleware/chatMiddleware';
import { getMessages } from '../middleware/messageMiddleware';
import { processMemory } from '../middleware/memoryMiddleware';
import { enhanceImage } from '../middleware/imageEnhancementMiddleware';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const routeChatId = Number(location.pathname.split('/')[3]) || null;
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chatsLoaded, setChatsLoaded] = useState(false);
  const [error, setError] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  /* -----------------------------
      SIDEBAR
  ------------------------------ */

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  /* -----------------------------
      HELPERS
  ------------------------------ */

  const normalizeChat = (chat) => ({
    ...chat,
    id: chat?.id ?? chat?.chat_id ?? chat?._id,
    messages: Array.isArray(chat?.messages) ? chat.messages : []
  });

  const normalizeMessage = (message) => ({
    ...message,

    id: message?.id ?? message?.message_id ?? message?._id,

    content: message?.content ?? '',

    sender: message?.sender ?? 'user',

    role: message?.sender ?? 'user',

    type: message?.message_type ?? 'text',

    caption: message?.caption ?? '',

    enhancedImage: message?.enhanced_image ?? '',

    generatedAudio: message?.generated_audio ?? '',

    transcript: message?.transcript ?? '',

    emotion: message?.emotion ?? '',

    tones: message?.tones ?? [],

    retrievedContext: message?.retrieved_context ?? [],

    isEnhanced: !!message?.enhanced_image,

    enhancedDownloadUrl: message?.enhanced_image ?? null
  });

  /* -----------------------------
      LOAD CHATS
  ------------------------------ */

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getChats();

      const normalizedChats = (Array.isArray(response) ? response : []).map(normalizeChat);

      setChats(normalizedChats);
      setChatsLoaded(true);

      if (!routeChatId && normalizedChats.length > 0) {
        const firstChat = normalizedChats[0];

        setActiveChatId(firstChat.id);

        navigate(
          `/dashboard/chat/${firstChat.id}?name=${encodeURIComponent(firstChat.title ?? 'Chat')}`
        );
      }
    } catch (error) {
      console.error(error);

      setError('Failed to load chats.');
    } finally {
      setLoading(false);
    }
  }, [navigate, routeChatId]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  /* -----------------------------
      ROUTE CHANGE
  ------------------------------ */

  useEffect(() => {
    if (routeChatId && routeChatId !== activeChatId) {
      setActiveChatId(routeChatId);
    }
  }, [routeChatId, activeChatId]);

  /* -----------------------------
      LOAD MESSAGES
  ------------------------------ */

  useEffect(() => {
    const loadMessages = async () => {
      if (!chatsLoaded || !activeChatId) {
        return;
      }

      try {
        const response = await getMessages(activeChatId);

        const messages = (Array.isArray(response) ? response : []).map(normalizeMessage);

        setChats((prev) =>
          prev.map((chat) =>
            Number(chat.id) === Number(activeChatId)
              ? {
                  ...chat,
                  messages
                }
              : chat
          )
        );
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
  }, [activeChatId, chatsLoaded]);

  /* -----------------------------
      CREATE CHAT
  ------------------------------ */

  const createNewChat = async () => {
    try {
      const chat = await createChat();

      if (!chat) {
        throw new Error('Invalid chat response.');
      }

      const normalized = normalizeChat(chat);

      setChats((prev) => [normalized, ...prev]);

      setActiveChatId(normalized.id);

      navigate(
        `/dashboard/chat/${normalized.id}?name=${encodeURIComponent(
          normalized.title ?? 'New Chat'
        )}`
      );
    } catch (error) {
      console.error(error);

      alert('Failed to create chat.');
    }
  };

  /* -----------------------------
      DELETE CHAT
  ------------------------------ */

  const deleteChat = async (id) => {
    try {
      await deleteChatById(id);

      const updatedChats = chats.filter((chat) => chat.id !== id);

      setChats(updatedChats);

      if (updatedChats.length === 0) {
        setActiveChatId(null);

        navigate('/dashboard');

        return;
      }

      const firstChat = updatedChats[0];

      setActiveChatId(firstChat.id);

      navigate(
        `/dashboard/chat/${firstChat.id}?name=${encodeURIComponent(firstChat.title ?? 'Chat')}`
      );
    } catch (error) {
      console.error(error);

      alert('Failed to delete chat.');
    }
  };

  /* -----------------------------
      RENAME CHAT
  ------------------------------ */

  const renameChat = async (id, newTitle) => {
    try {
      const response = await renameChatById(id, {
        title: newTitle
      });

      if (!response?.success) {
        return;
      }

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === id
            ? {
                ...chat,
                title: newTitle
              }
            : chat
        )
      );
    } catch (error) {
      console.error(error);

      alert('Failed to rename chat.');
    }
  };
  /* -----------------------------
      SEND MESSAGE
  ------------------------------ */

  const sendMessage = async (payload) => {
    try {
      setIsThinking(true);

      const imageAttachment = payload.files?.find((file) => file.fileType === 'image');

      const audioAttachment = payload.files?.find((file) => file.fileType === 'audio');

      /* USER MESSAGE */

      const userMessage = {
        id: Date.now(),
        role: 'user',
        type: payload.files?.length > 0 ? 'memory' : 'text',

        content: payload.text || ''
      };

      /* IMAGE */

      if (imageAttachment) {
        const previewUrl = URL.createObjectURL(imageAttachment.file);

        userMessage.enhancedImage = previewUrl;

        userMessage.originalImageUrl = previewUrl;

        userMessage.originalImageFile = imageAttachment.file;

        userMessage.isEnhancing = false;

        userMessage.isEnhanced = false;

        userMessage.enhancedDownloadUrl = null;
      }

      /* AUDIO */

      if (audioAttachment) {
        userMessage.generatedAudio = URL.createObjectURL(audioAttachment.file);
      }

      /* SHOW USER MESSAGE */

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...(chat.messages ?? []), userMessage]
              }
            : chat
        )
      );

      /* PROCESS MEMORY */

      const response = await processMemory({
        userId: user?.id,
        userPrompt: payload.text || '',
        chatId: activeChatId,
        imageFile: imageAttachment?.file ?? null,
        audioFile: audioAttachment?.file ?? null
      });

      /* ASSISTANT MESSAGE */

      const assistantMessage = {
        id: Date.now() + 1,

        role: 'assistant',

        type: 'memory',

        content:
          response?.final_memory_response ||
          response?.text_ai?.response ||
          'Memory reconstructed successfully.',

        /* IMAGE */

        caption: response?.image_ai?.caption || '',

        enhancedImage: response?.image_ai?.enhanced_url || response?.image_ai?.original_url || '',

        originalImageUrl: response?.image_ai?.original_url || '',

        originalImageFile: imageAttachment?.file ?? null,

        isEnhancing: false,

        isEnhanced: false,

        enhancedDownloadUrl: null,

        /* AUDIO */

        transcript: response?.voice_ai?.transcript || '',

        emotion: response?.voice_ai?.emotion || '',

        tones: response?.voice_ai?.tones || [],

        generatedAudio: response?.voice_ai?.generated_audio_url || '',

        /* MEMORY */

        retrievedContext:
          response?.text_ai?.retrieved_context ||
          response?.voice_ai?.retrieved_context ||
          response?.image_ai?.retrieved_context ||
          []
      };

      /* SHOW AI MESSAGE */

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...(chat.messages ?? []), assistantMessage]
              }
            : chat
        )
      );
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.error ||
          error?.response?.data?.detail ||
          error?.message ||
          'Memory reconstruction failed.'
      );
    } finally {
      setIsThinking(false);
    }
  };

  /* -----------------------------
      ENHANCE IMAGE
  ------------------------------ */

  const handleEnhanceImage = async (messageId) => {
    try {
      /* SHOW LOADING */

      setChats((prevChats) =>
        prevChats.map((chat) => ({
          ...chat,
          messages: chat.messages.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  isEnhancing: true
                }
              : message
          )
        }))
      );

      /* FIND CURRENT CHAT */

      const currentChat = chats.find((chat) => Number(chat.id) === Number(activeChatId));

      if (!currentChat) {
        throw new Error('Chat not found.');
      }

      /* FIND TARGET MESSAGE */

      const targetMessage = currentChat.messages.find((message) => message.id === messageId);

      if (!targetMessage || !targetMessage.originalImageFile) {
        throw new Error('Original image not found.');
      }

      /* CALL IMAGE API */

      const response = await enhanceImage(targetMessage.originalImageFile);

      /* UPDATE MESSAGE */

      setChats((prevChats) =>
        prevChats.map((chat) => ({
          ...chat,
          messages: chat.messages.map((message) => {
            if (message.id !== messageId) {
              return message;
            }

            return {
              ...message,

              isEnhancing: false,

              isEnhanced: true,

              enhancedImage:
                response?.enhanced_url || response?.enhanced_image || message.enhancedImage,

              enhancedDownloadUrl: response?.enhanced_url || response?.enhanced_image || null
            };
          })
        }))
      );
    } catch (error) {
      console.error(error);

      /* RESET LOADING */

      setChats((prevChats) =>
        prevChats.map((chat) => ({
          ...chat,
          messages: chat.messages.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  isEnhancing: false
                }
              : message
          )
        }))
      );

      alert('Image enhancement failed.');
    }
  };

  /* -----------------------------
      SELECT CHAT
  ------------------------------ */

  const handleChatSelect = (chatId) => {
    if (chatId !== activeChatId) {
      setActiveChatId(chatId);
    }

    const selectedChat = chats.find((chat) => chat.id === chatId);

    navigate(`/dashboard/chat/${chatId}?name=${encodeURIComponent(selectedChat?.title || 'Chat')}`);
  };

  /* CURRENT ACTIVE CHAT */

  const activeChat = chats.find((chat) => Number(chat.id) === Number(activeChatId));

  /* LOADING */

  if (loading) {
    return <div className="dashboard-loading">Loading chats...</div>;
  }

  /* ERROR */

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  /* -----------------------------
      MAIN UI
  ------------------------------ */

  return (
    <div className="dashboard">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        setActiveChatId={handleChatSelect}
        createNewChat={createNewChat}
        deleteChat={deleteChat}
        renameChat={renameChat}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        closeMobileSidebar={() => setIsMobileSidebarOpen(false)}
        toggleMobileSidebar={toggleMobileSidebar}
      />

      <div className="main-area">
        <Topbar toggleMobileSidebar={toggleMobileSidebar} />

        <ChatArea
          activeChat={activeChat}
          isThinking={isThinking}
          handleEnhanceImage={handleEnhanceImage}
        />

        <MessageInput sendMessage={sendMessage} activeChat={activeChat} />

        <div className="dashboard-disclaimer">
          ReMIND can make mistakes. Verify important information and uploaded content before relying
          on AI-generated responses.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
