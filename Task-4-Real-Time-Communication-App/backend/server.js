const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { getDb } = require('./config/db');
const keys = require('./config/keys');
const setupSocket = require('./socket');

getDb().then(() => {
  console.log('SQLite database initialized');
}).catch(err => {
  console.error('Database initialization error:', err);
  process.exit(1);
});

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Real-Time Communication API is running' });
});

app.use('/api/auth', require('./routes/authRoutes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

setupSocket(io);

const PORT = keys.port;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
