/**
 * Utilitas untuk mengelola panggilan grup menggunakan Agora SDK
 */

const app = getApp();

/**
 * Inisialisasi Agora RTC Engine
 * @returns {Object} RTC Engine instance
 */
const initRtcEngine = () => {
  try {
    const rtcEngine = my.createRtcEngine();
    
    // Konfigurasi RTC Engine
    rtcEngine.setChannelProfile('communication');
    rtcEngine.enableAudio();
    rtcEngine.setEnableSpeakerphone(true);
    
    return rtcEngine;
  } catch (error) {
    console.error('Failed to initialize RTC engine:', error);
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
