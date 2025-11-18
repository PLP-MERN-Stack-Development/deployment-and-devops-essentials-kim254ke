// ==========================================
// client/src/hooks/useNotification.js
// ==========================================
import { useEffect, useCallback } from 'react';

export const useNotification = () => {
  useEffect(() => {
    // Request notification permission on component mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const playSound = useCallback(() => {
    // Base64 encoded WAV sound
    const audio = new Audio(
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGe67OWeTRAMUKfj8LZjHAY4ktjyzHksBS'
    );
    audio.volume = 0.3;
    audio.play().catch(() => {});
  }, []);

  const showNotification = useCallback((title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body.substring(0, 100), // Truncate body
        icon: '💬',
        tag: 'chat-notification',
        requireInteraction: false,
      });
    }
  }, []);

  const notify = useCallback((message) => {
    playSound();
    showNotification(`New message from ${message.sender}`, message.message);
  }, [playSound, showNotification]);

  return { notify, playSound, showNotification };
};

export default useNotification;
