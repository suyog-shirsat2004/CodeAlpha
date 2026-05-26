const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

const encryptFile = (buffer, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return { iv: iv.toString('hex'), data: encrypted.toString('base64') };
};

const decryptFile = (encrypted, key, iv) => {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64')), decipher.final()]);
};

module.exports = (io, socket) => {
  const shareFile = async ({ roomCode, fileName, fileData, fileType }, callback) => {
    try {
      const buffer = Buffer.from(fileData, 'base64');
      const encryptionKey = crypto.randomBytes(32).toString('hex');
      const encrypted = encryptFile(buffer, encryptionKey);
      const fileId = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const filePath = path.join(uploadDir, fileId + path.extname(fileName));
      fs.writeFileSync(filePath, Buffer.from(encrypted.data, 'base64'));

      const fileInfo = {
        id: fileId,
        fileName,
        fileType,
        size: buffer.length,
        sender: socket.data.user?.name || 'Anonymous',
        encryptionKey,
        iv: encrypted.iv,
      };

      io.to(`file:${roomCode}`).emit('file-received', fileInfo);
      callback?.({ success: true, fileId });
    } catch (err) {
      callback?.({ success: false, error: err.message });
    }
  };

  const downloadFile = ({ roomCode, fileId, encryptionKey, iv }, callback) => {
    try {
      const files = fs.readdirSync(uploadDir).filter((f) => f.startsWith(fileId));
      if (files.length === 0) return callback?.({ success: false, error: 'File not found' });
      const filePath = path.join(uploadDir, files[0]);
      const encrypted = fs.readFileSync(filePath).toString('base64');
      const decrypted = decryptFile(encrypted, encryptionKey, iv);
      callback?.({ success: true, data: decrypted.toString('base64'), fileName: files[0] });
    } catch (err) {
      callback?.({ success: false, error: err.message });
    }
  };

  const joinFileRoom = ({ roomCode }) => socket.join(`file:${roomCode}`);
  const leaveFileRoom = ({ roomCode }) => socket.leave(`file:${roomCode}`);

  socket.on('file:join', joinFileRoom);
  socket.on('file:leave', leaveFileRoom);
  socket.on('file:share', shareFile);
  socket.on('file:download', downloadFile);
};

module.exports.upload = upload;
