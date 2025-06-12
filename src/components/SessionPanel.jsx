import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import SessionList from './SessionList';
import useSessions from '../hooks/useSessions';

const SessionsPanel = ({ onSelectSession, onDeleteSession, darkMode }) => {
    const [idToken, setIdToken] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchToken = async () => {
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
                const token = await user.getIdToken();
                setIdToken(token);
            }
        };
        fetchToken();
    }, []);

    const { sessions, isLoading, refresh } = useSessions(idToken);

    return (
        <div className='p-2'>
            <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-2 mb-2 rounded ${
                    darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
            />
            <SessionList
                sessions={sessions}
                onSelectSession={onSelectSession}
                onDeleteSession={onDeleteSession}
                searchTerm={searchTerm}
                isLoading={isLoading}
                darkMode={darkMode}
            />
        </div>
    );
};

export default SessionsPanel;