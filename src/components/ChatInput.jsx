import { useState, useRef } from 'react';
import { Send, Mic, MicOff, Loader2, MessageSquare } from 'lucide-react';

const ChatInput = ({ onSendMessage, disabled, darkMode }) => {
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() && !disabled && !sending) {
      setSending(true);
      try {
        await onSendMessage(input.trim());
        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
      } finally {
        setSending(false);
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
        setTranscribing(true);
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

        try {
          const hfToken = import.meta.env.VITE_HF_TOKEN;

          if (!hfToken) {
            alert('Missing HuggingFace token in environment.');
            console.error('🔑 VITE_HF_TOKEN not found in env');
            setTranscribing(false);
            return;
          }

          const response = await fetch(
            'https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${hfToken}`,
                'Content-Type': 'audio/webm',
              },
              body: audioBlob,
            }
          );

          const rawText = await response.text();

          if (!response.ok) {
            console.error('❌ Whisper API Error:', rawText);
            alert('Transcription failed. Try again later.');
            setTranscribing(false);
            return;
          }

          let result;
          try {
            result = JSON.parse(rawText);
          } catch (err) {
            console.error('❌ Failed to parse Whisper response:', rawText);
            alert('Invalid transcription response.');
            setTranscribing(false);
            return;
          }

          if (!result.text) {
            console.warn('⚠️ No speech detected.');
            alert('No speech detected in the audio.');
            setTranscribing(false);
            return;
          }

          console.log('✅ Transcribed text:', result.text);
          setInput(result.text.trim());
          setTranscribing(false);

          // Auto-focus the textarea after transcription
          if (textareaRef.current) {
            textareaRef.current.focus();
          }
        } catch (err) {
          console.error('❌ Audio processing failed:', err);
          alert('Audio processing error.');
          setTranscribing(false);
        }
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error('❌ Microphone access error:', err);
      alert('Please allow microphone access.');
    }
  };

  const isInputDisabled = disabled || sending || transcribing;
  const isButtonDisabled = disabled || sending || recording || transcribing;

  return (
    <>
      {/* Recording Modal */}
      {recording && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center backdrop-blur-sm">
          <div
            className={`p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 animate-fade-in max-w-sm mx-4
              ${darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-black border border-gray-200'}`}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <Mic className="text-red-500 animate-pulse" size={40} />
                <div className="absolute -inset-2 rounded-full border-2 border-red-500 animate-ping opacity-30"></div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold">Recording...</h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Speak clearly into your microphone
                </p>
              </div>
            </div>
            <button
              onClick={stopRecording}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Stop Recording
            </button>
          </div>
        </div>
      )}

      {/* Transcribing Modal */}
      {transcribing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center backdrop-blur-sm">
          <div
            className={`p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 animate-fade-in max-w-sm mx-4
              ${darkMode ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-black border border-gray-200'}`}
          >
            <div className="flex items-center gap-4">
              <Loader2 className="text-blue-500 animate-spin" size={40} />
              <div className="text-center">
                <h3 className="text-xl font-semibold">Transcribing...</h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Converting your speech to text
                </p>
              </div>
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      {(sending || transcribing) && (
        <div className={`mb-2 px-3 py-2 rounded-lg text-sm flex items-center gap-2
          ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
          {transcribing && (
            <>
              <Loader2 size={16} className="animate-spin text-blue-500" />
              <span>Transcribing audio...</span>
            </>
          )}
        </div>
      )}

      {/* Chat Input */}
      <div className="flex items-center space-x-2 w-full bg-transparent">
        <div className="flex-1 bg-transparent relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={
              transcribing ? "Transcribing your voice..." :
                recording ? "Recording in progress..." :
                  sending ? "Sending..." :
                    "Type your message or use voice input..."
            }
            disabled={isInputDisabled}
            className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[48px] max-h-32 transition-all duration-200
              ${isInputDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${darkMode
                ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            rows={1}
          />
          {transcribing && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 size={18} className="animate-spin text-blue-500" />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleVoiceToggle}
          disabled={isButtonDisabled}
          className={`p-3 rounded-xl transition-all duration-200 relative
            ${recording
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110'
              : isButtonDisabled
                ? 'opacity-50 cursor-not-allowed'
                : darkMode
                  ? 'bg-gray-600 hover:bg-gray-500 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800 shadow-lg hover:shadow-xl hover:scale-105'
            }`}
        >
          {recording ? (
            <>
              <MicOff size={20} />
              <div className="absolute -inset-1 bottom-4 rounded-xl border-2 border-red-300 animate-pulse"></div>
            </>
          ) : (
            <Mic size={20} />
          )}
        </button>

        <button
          type="submit"
          disabled={!input.trim() || isButtonDisabled}
          onClick={() => {
            if (!input.trim() || isButtonDisabled || sending) return;

            handleSubmit(new Event('submit'));
          }}
          className={`p-3 rounded-xl transition-all duration-200 relative
    ${sending
              ? 'bg-blue-600 text-white cursor-not-allowed'
              : !input.trim() || isButtonDisabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105'
            }
    ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}
        >
          {sending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </>
  );
};

export default ChatInput;