import { useState, useRef } from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ onSendMessage, disabled, darkMode }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end space-x-3 bg-transparent"
    >
      <div className="flex-1 bg-transparent">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={disabled}
          className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[44px] max-h-32 disabled:opacity-50 disabled:cursor-not-allowed
            ${
              darkMode
                ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          rows={1}
        />
      </div>
      <button
        type="submit"
        disabled={!input.trim() || disabled}
        className={`p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
          ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}
      >
        <Send size={20} />
      </button>
    </form>
  );
};

export default ChatInput;