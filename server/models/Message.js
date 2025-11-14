class Message {
    constructor(id, sender, senderId, message, room = 'general', isPrivate = false, recipientId = null) {
      this.id = id;
      this.sender = sender;
      this.senderId = senderId;
      this.message = message;
      this.room = room;
      this.isPrivate = isPrivate;
      this.recipientId = recipientId; // Used for private messages
      this.timestamp = new Date().toISOString();
      this.delivered = true;
      this.read = false; // Placeholder for read receipt logic (Task 3)
      this.reactions = []; // For message reactions (Task 3)
    }
  
    addReaction(userId, emoji) {
      // Simple logic: allow one reaction per user, update if user reacts again
      const existingReactionIndex = this.reactions.findIndex(r => r.userId === userId);
      
      if (existingReactionIndex > -1) {
        // Update existing reaction
        this.reactions[existingReactionIndex].emoji = emoji;
      } else {
        // Add new reaction
        this.reactions.push({ userId, emoji, count: 1 });
      }
    }
  
    markAsRead() {
      this.read = true;
    }
  
    toJSON() {
      return {
        id: this.id,
        sender: this.sender,
        senderId: this.senderId,
        message: this.message,
        room: this.room,
        isPrivate: this.isPrivate,
        recipientId: this.recipientId,
        timestamp: this.timestamp,
        delivered: this.delivered,
        read: this.read,
        reactions: this.reactions
      };
    }
  }
  
  module.exports = Message;
