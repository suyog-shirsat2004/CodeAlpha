const webrtcHandler = require('./webrtcHandler');
const whiteboardHandler = require('./whiteboardHandler');
const fileHandler = require('./fileHandler');
const chatHandler = require('./chatHandler');

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join-room', ({ roomCode, user }) => {
      socket.data.roomCode = roomCode;
      socket.data.user = user;
      socket.join(roomCode);
      socket.to(roomCode).emit('user-joined-room', { socketId: socket.id, userId: user._id, name: user.name });
    });

    socket.on('leave-room', ({ roomCode, userId }) => {
      socket.leave(roomCode);
      socket.to(roomCode).emit('user-left-room', userId);
    });

    webrtcHandler(io, socket);
    whiteboardHandler(io, socket);
    fileHandler(io, socket);
    chatHandler(io, socket);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      const { roomCode, user } = socket.data;
      if (roomCode && user) {
        socket.to(roomCode).emit('user-left-room', user._id);
      }
    });
  });
};

module.exports = setupSocket;
