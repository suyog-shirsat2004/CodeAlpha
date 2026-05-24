const usersInRooms = {};

module.exports = (io, socket) => {
  const joinVideoRoom = ({ roomCode, user }) => {
    socket.join(`video:${roomCode}`);
    if (!usersInRooms[roomCode]) usersInRooms[roomCode] = [];
    const existing = usersInRooms[roomCode].find((u) => u.userId === user._id);
    if (!existing) {
      usersInRooms[roomCode].push({ userId: user._id, name: user.name, socketId: socket.id });
    }
    socket.to(`video:${roomCode}`).emit('user-joined', { userId: user._id, name: user.name });
    socket.emit('room-users', usersInRooms[roomCode]);
  };

  const leaveVideoRoom = ({ roomCode, userId }) => {
    socket.leave(`video:${roomCode}`);
    if (usersInRooms[roomCode]) {
      usersInRooms[roomCode] = usersInRooms[roomCode].filter((u) => u.userId !== userId);
      if (usersInRooms[roomCode].length === 0) delete usersInRooms[roomCode];
    }
    socket.to(`video:${roomCode}`).emit('user-left', userId);
  };

  const signal = ({ to, from, signalData }) => {
    io.to(to).emit('signal', { from: from.userId, name: from.name, signal: signalData });
  };

  const returnSignal = ({ to, signal, from }) => {
    io.to(to).emit('signal-return', { signal, from });
  };

  const screenShare = ({ roomCode, userId, streamActive }) => {
    socket.to(`video:${roomCode}`).emit('screen-share', { userId, active: streamActive });
  };

  socket.on('video:join', joinVideoRoom);
  socket.on('video:leave', leaveVideoRoom);
  socket.on('signal', signal);
  socket.on('signal-return', returnSignal);
  socket.on('screen-share', screenShare);

  socket.on('disconnect', () => {
    for (const roomCode of Object.keys(usersInRooms)) {
      const idx = usersInRooms[roomCode].findIndex((u) => u.socketId === socket.id);
      if (idx !== -1) {
        const user = usersInRooms[roomCode][idx];
        usersInRooms[roomCode].splice(idx, 1);
        if (usersInRooms[roomCode].length === 0) delete usersInRooms[roomCode];
        socket.to(`video:${roomCode}`).emit('user-left', user.userId);
        break;
      }
    }
  });
};
