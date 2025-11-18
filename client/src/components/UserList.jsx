// client/src/components/UserList.jsx - ENHANCED VERSION
import React, { useState } from 'react';
import { X, Search, MessageCircle, Crown } from 'lucide-react';

const UserList = ({ users, onClose, currentUser, onPrivateMessage }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (user) => {
    if (!user.online) return 'bg-gray-400';
    // You can add more statuses: away, busy, etc.
    return 'bg-green-500';
  };

  const getAvatarColor = (username) => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-yellow-500 to-orange-500',
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col animate-slideUp shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-cyan-600">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-white">
            Online Users ({filteredUsers.length})
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pl-9 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition group cursor-pointer"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(user.username)} rounded-full flex items-center justify-center font-bold text-white text-lg shadow-md`}>
                  {user.username[0]?.toUpperCase()}
                </div>
                {/* Status Indicator */}
                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${getStatusColor(user)} rounded-full border-2 border-white`}></div>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-800 truncate">
                    {user.username}
                  </span>
                  {user.username === currentUser && (
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <span className={`${user.online ? 'text-green-600' : 'text-gray-400'}`}>
                    {user.online ? 'Online' : 'Offline'}
                  </span>
                  {user.room && (
                    <>
                      <span>•</span>
                      <span>#{user.room}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              {user.username !== currentUser && onPrivateMessage && (
                <button
                  onClick={() => onPrivateMessage(user.id, user.username)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-purple-100 rounded-lg"
                  title="Send private message"
                >
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                </button>
              )}
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm">
              {searchQuery ? 'No users found' : 'No users online'}
            </p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Users</span>
          <span className="font-semibold text-purple-600">{users.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-600">Online Now</span>
          <span className="font-semibold text-green-600">
            {users.filter(u => u.online).length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserList;