module.exports = (io, socket) => {
  const draw = ({ roomCode, data }) => {
    socket.to(`whiteboard:${roomCode}`).emit('draw', data);
  };

  const clearBoard = ({ roomCode }) => {
    socket.to(`whiteboard:${roomCode}`).emit('board-cleared');
  };

  const joinWhiteboard = ({ roomCode }) => {
    socket.join(`whiteboard:${roomCode}`);
  };

  const leaveWhiteboard = ({ roomCode }) => {
    socket.leave(`whiteboard:${roomCode}`);
  };

  socket.on('wb:join', joinWhiteboard);
  socket.on('wb:leave', leaveWhiteboard);
  socket.on('wb:draw', draw);
  socket.on('wb:clear', clearBoard);
};
