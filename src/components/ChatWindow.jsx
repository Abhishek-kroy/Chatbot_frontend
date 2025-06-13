import { useState, useEffect, useRef } from 'react';
import { X, History, Plus, LogOut, Moon, Sun } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import useChat from '../hooks/useChat';
import { getAuth } from 'firebase/auth';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import SessionPanel from './SessionPanel';

const ChatWindow = ({darkMode,toggleDarkMode}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const messagesEndRef = useRef(null);

  const {
    messages,
    isLoading,
    error,
    sessionRef,
    sendMessage,
    loadSession,
    clearChat,
    clearError
  } = useChat();

  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  const fetchSessions = async () => {
    setIsLoadingHistory(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      const idToken = await currentUser.getIdToken();

      const response = await fetch('https://chatbot-backend-wp2r.onrender.com/api/sessions', {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch sessions');

      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleSelectSession = async (sessionRef) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      const idToken = await currentUser.getIdToken();
      const res = await fetch(`https://chatbot-backend-wp2r.onrender.com/api/sessions/${sessionRef}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load session');

      loadSession(data.session);
      setShowHistory(false);
    } catch (err) {
      console.error('Failed to load session:', err.message);
    }
  };

  const handleDeleteSession = async (sessionRef) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      const idToken = await currentUser.getIdToken();

      const response = await fetch(`https://chatbot-backend-wp2r.onrender.com/api/sessions/${sessionRef}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      console.log('Delete response:', response);

      if (response.statusText === "OK") {
        setSessions(prev => prev.filter(s => s.sessionRef !== sessionRef));
      }
    } catch (err) {
      console.error('Error deleting session:', err);
    }
  };

  const handleShowHistory = () => {
    setShowHistory(true);
    fetchSessions();
  };

  const handleNewChat = () => {
    clearChat();
    setShowHistory(false);
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar - History Panel */}
      <div className={`${showHistory ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden ${darkMode ? 'bg-gray-800 border-r border-gray-700' : 'bg-white border-r border-gray-200'}`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Chat History</h2>
            <button
              onClick={() => setShowHistory(false)}
              className={`p-1 rounded-md ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <SessionPanel
              sessions={sessions}
              onSelectSession={handleSelectSession}
              onDeleteSession={handleDeleteSession}
              isLoading={isLoadingHistory}
              darkMode={darkMode}
            />
          </div>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className={`w-full py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center space-x-2 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`p-4 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!showHistory && (
                <button
                  onClick={handleShowHistory}
                  className={`p-2 rounded-md ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                >
                  <History size={20} />
                </button>
              )}
              <h1 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Assistant</h1>
            </div>

            <div className="flex items-center space-x-3">
              {sessionRef && (
                <span className={`text-xs px-2 py-1 rounded-md ${darkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-600 bg-gray-100'}`}>
                  {sessionRef.split('T')[0]}
                </span>
              )}

              <button
                onClick={handleNewChat}
                className={`py-2 px-3 rounded-md text-sm font-medium flex items-center space-x-1 ${darkMode ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-white bg-blue-500 hover:bg-blue-600'}`}
              >
                <Plus size={16} />
                <span>New chat</span>
              </button>

              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-md ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>


        {/* Messages Area */}
        <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6">
              {/* <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${darkMode ? 'bg-gray-800 text-blue-400' : 'bg-white text-blue-500 shadow-sm'}`}> */}
                <img src="/rn.jpg" alt="AI Icon" className="w-16 h-16 rounded-full" />
              {/* </div> */}
              <h2 className={`text-xl font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>How can I help you today?</h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ask me anything and I'll provide a detailed response.</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <MessageBubble
                  key={index}
                  message={message.content}
                  videoSuggestions={message.videoSuggestions || []}
                  isUser={message.sender === 'user'}
                  timestamp={message.timestamp}
                  darkMode={darkMode}
                />
              ))}
              {isLoading && <LoadingIndicator darkMode={darkMode} />}
              <div ref={messagesEndRef} />
            </div>
          )}

          {error && (
            <div className={`max-w-3xl mx-auto p-4 ${darkMode ? 'bg-red-900/20 text-red-200' : 'bg-red-50 text-red-700'} rounded-md`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  <span className="text-sm">{error}</span>
                </div>
                <button
                  onClick={clearError}
                  className={`text-sm ${darkMode ? 'text-red-300 hover:text-white' : 'text-red-600 hover:text-red-800'}`}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className={`p-4 bg-transparent`}>
          <div className="max-w-3xl mx-auto bg-transparent">
            <ChatInput
              onSendMessage={sendMessage}
              disabled={isLoading}
              darkMode={darkMode}
            />
            <p className={`text-sm text-center mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              AI assistant may produce inaccurate information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;