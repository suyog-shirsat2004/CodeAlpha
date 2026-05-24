import React, { useRef, useState, useCallback, useEffect } from 'react';

const Whiteboard = ({ socket, roomCode }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState('pen');

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvasRef.current.width / rect.width),
      y: (e.clientY - rect.top) * (canvasRef.current.height / rect.height),
    };
  };

  const startDrawing = useCallback((e) => {
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  }, []);

  const draw = useCallback((e) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = tool === 'eraser' ? '#111827' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    if (socket) {
      socket.emit('wb:draw', {
        roomCode,
        data: {
          from: { x: pos.x - (pos.x - (pos.x - (pos.x))), y: pos.y - (pos.y - (pos.y - (pos.y))) },
          to: pos,
          color: tool === 'eraser' ? '#111827' : color,
          width: tool === 'eraser' ? lineWidth * 3 : lineWidth,
          eraser: tool === 'eraser',
        },
      });
    }
  }, [isDrawing, color, lineWidth, tool, socket, roomCode]);

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearBoard = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    if (socket) socket.emit('wb:clear', { roomCode });
  };

  useEffect(() => {
    if (!socket) return;
    const handleDraw = (data) => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.width;
      ctx.lineCap = 'round';
      ctx.lineTo(data.to.x, data.to.y);
      ctx.stroke();
    };
    const handleClear = () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };
    socket.on('draw', handleDraw);
    socket.on('board-cleared', handleClear);
    socket.emit('wb:join', { roomCode });
    return () => {
      socket.off('draw', handleDraw);
      socket.off('board-cleared', handleClear);
      socket.emit('wb:leave', { roomCode });
    };
  }, [socket, roomCode]);

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = Math.max(400, parent.clientHeight);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 bg-gray-800 border-b border-gray-700">
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
        <input type="range" min="1" max="20" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-20" />
        <button onClick={() => setTool('pen')} className={`px-3 py-1 rounded text-sm ${tool === 'pen' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Pen</button>
        <button onClick={() => setTool('eraser')} className={`px-3 py-1 rounded text-sm ${tool === 'eraser' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Eraser</button>
        <button onClick={clearBoard} className="px-3 py-1 rounded text-sm bg-red-600 text-white ml-auto">Clear</button>
      </div>
      <canvas
        ref={canvasRef}
        className="flex-1 bg-gray-900"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};

export default Whiteboard;
