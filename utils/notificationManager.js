/**
 * Utilitas untuk mengelola notifikasi dalam aplikasi
 */

const app = getApp();
const secureStorage = require('./secureStorage');

/**
 * Menampilkan notifikasi toast
 * @param {String} content - Konten notifikasi
 * @param {String} type - Tipe notifikasi (success, error, warning, info)
 * @param {Number} duration - Durasi tampilan dalam milidetik (default: 2000)
 */
const showToast = (content, type = 'success', duration = 2000) => {
  let image = '';
  
  switch (type) {
    case 'success':
      image = '/assets/success-icon.svg';
      break;
    case 'error':
      image = '/assets/error-icon.svg';
      break;
    case 'warning':
      image = '/assets/warning-icon.svg';
      break;
    case 'info':
      image = '/assets/info-icon.svg';
      break;
    default:
      break;
  }
  
  my.showToast({
    content,
    type: image ? 'image' : 'none',
    image,
    duration
  });
};

/**
 * Menampilkan alert dialog
 * @param {String} title - Judul dialog
 * @param {String} content - Konten dialog
 * @param {Array} buttons - Array tombol (default: OK)
 * @returns {Promise} Promise yang resolve dengan indeks tombol yang ditekan
 */
const showAlert = (title, content, buttons = [{ text: 'OK' }]) => {
  return new Promise((resolve) => {
    my.confirm({
      title,
      content,
      buttons,
      success: (res) => {
        resolve(res.index);
      },
      fail: () => {
        resolve(-1);
      }
    });
  });
};

/**
 * Menampilkan loading dialog
 * @param {String} content - Konten loading
 */
const showLoading = (content = 'Memuat...') => {
  my.showLoading({
    content,
    delay: 0
  });
};

/**
 * Menyembunyikan loading dialog
 */
const hideLoading = () => {
  my.hideLoading();
};

/**
 * Menampilkan notifikasi panggilan masuk
 * @param {Object} callData - Data panggilan (groupName, callerName)
 * @returns {Promise} Promise yang resolve dengan respons pengguna (accept/reject)
 */
const showIncomingCallNotification = (callData) => {
  return new Promise((resolve) => {
    // Periksa pengaturan notifikasi
    const settings = secureStorage.getSettings();
    if (!settings.notificationsEnabled) {
      resolve({ action: 'reject' });
      return;
    }
    
    // Tampilkan notifikasi panggilan masuk
    my.confirm({
      title: 'Panggilan Grup Masuk',
      content: `${callData.callerName} mengundang Anda bergabung dengan panggilan grup "${callData.groupName}"`,
      buttons: [
        { text: 'Tolak' },
        { text: 'Terima' }
      ],
      success: (res) => {
        if (res.index === 1) {
          resolve({ action: 'accept', callData });
        } else {
          resolve({ action: 'reject' });
        }
      },
      fail: () => {
        resolve({ action: 'reject' });
      }
    });
    
    // Putar suara notifikasi
    const audio = my.createInnerAudioContext();
    audio.src = '/assets/ringtone.mp3';
    audio.loop = true;
    audio.play();
    
    // Hentikan suara setelah dialog ditutup
    setTimeout(() => {
      audio.stop();
    }, 30000); // Hentikan setelah 30 detik jika tidak ada respons
  });
};

/**
 * Menampilkan notifikasi undangan grup
 * @param {Object} invitationData - Data undangan (groupName, inviterName)
 */
const showGroupInvitationNotification = (invitationData) => {
  // Periksa pengaturan notifikasi
  const settings = secureStorage.getSettings();
  if (!settings.notificationsEnabled) {
    return;
  }
  
  showToast(
    `${invitationData.inviterName} mengundang Anda ke grup "${invitationData.groupName}"`,
    'info',
    3000
  );
};

export default {
  showToast,
  showAlert,
  showLoading,
  hideLoading,
  showIncomingCallNotification,
  showGroupInvitationNotification
};
