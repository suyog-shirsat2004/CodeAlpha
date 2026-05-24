import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import VideoGrid from '../components/VideoGrid';
import Whiteboard from '../components/Whiteboard';
import FileShare from '../components/FileShare';
import Chat from '../components/Chat';
import toast from 'react-hot-toast';
import {
  HiOutlineVideoCamera, HiOutlineMicrophone, HiOutlineDesktopComputer,
  HiOutlinePencilAlt, HiOutlineFolderOpen, HiOutlineChatAlt2,
  HiOutlinePhone, HiOutlineShare, HiOutlineClipboardCopy,
} from 'react-icons/hi';
import SimplePeer from 'simple-peer';

const TABS = [
  { id: 'video', label: 'Video', icon: HiOutlineVideoCamera },
  { id: 'whiteboard', label: 'Whiteboard', icon: HiOutlinePencilAlt },
  { id: 'files', label: 'Files', icon: HiOutlineFolderOpen },
  { id: 'chat', label: 'Chat', icon: HiOutlineChatAlt2 },
];

const Room = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('video');
  const [peers, setPeers] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [participants, setParticipants] = useState([]);
  const peersRef = useRef({});
  const localStreamRef = useRef(null);

  const getUserMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      localStreamRef.current = stream;
      return stream;
    } catch {
      toast.error('Camera/microphone access denied');
      return null;
    }
  }, []);

  const createPeer = useCallback((targetSocketId, initiator, stream) => {
    const peer = new SimplePeer({ initiator, stream, trickle: false });

    peer.on('signal', (signalData) => {
      getSocket()?.emit('signal', { to: targetSocketId, from: { userId: user._id, name: user.name }, signalData });
    });

    peer.on('stream', (remoteStream) => {
      setPeers((prev) => {
        const exists = prev.find((p) => p.userId === targetSocketId);
        if (exists) return prev.map((p) => p.userId === targetSocketId ? { ...p, stream: remoteStream } : p);
        return [...prev, { userId: targetSocketId, name: '', stream: remoteStream }];
      });
    });

    peer.on('close', () => {
      setPeers((prev) => prev.filter((p) => p.userId !== targetSocketId));
    });

    return peer;
  }, [user]);

  useEffect(() => {
    const init = async () => {
      const socket = connectSocket();
      const stream = await getUserMedia();
      if (!stream) return;

      socket.emit('join-room', { roomCode, user });

      socket.on('user-joined-room', ({ userId, name }) => {
        setParticipants((prev) => [...prev.filter((p) => p.userId !== userId), { userId, name }]);
        if (userId !== user._id && stream) {
          const peer = createPeer(socket.id, true, stream);
          peersRef.current[userId] = peer;
        }
      });

      socket.on('user-left-room', (userId) => {
        if (peersRef.current[userId]) {
          peersRef.current[userId].destroy();
          delete peersRef.current[userId];
        }
        setParticipants((prev) => prev.filter((p) => p.userId !== userId));
        setPeers((prev) => prev.filter((p) => p.userId !== userId));
      });

      socket.on('signal', ({ from, signal }) => {
        if (!peersRef.current[from]) {
          const peer = createPeer(from, false, stream);
          peersRef.current[from] = peer;
        }
        peersRef.current[from].signal(signal);
      });

      socket.on('signal-return', ({ signal, from }) => {
        if (peersRef.current[from]) {
          peersRef.current[from].signal(signal);
        }
      });

      socket.on('screen-share', ({ userId: sharerId, active }) => {
        if (active) toast(`${sharerId === user._id ? 'You are' : 'Someone is'} sharing their screen`, { icon: '🖥️' });
      });
    };

    init();

    return () => {
      Object.values(peersRef.current).forEach((p) => p.destroy());
      peersRef.current = {};
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      const socket = getSocket();
      if (socket) {
        socket.emit('leave-room', { roomCode, userId: user._id });
        disconnectSocket();
      }
    };
  }, [roomCode, user, getUserMedia, createPeer]);

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => (t.enabled = audioMuted));
      setAudioMuted(!audioMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => (t.enabled = videoMuted));
      setVideoMuted(!videoMuted);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (screenSharing) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        localStreamRef.current = stream;
        Object.values(peersRef.current).forEach((peer) => {
          peer.replaceTrack(localStream?.getVideoTracks()[0], stream.getVideoTracks()[0], localStream);
        });
        setScreenSharing(false);
        getSocket()?.emit('screen-share', { roomCode, userId: user._id, streamActive: false });
      } else {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        displayStream.getVideoTracks()[0].onended = () => toggleScreenShare();
        setLocalStream(displayStream);
        localStreamRef.current = displayStream;
        Object.values(peersRef.current).forEach((peer) => {
          peer.replaceTrack(localStream?.getVideoTracks()[0], displayStream.getVideoTracks()[0], localStream);
        });
        setScreenSharing(true);
        getSocket()?.emit('screen-share', { roomCode, userId: user._id, streamActive: true });
      }
    } catch {
      toast.error('Screen sharing cancelled or failed');
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success('Room code copied!');
  };

  const leaveRoom = () => {
    Object.values(peersRef.current).forEach((p) => p.destroy());
    if (localStream) localStream.getTracks().forEach((t) => t.stop());
    disconnectSocket();
    navigate('/');
  };

  const socket = getSocket();

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-indigo-400 font-bold">Room: {roomCode}</span>
          <button onClick={copyRoomCode} className="text-gray-400 hover:text-indigo-400 transition-colors" title="Copy room code">
            <HiOutlineClipboardCopy className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          {participants.length > 0 && (
            <span className="text-sm text-gray-400">{participants.length + 1} participant{(participants.length + 1) > 1 ? 's' : ''}</span>
          )}
          <button onClick={leaveRoom} className="btn-danger flex items-center gap-1 text-sm px-3 py-1.5">
            <HiOutlinePhone className="w-4 h-4 rotate-135" /> Leave
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'video' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <VideoGrid peers={peers} localStream={localStream} localName={user?.name} />
            </div>
          )}
          {activeTab === 'whiteboard' && (
            <div className="flex-1">
              <Whiteboard socket={socket} roomCode={roomCode} />
            </div>
          )}
          {activeTab === 'files' && (
            <div className="flex-1">
              <FileShare socket={socket} roomCode={roomCode} />
            </div>
          )}
          {activeTab === 'chat' && (
            <div className="flex-1">
              <Chat socket={socket} roomCode={roomCode} userName={user?.name} />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAudio}
            className={`p-2.5 rounded-full transition-colors ${audioMuted ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:text-white'}`}
            title={audioMuted ? 'Unmute' : 'Mute'}
          >
            <HiOutlineMicrophone className="w-5 h-5" />
          </button>
          <button
            onClick={toggleVideo}
            className={`p-2.5 rounded-full transition-colors ${videoMuted ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:text-white'}`}
            title={videoMuted ? 'Turn on camera' : 'Turn off camera'}
          >
            <HiOutlineVideoCamera className="w-5 h-5" />
          </button>
          <button
            onClick={toggleScreenShare}
            className={`p-2.5 rounded-full transition-colors ${screenSharing ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:text-white'}`}
            title={screenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <HiOutlineDesktopComputer className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Room;
