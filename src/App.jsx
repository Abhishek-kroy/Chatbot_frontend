import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import FirebaseAuthSystem from './components/FirebaseAuthSystem';
import ChatWindow from './components/ChatWindow';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setCheckingAuth(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  if (checkingAuth) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-400 to-black text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-400"></div>
        <p className="mt-4 text-lg font-medium animate-pulse">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 transition-all duration-300 ease-in-out">
      {currentUser ? (
        <ChatWindow user={currentUser} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      ) : (
        <FirebaseAuthSystem onAuthSuccess={setCurrentUser} darkMode={darkMode} toggleDarkMode={toggleDarkMode}/>
      )}
    </div>
  );
}

export default App;