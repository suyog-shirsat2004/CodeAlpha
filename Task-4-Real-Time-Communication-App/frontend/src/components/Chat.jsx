import React, { useState, useEffect, useRef } from 'react';
import { HiOutlinePaperAirplane } from 'react-icons/hi';

const Chat = ({ socket, roomCode, userName }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on('chat-message', handleMessage);
    socket.emit('chat:join', { roomCode });
    return () => {
      socket.off('chat-message', handleMessage);
      socket.emit('chat:leave', { roomCode });
    };
  }, [socket, roomCode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    socket.emit('chat:message', { roomCode, message: input.trim(), user: { _id: 'local', name: userName } });
    setMessages((prev) => [...prev, { text: input.trim(), user: { name: userName }, timestamp: new Date().toISOString() }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-700">
        <h3 className="font-semibold text-sm">Chat</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">No messages yet</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.user.name === userName ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 ${msg.user.name === userName ? 'bg-indigo-600' : 'bg-gray-700'}`}>
              {msg.user.name !== userName && (
                <p className="text-xs font-medium text-indigo-300 mb-0.5">{msg.user.name}</p>
              )}
              <p className="text-sm text-white">{msg.text}</p>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="p-3 border-t border-gray-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input-field flex-1 text-sm"
          placeholder="Type a message..."
        />
        <button type="submit" className="btn-primary px-3">
          <HiOutlinePaperAirplane className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default Chat;
