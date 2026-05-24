import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineVideoCamera, HiOutlinePlus, HiOutlineLogout, HiOutlineUser } from 'react-icons/hi';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomCode.trim()) { toast.error('Enter a room code'); return; }
    navigate(`/room/${roomCode.trim()}`);
  };

  const handleCreate = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/room/${code}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xl font-bold text-indigo-400">
          <HiOutlineVideoCamera className="w-6 h-6" />
          <span>ConnectHub</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <HiOutlineUser className="w-4 h-4" />
            <span>{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors" title="Logout">
            <HiOutlineLogout className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Connect with anyone</h1>
          <p className="text-gray-400 text-lg">Start a video call, share your screen, collaborate in real-time</p>
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Join a Meeting</h2>
          <form onSubmit={handleJoin} className="flex gap-3">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="input-field flex-1 uppercase"
              placeholder="Enter room code..."
              maxLength={8}
            />
            <button type="submit" className="btn-primary">Join</button>
          </form>
        </div>

        <div className="text-center">
          <button onClick={handleCreate} className="btn-primary flex items-center gap-2 mx-auto px-6 py-3 text-lg">
            <HiOutlinePlus className="w-5 h-5" />
            Create New Room
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
