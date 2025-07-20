/**
 * Utilitas untuk mengelola panggilan grup menggunakan simulasi Agora SDK
 * Karena my.createRtcEngine tidak tersedia di lingkungan Mini Program Alipay,
 * kita membuat simulasi untuk fungsi-fungsi yang diperlukan
 */

const app = getApp();

// Event handlers untuk simulasi RTC
let eventHandlers = {};

/**
 * Inisialisasi Simulasi RTC Engine
 * @returns {Object} Simulasi RTC Engine instance
 */
const initRtcEngine = () => {
  try {
    console.log('Initializing simulated RTC engine');
    
    // Buat objek simulasi RTC Engine
    const simulatedRtcEngine = {
      // Menyimpan status internal
      _isMuted: false,
      _isSpeakerOn: true,
      _isConnected: false,
      _channelName: '',
      
      // Metode untuk mendaftarkan event handler
      on: function(eventName, callback) {
        console.log(`Registering event handler for: ${eventName}`);
        eventHandlers[eventName] = callback;
        return this;
      },
      
      // Metode untuk menghapus semua event handler
      removeAllListeners: function() {
        console.log('Removing all event listeners');
        eventHandlers = {};
        return this;
      },
      
      // Inisialisasi engine
      init: function() {
        console.log('Simulated RTC engine initialized');
        return this;
      },
      
      // Konfigurasi profil channel
      setChannelProfile: function(profile) {
        console.log(`Setting channel profile to: ${profile}`);
        return this;
      },
      
      // Aktifkan audio
      enableAudio: function() {
        console.log('Audio enabled');
        return this;
      },
      
      // Nonaktifkan audio
      disableAudio: function() {
        console.log('Audio disabled');
        return this;
      },
      
      // Atur speaker
      setEnableSpeakerphone: function(enabled) {
        console.log(`Speaker ${enabled ? 'enabled' : 'disabled'}`);
        this._isSpeakerOn = enabled;
        return this;
      },
      
      // Gabung channel
      joinChannel: function(token, channelName, info, uid, callback) {
        console.log(`Joining channel: ${channelName} with uid: ${uid}`);
        this._channelName = channelName;
        
        // Simulasi delay jaringan
        setTimeout(() => {
          this._isConnected = true;
          
          // Panggil callback sukses
          if (callback) callback(null);
          
          // Trigger event joinChannelSuccess
          if (eventHandlers.joinChannelSuccess) {
            eventHandlers.joinChannelSuccess(channelName, uid);
          }
          
          // Simulasi user lain bergabung setelah beberapa detik
          setTimeout(() => {
            if (eventHandlers.userJoined) {
              // Simulasi 2 pengguna lain bergabung dengan UID acak
              const randomUid1 = Math.floor(Math.random() * 1000000);
              eventHandlers.userJoined(randomUid1, 0);
              
              setTimeout(() => {
                const randomUid2 = Math.floor(Math.random() * 1000000);
                eventHandlers.userJoined(randomUid2, 0);
              }, 3000);
            }
          }, 2000);
        }, 1500);
        
        return this;
      },
      
      // Keluar channel
      leaveChannel: function(callback) {
        console.log('Leaving channel');
        
        // Simulasi delay jaringan
        setTimeout(() => {
          this._isConnected = false;
          
          // Panggil callback sukses
          if (callback) callback(null);
          
          // Trigger event leaveChannel
          if (eventHandlers.leaveChannel) {
            eventHandlers.leaveChannel();
          }
        }, 1000);
        
        return this;
      },
      
      // Mute audio lokal
      muteLocalAudioStream: function(muted) {
        console.log(`Local audio ${muted ? 'muted' : 'unmuted'}`);
        this._isMuted = muted;
        return this;
      }
    };
    
    return simulatedRtcEngine;
  } catch (error) {
    console.error('Failed to initialize simulated RTC engine:', error);
    throw error;
  }
};

/**
 * Bergabung dengan channel panggilan grup
 * @param {Object} rtcEngine - RTC Engine instance
 * @param {String} token - Token Agora untuk autentikasi
 * @param {String} channelName - Nama channel
 * @param {Number} uid - User ID untuk Agora
 * @returns {Promise} Promise yang resolve ketika berhasil bergabung dengan channel
 */
const joinChannel = (rtcEngine, token, channelName, uid) => {
  return new Promise((resolve, reject) => {
    rtcEngine.joinChannel(token, channelName, '', uid, (err) => {
      if (err) {
        console.error('Failed to join channel:', err);
        reject(err);
      } else {
        console.log('Successfully joined channel:', channelName);
        resolve();
      }
    });
  });
};

/**
 * Keluar dari channel panggilan grup
 * @param {Object} rtcEngine - RTC Engine instance
 * @returns {Promise} Promise yang resolve ketika berhasil keluar dari channel
 */
const leaveChannel = (rtcEngine) => {
  return new Promise((resolve, reject) => {
    rtcEngine.leaveChannel((err) => {
      if (err) {
        console.error('Failed to leave channel:', err);
        reject(err);
      } else {
        console.log('Successfully left channel');
        resolve();
      }
    });
  });
};

/**
 * Mengatur mute/unmute mikrofon
 * @param {Object} rtcEngine - RTC Engine instance
 * @param {Boolean} muted - Status mute (true = muted, false = unmuted)
 */
const setMute = (rtcEngine, muted) => {
  if (muted) {
    rtcEngine.muteLocalAudioStream(true);
  } else {
    rtcEngine.muteLocalAudioStream(false);
  }
};

/**
 * Mengatur speaker/earpiece
 * @param {Object} rtcEngine - RTC Engine instance
 * @param {Boolean} enabled - Status speaker (true = speaker, false = earpiece)
 */
const setSpeaker = (rtcEngine, enabled) => {
  rtcEngine.setEnableSpeakerphone(enabled);
};

/**
 * Mengakhiri panggilan grup (hanya untuk pembuat grup)
 * @param {String} groupId - ID grup
 * @returns {Promise} Promise yang resolve ketika berhasil mengakhiri panggilan
 */
const endGroupCall = async (groupId) => {
  const token = my.getStorageSync({ key: 'token' }).data;
  
  if (!token) {
    throw new Error('Token tidak ditemukan');
  }
  
  try {
    const response = await my.request({
      url: `${app.globalData.apiBaseUrl}/calls/${groupId}/end`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      dataType: 'json'
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to end group call:', error);
    throw error;
  }
};

export default {
  initRtcEngine,
  joinChannel,
  leaveChannel,
  setMute,
  setSpeaker,
  endGroupCall
};
