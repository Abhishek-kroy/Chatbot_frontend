import { Trash2 } from 'lucide-react';

const SessionList = ({ sessions, onSelectSession, onDeleteSession, searchTerm, isLoading, darkMode }) => {
    const filteredSessions = sessions.filter(session =>
        session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${darkMode ? 'border-blue-400' : 'border-blue-500'
                    }`}></div>
            </div>
        );
    }

    if (filteredSessions.length === 0) {
        return (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                <p className="text-sm">No conversations found</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {filteredSessions.map((session) => (
                <div
                    key={session.sessionRef}
                    onClick={() => onSelectSession(session.sessionRef)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${darkMode
                            ? 'border-white hover:bg-gray-700 border-color-white'
                            : 'border border-gray-200 hover:bg-white-50 border-color-gray-200'
                        } flex`}
                >
                    <div className='overflow-hidden flex-1'>
                        <h3 className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'
                            }`}>
                            {session.title || 'Untitled Conversation'}
                        </h3>
                        <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                            {session.lastMessage || 'No messages'}
                        </p>
                    </div>
                    <div>
                        <Trash2
                            size={16}
                            className={`mt-2 cursor-pointer ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'
                                }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session.sessionRef);
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SessionList;