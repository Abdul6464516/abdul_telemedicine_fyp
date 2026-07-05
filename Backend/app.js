const dotenv = require("dotenv");
dotenv.config({ override: true });

const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const connectDb = require("./config/dbconfig");
const Patient = require("./models/Patient");
const cors = require("cors");

const PORT = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());
app.set('trust proxy', true); // Trust proxy for accurate IP address
// mount auth routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patient');
const doctorRoutes = require('./routes/doctor');
const consultationRoutes = require('./routes/consultation');
const notificationRoutes = require('./routes/notification');
const adminRoutes = require('./routes/admin');
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor/notifications', notificationRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/consultation', consultationRoutes);
app.use('/api/admin', adminRoutes);
connectDb();

// ─── WebRTC Signaling via Socket.IO ────────────────────────────
const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // User registers with their userId
  socket.on('register', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Doctor calls a patient — sends offer
  socket.on('call-user', ({ to, from, signal, callerName, consultationId }) => {
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit('incoming-call', { from, signal, callerName, consultationId });
    } else {
      socket.emit('user-offline', { userId: to });
    }
  });

  // Patient answers — sends back answer signal
  socket.on('answer-call', ({ to, signal }) => {
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit('call-accepted', { signal });
    }
  });

  // Either side ends the call
  socket.on('end-call', ({ to }) => {
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit('call-ended');
    }
  });

  // ICE candidate exchange (for connectivity)
  socket.on('ice-candidate', ({ to, candidate }) => {
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit('ice-candidate', { candidate });
    }
  });

  socket.on('disconnect', () => {
    // Remove user from online map
    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`The server is running on the port ${PORT}`);
});