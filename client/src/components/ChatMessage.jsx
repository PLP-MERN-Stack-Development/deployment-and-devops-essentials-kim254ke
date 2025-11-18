// client/src/components/ChatMessage.jsx - FIXED (Using MongoDB _id)
import React, { useState } from 'react';
import { Check, CheckCheck, Smile, MoreVertical, Edit2, Trash2, Copy } from 'lucide-react';

const ChatMessage = ({ message, isOwnMessage, onAddReaction, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.message || '');

  const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  if (message.system) {
    return (
      <div className="text-center text-gray-500 text-sm italic py-2 flex items-center justify-center">
        <span className="bg-gray-100 px-3 py-1 rounded-full">{message.message}</span>
      </div>
    );
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.message);
    setShowMenu(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== message.message) {
      onEdit(message._id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(message.message);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      onDelete(message._id);
    }
    setShowMenu(false);
  };

  return (
    <div className={`mb-4 flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-slideUp group`}>
      <div className={`max-w-md ${isOwnMessage ? 'order-2' : ''} relative`}>
        {!isOwnMessage && (
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 shadow-md">
            {message.sender?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-700">
                  {message.sender}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime(message.createdAt || message.timestamp)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="relative group">
          <div
            className={`rounded-2xl px-4 py-3 message-bubble shadow-sm ${
              isOwnMessage
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white ml-auto'
                : 'bg-white border border-gray-200 text-gray-800'
            }`}
          >
            {message.image && (
              <img
                src={message.image}
                alt="Uploaded"
                className="rounded-lg mb-2 max-w-full h-auto"
              />
            )}

            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                  className="w-full px-2 py-1 text-sm border rounded text-gray-800"
                  autoFocus
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveEdit}
                    className="text-xs bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-xs bg-gray-500 text-white px-2 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="break-words whitespace-pre-wrap">{message.message}</p>
                {message.edited && (
                  <span className="text-xs opacity-70 italic">(edited)</span>
                )}
              </>
            )}
            
            {isOwnMessage && !isEditing && (
              <div className="flex justify-end mt-1">
                {message.read ? (
                  <CheckCheck className="w-4 h-4 text-blue-300" />
                ) : message.delivered ? (
                  <Check className="w-4 h-4 text-blue-300" />
                ) : (
                  <Check className="w-4 h-4 text-gray-300" />
                )}
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`p-1 rounded ${isOwnMessage ? 'bg-white/20' : 'bg-gray-100'}`}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-10 min-w-32">
                  <button
                    onClick={handleCopyMessage}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                  {isOwnMessage && onEdit && (
                    <button
                      onClick={handleEditClick}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}
                  {isOwnMessage && onDelete && (
                    <button
                      onClick={handleDeleteClick}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-sm text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {isOwnMessage && !isEditing && (
          <div className="text-right text-xs text-gray-500 mt-1">
            {formatTime(message.createdAt || message.timestamp)}
          </div>
        )}

        {!isEditing && (
          <div className="flex items-center space-x-1 mt-2">
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {message.reactions.reduce((acc, r) => {
                  const existing = acc.find(item => item.emoji === r.emoji);
                  if (existing) {
                    existing.count++;
                  } else {
                    acc.push({ emoji: r.emoji, count: 1 });
                  }
                  return acc;
                }, []).map((item, i) => (
                  <span
                    key={i}
                    className="text-sm bg-gray-100 px-2 py-1 rounded-full border border-gray-300 hover:border-purple-500 cursor-pointer transition"
                    onClick={() => onAddReaction(message._id, item.emoji)}
                  >
                    {item.emoji} {item.count > 1 && <span className="text-xs text-gray-600">{item.count}</span>}
                  </span>
                ))}
              </div>
            )}
            
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition"
                title="Add reaction"
              >
                <Smile className="w-4 h-4" />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-8 left-0 bg-white border-2 border-purple-500 rounded-lg shadow-xl p-2 flex space-x-1 z-10">
                  {QUICK_REACTIONS.map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        onAddReaction(message._id, emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-xl hover:bg-gray-100 rounded p-1 transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;