// ============================================================
//  CRYGUARY — Baby Monitor Backend
//  server.js  |  Express + Socket.io + MongoDB
// ============================================================

const express        = require('express');
const http           = require('http');
const { Server }     = require('socket.io');
const mongoose       = require('mongoose');
const cors           = require('cors');
const dotenv         = require('dotenv');

dotenv.config();

const alertRoutes    = require('./routes/alertRoutes');
const sessionRoutes  = require('./routes/sessionRoutes');
const parentRoutes   = require('./routes/parentRoutes');
const errorHandler   = require('./middleware/errorHandler');

const app    = express();
const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Make io accessible from routes
app.set('io', io);

// ── Middleware ─────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}]  ${req.method}  ${req.url}`);
  next();
});

// ── Routes ─────────────────────────────────────────────────
app.use('/api/alerts',   alertRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/parents',  parentRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── Error handler ──────────────────────────────────────────
app.use(errorHandler);

// ── Socket.io events ───────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌  Client connected: ${socket.id}`);

  // Baby started crying
  socket.on('baby:crying', (data) => {
    console.log('😢  baby:crying event received', data);
    io.emit('baby:crying', data);          // broadcast to all parents
  });

  // Baby calmed down
  socket.on('baby:calm', (data) => {
    console.log('😊  baby:calm event received', data);
    io.emit('baby:calm', data);
  });

  // Parent acknowledged alert
  socket.on('parent:ack', (data) => {
    console.log('👨‍👩‍👧  parent:ack received', data);
    io.emit('parent:ack', data);
  });

  socket.on('disconnect', () => {
    console.log(`❌  Client disconnected: ${socket.id}`);
  });
});

// ── MongoDB + start server ─────────────────────────────────
const PORT    = process.env.PORT    || 5000;
const MONGO   = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cryguary';

mongoose
  .connect(MONGO)
  .then(() => {
    console.log('✅  MongoDB connected');
    server.listen(PORT, () =>
      console.log(`🚀  Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });