// client/src/components/ChatInput.jsx - ENHANCED VERSION
import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Smile, X, Paperclip } from 'lucide-react';

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
  '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
  '🤧', '🥵', '🥶', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
  '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤝', '💪',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
  '✨', '⭐', '🌟', '💫', '🔥', '💥', '💯', '✅', '🎉', '🎊',
];

const ChatInput = ({ onSendMessage, onTyping, onImageUpload }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    setMessage(e.target.value);
    
    if (onTyping) {
      onTyping(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1000);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (message.trim() || selectedImage) {
      if (selectedImage && onImageUpload) {
        onImageUpload(selectedImage, message.trim());
      } else {
        onSendMessage(message.trim());
      }
      setMessage('');
      handleRemoveImage();
      if (onTyping) {
        onTyping(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="h-20 w-20 object-cover rounded-lg border-2 border-purple-500"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center space-x-3">
        {/* Image Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Upload image"
        >
          <Image className="w-6 h-6 text-gray-600" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Emoji Picker Button */}
        <div className="relative" ref={emojiPickerRef}>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Add emoji"
          >
            <Smile className="w-6 h-6 text-gray-600" />
          </button>

          {/* Emoji Picker Popup */}
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 bg-white border-2 border-purple-500 rounded-lg shadow-2xl p-3 w-80 max-h-64 overflow-y-auto z-50">
              <div className="grid grid-cols-10 gap-1">
                {EMOJIS.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="text-2xl hover:bg-gray-100 rounded p-1 transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <input
          type="text"
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 transition"
          maxLength={1000}
        />

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={!message.trim() && !selectedImage}
          className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white p-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Send className="w-6 h-6" />
        </button>
      </div>

      {/* Character Counter */}
      {message.length > 800 && (
        <div className="text-right text-xs text-gray-500 mt-1">
          {message.length}/1000
        </div>
      )}
    </div>
  );
};

export default ChatInput;