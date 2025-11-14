class User {
    // We add a 'sessionID' for potential persistence, though here it is tied to socket.id.
    constructor(id, username, room = 'general') {
      this.id = id;
      this.username = username;
      this.room = room;
      this.online = true; // Use a boolean status for online presence
      this.joinedAt = new Date();
    }
  
    toJSON() {
      return {
        id: this.id,
        username: this.username,
        room: this.room,
        online: this.online,
        joinedAt: this.joinedAt.toISOString()
      };
    }
  }
  
  module.exports = User;
