# Real-Time Communication App (Task 4)

A full-stack video conferencing and collaboration tool with WebRTC, Socket.io, real-time whiteboard, encrypted file sharing, and chat.

**Live demo: ** [suyog-shirsat2004.github.io/CodeAlpha/Task-4/](https://suyog-shirsat2004.github.io/CodeAlpha/Task-4/) *(frontend UI — run backend locally for full features)*

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Tailwind CSS, simple-peer, Socket.io-client |
| **Backend** | Node.js, Express, Socket.io, SQLite (sql.js) |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **Media** | WebRTC via simple-peer, Screen Capture API |
| **Whiteboard** | HTML5 Canvas with Socket.io sync |
| **Encryption** | AES-256-CBC (server-side file encryption) |
| **File Transfer** | Socket.io with multer upload |

## Features

- **Video Calling** — Multi-user video calls via WebRTC mesh topology
- **Screen Sharing** — Share your screen with all participants
- **Whiteboard** — Real-time collaborative drawing canvas with pen/eraser/color tools
- **File Sharing** — Share files with AES-256 encryption at rest and in transit
- **Chat** — Real-time text chat alongside video
- **Authentication** — JWT-based register/login system
- **Room System** — Create or join rooms with unique codes

## How to Run

### Prerequisites
- Node.js v16+

### Start Backend
```bash
cd backend
npm install
npm run dev
```
Server starts on `http://localhost:5000`

### Start Frontend
```bash
cd frontend
npm install
npm start
```
Frontend opens `http://localhost:3000`

### Using the App
1. Register an account
2. Click **Create New Room** or enter a room code to join
3. Share the room code with others
4. Use the bottom toolbar to switch between Video, Whiteboard, Files, and Chat

## Project Structure
```
Task-4-Real-Time-Communication-App/
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoGrid.jsx     # Grid of video streams
│   │   │   ├── VideoPlayer.jsx   # Individual video player
│   │   │   ├── Whiteboard.jsx    # Collaborative canvas
│   │   │   ├── FileShare.jsx     # Encrypted file sharing
│   │   │   └── Chat.jsx          # Real-time messaging
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Room.jsx          # Main collaboration page
│   │   └── services/
│   │       ├── api.js            # Axios API client
│   │       └── socket.js         # Socket.io client
│   └── package.json
├── backend/                  # Express + Socket.io backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/               # User, Room schemas
│   ├── routes/
│   ├── socket/               # Socket.io event handlers
│   │   ├── index.js          # Main socket setup
│   │   ├── webrtcHandler.js  # WebRTC signaling
│   │   ├── whiteboardHandler.js
│   │   ├── fileHandler.js    # Encrypted file transfer
│   │   └── chatHandler.js
│   └── server.js
└── uploads/                  # Encrypted file storage
```
