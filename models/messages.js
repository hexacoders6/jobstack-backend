const mongoose = require('mongoose');

const messageSchema = mongoose.Schema( {
    chatId: {
      type: String,
    },
    senderId: {
      type: String,
    },
    text: {
      type: String,
    },
  },
  {
    timestamps: true,
  });

const Messages = mongoose.model('Message', messageSchema);

module.exports = Messages;