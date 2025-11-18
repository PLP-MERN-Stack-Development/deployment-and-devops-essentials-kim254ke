import React from 'react';
import { Hash, LogOut } from 'lucide-react';

const RoomList = ({ rooms, currentRoom, onRoomChange, unreadCounts, notifications, username, onLogout, isConnected }) => {
  return (
    <div className="w-64 bg-gradient-to-b from-purple-700 to-purple-900 text-white flex flex-col">
      <div className="p-4 border-b border-purple-600">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Rooms</h2>
          {notifications > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              {notifications}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rooms.map((room) => (
          <button
            key={room}
            onClick={() => onRoomChange(room)}
            className={`w-full text-left px-4 py-3 hover:bg-purple-600 transition flex items-center justify-between ${
              currentRoom === room ? 'bg-purple-600' : ''
            }`}
          >
            <div className="flex items-center space-x-2">
              <Hash className="w-4 h-4" />
              <span className="font-medium">{room}</span>
            </div>
            {unreadCounts[room] > 0 && (
              <span className="bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCounts[room]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-purple-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center font-bold">
              {username[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm block truncate">
                {username}
              </span>
              <span className="text-xs text-purple-300">Online</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="hover:bg-purple-600 p-2 rounded transition"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomList;