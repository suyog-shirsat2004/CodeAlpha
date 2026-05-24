import React, { useRef, useEffect } from 'react';

const VideoPlayer = ({ stream, muted, name, isLocal }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`relative rounded-xl overflow-hidden bg-gray-800 border-2 ${isLocal ? 'border-indigo-500' : 'border-gray-700'}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover aspect-video"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
        <span className="text-sm font-medium text-white">{name} {isLocal && '(You)'}</span>
      </div>
    </div>
  );
};

export default VideoPlayer;
