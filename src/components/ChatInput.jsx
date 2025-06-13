import { useState, useRef } from 'react';
import { Send, Mic, MicOff, XCircle } from 'lucide-react';

const ChatInput = ({ onSendMessage, disabled, darkMode }) => {
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(false);
  const textareaRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
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

  const stopRecording = async () => {
    setRecording(false);
    mediaRecorderRef.current?.stop();
  };

  const handleVoiceToggle = async () => {
    if (recording) {
      stopRecording();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        try {
            const res = await fetch('https://chatbot-backend-wp2r.onrender.com/api/talk', {
              method: 'POST',
              headers: {
                'Content-Type': 'audio/webm',
              },
              body: audioBlob,
            });

            const data = await res.json();
            if (data?.prompt) {
              onSendMessage(data.prompt);
            } else {
              alert('No transcription result.');
            }
          } catch (err) {
            console.error('Voice upload failed:', err);
            alert('Failed to process audio.');
          }
        };

        recorder.start();
        setRecording(true);
      } catch (err) {
        console.error('Microphone access denied:', err);
        alert('Microphone access denied.');
      }
    };

    return (
      <>
        {/* Recording Modal */}
        {recording && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div
              className={`p-6 rounded-xl shadow-xl flex flex-col items-center gap-4 animate-fade-in
              ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
            >
              <div className="flex items-center gap-3">
                <Mic className="text-red-500 animate-pulse" size={32} />
                <span className="text-lg font-medium">Recording in progress...</span>
              </div>
              <button
                onClick={stopRecording}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Stop Recording
              </button>
            </div>
          </div>
        )}

        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="flex items-end space-x-2 bg-transparent">
          <div className="flex-1 bg-transparent">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={disabled}
              className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[44px] max-h-32 disabled:opacity-50 disabled:cursor-not-allowed
              ${darkMode
                  ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              rows={1}
            />
          </div>

          <button
            type="button"
            onClick={handleVoiceToggle}
            disabled={disabled}
            className={`p-2 rounded-lg transition-colors ${recording
                ? 'bg-red-500 text-white animate-pulse'
                : darkMode
                  ? 'bg-gray-600 hover:bg-gray-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
          >
            {recording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className={`p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
            ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}
          >
            <Send size={20} />
          </button>
        </form>
      </>
    );
  };

  export default ChatInput;