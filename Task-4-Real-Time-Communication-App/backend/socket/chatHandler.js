module.exports = (io, socket) => {
  const sendMessage = ({ roomCode, message, user }) => {
    const msg = {
      text: message,
      user: { id: user._id, name: user.name },
      timestamp: new Date().toISOString(),
    };
    io.to(`chat:${roomCode}`).emit('chat-message', msg);
  };

  const joinChat = ({ roomCode }) => socket.join(`chat:${roomCode}`);
  const leaveChat = ({ roomCode }) => socket.leave(`chat:${roomCode}`);

  socket.on('chat:join', joinChat);
  socket.on('chat:leave', leaveChat);
  socket.on('chat:message', sendMessage);
};
