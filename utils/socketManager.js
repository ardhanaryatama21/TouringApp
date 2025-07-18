/**
 * Utilitas untuk mengelola koneksi Socket.io untuk komunikasi real-time
 */

const app = getApp();
const secureStorage = require('./secureStorage');
const notificationManager = require('./notificationManager');

// Menyimpan instance socket
let socket = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Inisialisasi koneksi Socket.io
 * @returns {Promise} Promise yang resolve ketika koneksi berhasil
 */
const initializeSocket = () => {
  return new Promise((resolve, reject) => {
    const token = secureStorage.getToken();
    
    if (!token) {
      reject(new Error('Token tidak ditemukan'));
      return;
    }
    
    // Gunakan URL API base yang sama dengan endpoint REST
    const socketUrl = app.globalData.apiBaseUrl.replace('/api', '');
    
    // Coba sambungkan ke server Socket.io
    try {
      // Alipay Mini Program tidak memiliki Socket.io bawaan
      // Kita perlu menggunakan WebSocket API yang disediakan
      
      // Buat koneksi WebSocket
      socket = my.connectSocket({
        url: `${socketUrl}/socket.io/?token=${token}&EIO=3&transport=websocket`,
        header: {
          'content-type': 'application/json'
        },
        success: () => {
          console.log('WebSocket connection established');
        },
        fail: (err) => {
          console.error('WebSocket connection failed:', err);
          reject(err);
        }
      });
      
      // Menangani event koneksi
      socket.onOpen(() => {
        console.log('WebSocket connection opened');
        isConnected = true;
        reconnectAttempts = 0;
        setupEventListeners();
        resolve(socket);
      });
      
      // Menangani event error
      socket.onError((err) => {
        console.error('WebSocket error:', err);
        isConnected = false;
        
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          setTimeout(() => {
            initializeSocket()
              .then(resolve)
              .catch(reject);
          }, 3000 * reconnectAttempts); // Backoff eksponensial
        } else {
          reject(err);
        }
      });
      
      // Menangani event penutupan koneksi
      socket.onClose(() => {
        console.log('WebSocket connection closed');
        isConnected = false;
        
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          setTimeout(() => {
            initializeSocket()
              .then(resolve)
              .catch(reject);
          }, 3000 * reconnectAttempts); // Backoff eksponensial
        }
      });
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      reject(error);
    }
  });
};

/**
 * Setup event listeners untuk Socket.io
 */
const setupEventListeners = () => {
  if (!socket) return;
  
  // Menangani pesan yang masuk
  socket.onMessage((res) => {
    try {
      // Parse data pesan
      const data = JSON.parse(res.data);
      
      // Cek tipe pesan
      switch (data.type) {
        case 'group_invitation':
          handleGroupInvitation(data.payload);
          break;
        case 'incoming_call':
          handleIncomingCall(data.payload);
          break;
        case 'call_ended':
          handleCallEnded(data.payload);
          break;
        case 'user_joined_call':
          handleUserJoinedCall(data.payload);
          break;
        case 'user_left_call':
          handleUserLeftCall(data.payload);
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing socket message:', error);
    }
  });
};

/**
 * Menangani undangan grup
 * @param {Object} data - Data undangan
 */
const handleGroupInvitation = (data) => {
  notificationManager.showGroupInvitationNotification({
    groupName: data.groupName,
    inviterName: data.inviterName
  });
  
  // Refresh halaman grup jika sedang aktif
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  
  if (currentPage && currentPage.route === 'pages/groups/groups') {
    currentPage.fetchInvitations();
  }
};

/**
 * Menangani panggilan masuk
 * @param {Object} data - Data panggilan
 */
const handleIncomingCall = async (data) => {
  const response = await notificationManager.showIncomingCallNotification({
    groupName: data.groupName,
    callerName: data.callerName
  });
  
  if (response.action === 'accept') {
    // Navigasi ke halaman panggilan
    my.navigateTo({
      url: `/pages/call/call?groupId=${data.groupId}`
    });
  } else {
    // Kirim sinyal bahwa pengguna menolak panggilan
    sendMessage('reject_call', {
      groupId: data.groupId,
      callId: data.callId
    });
  }
};

/**
 * Menangani panggilan yang diakhiri
 * @param {Object} data - Data panggilan
 */
const handleCallEnded = (data) => {
  // Tampilkan notifikasi bahwa panggilan telah berakhir
  notificationManager.showToast(
    `Panggilan grup "${data.groupName}" telah berakhir`,
    'info'
  );
  
  // Jika pengguna sedang dalam panggilan, navigasi kembali ke halaman grup
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  
  if (currentPage && currentPage.route === 'pages/call/call') {
    // Periksa apakah pengguna sedang dalam panggilan yang sama
    if (currentPage.data.groupId === data.groupId) {
      my.navigateBack();
    }
  }
};

/**
 * Menangani pengguna yang bergabung dengan panggilan
 * @param {Object} data - Data pengguna
 */
const handleUserJoinedCall = (data) => {
  // Perbarui daftar peserta jika pengguna sedang dalam panggilan
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  
  if (currentPage && currentPage.route === 'pages/call/call') {
    // Periksa apakah pengguna sedang dalam panggilan yang sama
    if (currentPage.data.groupId === data.groupId) {
      currentPage.addParticipant(data.user);
    }
  }
};

/**
 * Menangani pengguna yang meninggalkan panggilan
 * @param {Object} data - Data pengguna
 */
const handleUserLeftCall = (data) => {
  // Perbarui daftar peserta jika pengguna sedang dalam panggilan
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  
  if (currentPage && currentPage.route === 'pages/call/call') {
    // Periksa apakah pengguna sedang dalam panggilan yang sama
    if (currentPage.data.groupId === data.groupId) {
      currentPage.removeParticipant(data.userId);
    }
  }
};

/**
 * Kirim pesan melalui Socket.io
 * @param {String} type - Tipe pesan
 * @param {Object} payload - Data pesan
 */
const sendMessage = (type, payload) => {
  if (!socket || !isConnected) {
    console.error('Socket not connected');
    return;
  }
  
  const message = JSON.stringify({
    type,
    payload
  });
  
  socket.send({
    data: message,
    success: () => {
      console.log(`Message sent: ${type}`);
    },
    fail: (err) => {
      console.error(`Failed to send message: ${type}`, err);
    }
  });
};

/**
 * Tutup koneksi Socket.io
 */
const closeConnection = () => {
  if (socket) {
    socket.close({
      success: () => {
        console.log('WebSocket connection closed');
      },
      fail: (err) => {
        console.error('Failed to close WebSocket connection:', err);
      }
    });
    
    socket = null;
    isConnected = false;
  }
};

/**
 * Cek status koneksi Socket.io
 * @returns {Boolean} Status koneksi
 */
const isSocketConnected = () => {
  return isConnected;
};

export default {
  initializeSocket,
  sendMessage,
  closeConnection,
  isSocketConnected
};
