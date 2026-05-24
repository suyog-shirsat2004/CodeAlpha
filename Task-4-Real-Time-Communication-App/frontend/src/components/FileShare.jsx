import React, { useState, useEffect, useRef } from 'react';
import { HiOutlineUpload, HiOutlineDownload, HiOutlineLockClosed } from 'react-icons/hi';
import toast from 'react-hot-toast';

const FileShare = ({ socket, roomCode }) => {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (!socket) return;
    const handleFileReceived = (fileInfo) => {
      setFiles((prev) => [...prev, { ...fileInfo, received: true, status: 'encrypted' }]);
      toast.success(`File received: ${fileInfo.fileName}`);
    };
    socket.on('file-received', handleFileReceived);
    socket.emit('file:join', { roomCode });
    return () => {
      socket.off('file-received', handleFileReceived);
      socket.emit('file:leave', { roomCode });
    };
  }, [socket, roomCode]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File too large (max 50MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result.split(',')[1];
      socket.emit('file:share', { roomCode, fileName: file.name, fileData: base64, fileType: file.type }, (response) => {
        if (response?.success) {
          toast.success('File shared!');
        } else {
          toast.error('Failed to share file');
        }
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDownload = (file) => {
    socket.emit('file:download', { roomCode, fileId: file.id, encryptionKey: file.encryptionKey, iv: file.iv }, (response) => {
      if (response?.success) {
        const a = document.createElement('a');
        a.href = `data:${file.fileType};base64,${response.data}`;
        a.download = file.fileName;
        a.click();
        toast.success('File decrypted & downloaded');
      } else {
        toast.error('Failed to download file');
      }
    });
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-sm">File Sharing</h3>
        <button onClick={() => fileInputRef.current?.click()} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
          <HiOutlineUpload className="w-3 h-3" /> Share
        </button>
        <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {files.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8">No files shared yet</p>
        )}
        {files.map((file, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-200 truncate">{file.fileName}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{formatSize(file.size)}</span>
                <span className="flex items-center gap-1"><HiOutlineLockClosed className="w-3 h-3" /> AES-256</span>
                <span>by {file.sender}</span>
              </div>
            </div>
            {file.received && (
              <button onClick={() => handleDownload(file)} className="p-1.5 text-gray-400 hover:text-indigo-400 transition-colors" title="Download & decrypt">
                <HiOutlineDownload className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileShare;
