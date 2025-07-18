const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Konfigurasi dan setup Socket.io
 * @param {Object} io - Instance Socket.io
 */
const setupSocket = (io) => {
  // Middleware untuk autentikasi dengan JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      // Verifikasi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Cari user berdasarkan ID
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Simpan data user di socket
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });
  
  // Event ketika client terhubung
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`);
    
    // Join room berdasarkan user ID
    socket.join(`user_${socket.user._id}`);
    
    // Event ketika client memulai panggilan grup
    socket.on('start_call', async (data) => {
      try {
        const { groupId } = data;
        
        // Join room panggilan grup
        socket.join(`call_${groupId}`);
        
        // Broadcast ke semua anggota grup bahwa ada panggilan masuk
        socket.to(`group_${groupId}`).emit('message', {
          type: 'incoming_call',
          payload: {
            groupId,
            callId: socket.id,
            callerName: socket.user.fullName,
            groupName: data.groupName
          }
        });
        
        console.log(`${socket.user.username} started a call in group ${groupId}`);
      } catch (error) {
        console.error('Error in start_call event:', error);
      }
    });
    
    // Event ketika client bergabung dengan panggilan grup
    socket.on('join_call', async (data) => {
      try {
        const { groupId } = data;
        
        // Join room panggilan grup
        socket.join(`call_${groupId}`);
        
        // Broadcast ke semua peserta panggilan bahwa ada user baru
        socket.to(`call_${groupId}`).emit('message', {
          type: 'user_joined_call',
          payload: {
            groupId,
            user: {
              _id: socket.user._id,
              fullName: socket.user.fullName,
              username: socket.user.username
            }
          }
        });
        
        console.log(`${socket.user.username} joined a call in group ${groupId}`);
      } catch (error) {
        console.error('Error in join_call event:', error);
      }
    });
    
    // Event ketika client meninggalkan panggilan grup
    socket.on('leave_call', async (data) => {
      try {
        const { groupId } = data;
        
        // Leave room panggilan grup
        socket.leave(`call_${groupId}`);
        
        // Broadcast ke semua peserta panggilan bahwa ada user yang keluar
        socket.to(`call_${groupId}`).emit('message', {
          type: 'user_left_call',
          payload: {
            groupId,
            userId: socket.user._id.toString()
          }
        });
        
        console.log(`${socket.user.username} left a call in group ${groupId}`);
      } catch (error) {
        console.error('Error in leave_call event:', error);
      }
    });
    
    // Event ketika client mengakhiri panggilan grup (hanya creator grup)
    socket.on('end_call', async (data) => {
      try {
        const { groupId, groupName } = data;
        
        // Broadcast ke semua peserta panggilan bahwa panggilan telah berakhir
        io.to(`call_${groupId}`).emit('message', {
          type: 'call_ended',
          payload: {
            groupId,
            groupName,
            endedBy: socket.user.fullName
          }
        });
        
        console.log(`Call in group ${groupId} ended by ${socket.user.username}`);
      } catch (error) {
        console.error('Error in end_call event:', error);
      }
    });
    
    // Event ketika client menolak panggilan
    socket.on('reject_call', async (data) => {
      try {
        const { groupId, callId } = data;
        
        // Kirim notifikasi ke pemanggil bahwa panggilan ditolak
        io.to(callId).emit('message', {
          type: 'call_rejected',
          payload: {
            groupId,
            rejectedBy: socket.user.fullName
          }
        });
        
        console.log(`${socket.user.username} rejected a call in group ${groupId}`);
      } catch (error) {
        console.error('Error in reject_call event:', error);
      }
    });
    
    // Event ketika client terputus
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username} (${socket.id})`);
    });
  });
};

module.exports = { setupSocket };
