import ReactMarkdown from 'react-markdown';

const MessageBubble = ({ message, videoSuggestions, isUser, timestamp, darkMode }) => {

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`mt-4 lg:max-w-md px-4 py-2 rounded-lg overflow-hidden ${isUser
            ? darkMode
              ? 'bg-blue-600 text-white'
              : 'bg-blue-500 text-white'
            : darkMode
              ? 'bg-gray-800 text-gray-200 border border-gray-700'
              : 'bg-white border border-gray-200 text-gray-900'
          }`}
      >
        <div className="overflow-y-auto break-words whitespace-pre-wrap">
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p
                  className={`text-sm ${isUser ? 'text-white' : darkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}
                >
                  {children}
                </p>
              ),
              code: ({ node, inline, className, children, ...props }) => {
                const baseCodeStyle = darkMode
                  ? 'bg-gray-900 text-gray-100'
                  : 'bg-gray-100 text-gray-800';

                if (inline) {
                  return (
                    <code
                      className={`${baseCodeStyle} px-1 py-0.5 rounded text-xs ${className || ''}`}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                return (
                  <pre
                    className={`${baseCodeStyle} text-sm p-2 rounded my-2 overflow-x-auto whitespace-pre-wrap break-words ${className || ''}`}
                    {...props}
                  >
                    <code>{children}</code>
                  </pre>
                );
              }
            }}
          >
            {message}
          </ReactMarkdown>
        </div>

        {timestamp && (
          <p
            className={`text-xs mt-1 ${isUser
                ? darkMode
                  ? 'text-blue-200'
                  : 'text-blue-100'
                : darkMode
                  ? 'text-gray-400'
                  : 'text-gray-500'
              }`}
          >
            {new Date(timestamp).toLocaleTimeString()}
          </p>
        )}

        {!isUser && videoSuggestions.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-semibold mb-2">🎥 Suggested by Rohit Bhaiya:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {videoSuggestions.map((v) => (
                <a
                  key={v.url}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 p-2 border rounded hover:shadow"
                >
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    className="w-16 h-9 object-cover rounded"
                  />
                  <p className="text-xs font-medium line-clamp-2">{v.title}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;