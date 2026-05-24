import React from 'react';
import VideoPlayer from './VideoPlayer';

const VideoGrid = ({ peers, localStream, localName }) => {
  return (
    <div className="video-grid">
      {localStream && (
        <VideoPlayer stream={localStream} muted name={localName} isLocal />
      )}
      {peers.map((peer) => (
        <VideoPlayer
          key={peer.userId}
          stream={peer.stream}
          name={peer.name}
          isLocal={false}
        />
      ))}
      {!localStream && !peers.length && (
        <div className="col-span-full flex items-center justify-center h-64 bg-gray-800 rounded-xl border-2 border-dashed border-gray-700">
          <p className="text-gray-400 text-lg">Waiting for others to join...</p>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;
