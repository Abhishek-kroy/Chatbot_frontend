const LoadingIndicator = ({ darkMode }) => {
  return (
    <div className="flex justify-start">
      <div className={`rounded-lg px-4 py-2 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border border-gray-200'
      }`}>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className={`w-2 h-2 rounded-full animate-bounce ${
              darkMode ? 'bg-gray-500' : 'bg-gray-400'
            }`}></div>
            <div className={`w-2 h-2 rounded-full animate-bounce ${
              darkMode ? 'bg-gray-500' : 'bg-gray-400'
            }`} style={{ animationDelay: '0.1s' }}></div>
            <div className={`w-2 h-2 rounded-full animate-bounce ${
              darkMode ? 'bg-gray-500' : 'bg-gray-400'
            }`} style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>Bhaiya is typing...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;