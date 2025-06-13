import { useState, useCallback, useRef, useEffect } from 'react';
// import { speakText } from '../services/TextToSpeech';
import { getAuth } from 'firebase/auth';

const useChat = ({ enableTTS = true, isComplex = false } = {}) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionRef, setSessionRef] = useState(null);
  const [videoSuggestions, setVideoSuggestions] = useState([]);

  const sendMessage = useCallback((content) => {
  if (!content.trim()) return;

  const userMessage = {
    id: Date.now(),
    content: content.trim(),
    sender: 'user',
    timestamp: new Date().toISOString()
  };

  setIsLoading(true);
  setError(null);

  setMessages(prev => {
    const nextMessages = [...prev, userMessage];
    const updatedHistory = nextMessages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    actuallySendRequest(updatedHistory);
    return nextMessages;
  });
});

  const loadSession = useCallback((sessionData) => {
    if (sessionData.history) {
      const convertedMessages = sessionData.history.map((msg, index) => ({
        id: Date.now() + index,
        content: msg.parts[0].text,
        sender: msg.role === 'user' ? 'user' : 'ai',
        timestamp: new Date().toISOString(),
        videoSuggestions: msg.videos || [] // assuming saved history has it
      }));
      setMessages(convertedMessages);
      setSessionRef(sessionData.sessionRef);
    }
  }, []);

  const actuallySendRequest = useCallback(async (updatedHistory) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    const idToken = await currentUser.getIdToken();

    const response = await fetch('https://chatbot-backend-wp2r.onrender.com/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({
        prompt: updatedHistory.at(-1).parts[0].text,
        isComplex,
        history: updatedHistory,
        sessionRef
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Chat failed');

    const aiMessage = {
      id: Date.now() + 1,
      content: data.text,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      videoSuggestions: data.videos || []
    };

    setMessages(prev => [...prev, aiMessage]);

    if (data.sessionRef && !sessionRef) {
      setSessionRef(data.sessionRef);
    }

    if (enableTTS && data.text) {
      const audio = new Audio('response.wav');
      audio.play();
    }

  } catch (err) {
    setError(err.message || 'Failed to send message');
    console.error('Chat error:', err);
  } finally {
    setIsLoading(false);
  }
}, [enableTTS, isComplex, sessionRef]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setSessionRef(null);
  }, [enableTTS, isComplex, sessionRef]);

  return {
    messages,
    isLoading,
    error,
    sessionRef,
    videoSuggestions,
    sendMessage,
    loadSession,
    clearChat,
    clearError: () => setError(null)
  };
};

export default useChat;