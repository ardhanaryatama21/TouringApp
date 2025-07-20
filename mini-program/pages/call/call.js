const app = getApp();

Page({
  data: {
    groupId: '',
    groupName: '',
    isLoading: true,
    loadingText: 'Mempersiapkan panggilan...',
    isConnected: false,
    callStatusText: 'Menghubungkan...',
    isMuted: false,
    isSpeakerOn: true,
    participants: [],
    showErrorModal: false,
    errorMessage: '',
    rtcClient: null,
    rtcToken: '',
    channelName: ''
  },
  
  onLoad(query) {
    // Periksa status login
    if (!app.globalData.isLoggedIn) {
      my.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    
    if (query.groupId && query.groupName) {
      this.setData({
        groupId: query.groupId,
        groupName: query.groupName
      });
      
      // Inisialisasi Agora SDK
      this.initializeAgoraSDK();
    } else {
      this.showError('Informasi grup tidak lengkap');
    }
  },
  
  onUnload() {
    // Bersihkan saat meninggalkan halaman
    this.leaveChannel();
  },
  
  // Inisialisasi Agora SDK (simulasi)
  initializeAgoraSDK() {
    const userInfo = my.getStorageSync({ key: 'userInfo' }).data;
    
    // Import callManager untuk menggunakan simulasi RTC engine
    const callManager = require('../../utils/callManager').default;
    
    try {
      // Inisialisasi simulasi RTC engine
      const rtcClient = callManager.initRtcEngine();
      
      if (!rtcClient) {
        throw new Error('Gagal membuat RTC Engine');
      }
      
      // Simpan referensi client
      this.setData({ 
        rtcClient,
        rtcToken: 'simulated-token', // Token simulasi
        channelName: `group_${this.data.groupId}` // Channel name simulasi
      });
      
      // Setup event listeners
      rtcClient.on('error', this.handleRtcError.bind(this));
      rtcClient.on('joinChannelSuccess', this.handleJoinChannelSuccess.bind(this));
      rtcClient.on('leaveChannel', this.handleLeaveChannel.bind(this));
      rtcClient.on('userJoined', this.handleUserJoined.bind(this));
      rtcClient.on('userOffline', this.handleUserOffline.bind(this));
      rtcClient.on('audioVolumeIndication', this.handleAudioVolumeIndication.bind(this));
      
      // Inisialisasi RTC Engine
      rtcClient.init();
      
      // Konfigurasi audio
      rtcClient.enableAudio();
      rtcClient.setEnableSpeakerphone(true);
      
      // Gabung ke channel
      this.setData({ loadingText: 'Bergabung dengan panggilan...' });
      rtcClient.joinChannel(this.data.rtcToken, this.data.channelName, null, userInfo._id);
      
      // Tambahkan diri sendiri ke daftar peserta
      this.setData({
        participants: [{
          uid: userInfo._id,
          name: userInfo.fullName,
          isMe: true,
          isMuted: false,
          isSpeaking: false
        }]
      });
    } catch (error) {
      console.error('Initialize Simulated RTC engine error:', error);
      this.showError(error.message || 'Gagal memulai panggilan');
    }
  },
  
  // Mendapatkan token Agora dari server
  getAgoraToken() {
    return new Promise((resolve, reject) => {
      const token = my.getStorageSync({ key: 'token' }).data;
      if (!token) {
        reject(new Error('Token autentikasi tidak ditemukan'));
        return;
      }
      
      my.request({
        url: `${app.globalData.apiBaseUrl}/calls/${this.data.groupId}/token`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        dataType: 'json',
        success: (res) => {
          if (res.data && res.data.token) {
            resolve({
              token: res.data.token,
              channelName: res.data.channelName
            });
          } else {
            reject(new Error('Token tidak valid'));
          }
        },
        fail: (err) => {
          console.error('Get Agora token error:', err);
          reject(new Error('Gagal mendapatkan token panggilan'));
        }
      });
    });
  },
  
  // Event handlers untuk Agora RTC
  handleRtcError(err) {
    console.error('RTC error:', err);
    this.showError(`Error: ${err.code} - ${err.message || 'Terjadi kesalahan pada panggilan'}`);
  },
  
  handleJoinChannelSuccess(channel, uid) {
    console.log('Join channel success:', channel, uid);
    this.setData({
      isLoading: false,
      isConnected: true,
      callStatusText: 'Terhubung'
    });
  },
  
  handleLeaveChannel() {
    console.log('Leave channel');
    this.setData({
      isConnected: false,
      callStatusText: 'Terputus'
    });
  },
  
  handleUserJoined(uid, elapsed) {
    console.log('User joined:', uid, elapsed);
    
    // Dapatkan informasi pengguna dari server
    this.getUserInfo(uid)
      .then(userInfo => {
        if (userInfo) {
          // Tambahkan pengguna ke daftar peserta
          const newParticipants = [...this.data.participants];
          newParticipants.push({
            uid: uid,
            name: userInfo.fullName,
            isMe: false,
            isMuted: false,
            isSpeaking: false
          });
          
          this.setData({
            participants: newParticipants
          });
        }
      })
      .catch(error => {
        console.error('Get user info error:', error);
      });
  },
  
  handleUserOffline(uid, reason) {
    console.log('User offline:', uid, reason);
    
    // Hapus pengguna dari daftar peserta
    const newParticipants = this.data.participants.filter(p => p.uid !== uid);
    this.setData({
      participants: newParticipants
    });
  },
  
  handleAudioVolumeIndication(speakers, totalVolume) {
    // Update status berbicara untuk setiap peserta
    if (speakers && speakers.length > 0) {
      const newParticipants = [...this.data.participants];
      
      speakers.forEach(speaker => {
        const index = newParticipants.findIndex(p => p.uid === speaker.uid);
        if (index !== -1) {
          // Jika volume lebih dari threshold, tandai sebagai berbicara
          newParticipants[index].isSpeaking = speaker.volume > 50;
        }
      });
      
      this.setData({
        participants: newParticipants
      });
    }
  },
  
  // Mendapatkan informasi pengguna dari server
  getUserInfo(uid) {
    return new Promise((resolve, reject) => {
      const token = my.getStorageSync({ key: 'token' }).data;
      if (!token) {
        reject(new Error('Token autentikasi tidak ditemukan'));
        return;
      }
      
      my.request({
        url: `${app.globalData.apiBaseUrl}/users/${uid}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        dataType: 'json',
        success: (res) => {
          if (res.data) {
            resolve(res.data);
          } else {
            resolve({ fullName: 'Pengguna' });
          }
        },
        fail: (err) => {
          console.error('Get user info error:', err);
          resolve({ fullName: 'Pengguna' });
        }
      });
    });
  },
  
  // Kontrol panggilan
  toggleMute() {
    const { rtcClient, isMuted } = this.data;
    
    if (rtcClient) {
      if (isMuted) {
        rtcClient.enableAudio();
      } else {
        rtcClient.disableAudio();
      }
      
      // Update status mute untuk diri sendiri
      const newParticipants = [...this.data.participants];
      const myIndex = newParticipants.findIndex(p => p.isMe);
      if (myIndex !== -1) {
        newParticipants[myIndex].isMuted = !isMuted;
      }
      
      this.setData({
        isMuted: !isMuted,
        participants: newParticipants
      });
    }
  },
  
  toggleSpeaker() {
    const { rtcClient, isSpeakerOn } = this.data;
    
    if (rtcClient) {
      rtcClient.setEnableSpeakerphone(!isSpeakerOn);
      
      this.setData({
        isSpeakerOn: !isSpeakerOn
      });
    }
  },
  
  leaveCall() {
    my.showModal({
      title: 'Tinggalkan Panggilan',
      content: 'Apakah Anda yakin ingin meninggalkan panggilan?',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak',
      success: (result) => {
        if (result.confirm) {
          this.leaveChannel();
          my.navigateBack();
        }
      }
    });
  },
  
  endCall() {
    my.showModal({
      title: 'Akhiri Panggilan',
      content: 'Apakah Anda yakin ingin mengakhiri panggilan untuk semua peserta?',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Tidak',
      success: (result) => {
        if (result.confirm) {
          // Kirim sinyal ke server untuk mengakhiri panggilan
          this.endGroupCall()
            .then(() => {
              this.leaveChannel();
              my.navigateBack();
            })
            .catch(error => {
              console.error('End call error:', error);
              // Tetap keluar dari panggilan meskipun gagal mengakhiri untuk semua
              this.leaveChannel();
              my.navigateBack();
            });
        }
      }
    });
  },
  
  // Meninggalkan channel Agora
  leaveChannel() {
    const { rtcClient } = this.data;
    
    if (rtcClient) {
      rtcClient.leaveChannel();
      rtcClient.removeAllListeners();
    }
  },
  
  // Mengakhiri panggilan grup untuk semua peserta
  endGroupCall() {
    return new Promise((resolve, reject) => {
      const token = my.getStorageSync({ key: 'token' }).data;
      if (!token) {
        reject(new Error('Token autentikasi tidak ditemukan'));
        return;
      }
      
      my.request({
        url: `${app.globalData.apiBaseUrl}/calls/${this.data.groupId}/end`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        dataType: 'json',
        success: (res) => {
          resolve(res.data);
        },
        fail: (err) => {
          console.error('End group call error:', err);
          reject(new Error('Gagal mengakhiri panggilan grup'));
        }
      });
    });
  },
  
  // Menampilkan error
  showError(message) {
    this.setData({
      isLoading: false,
      showErrorModal: true,
      errorMessage: message
    });
  },
  
  // Menutup modal error
  handleErrorModalClose() {
    this.setData({
      showErrorModal: false
    });
    my.navigateBack();
  }
});
