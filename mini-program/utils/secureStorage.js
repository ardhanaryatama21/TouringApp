/**
 * Utilitas untuk menyimpan dan mengambil data sensitif dengan aman
 */

/**
 * Menyimpan token autentikasi dengan aman
 * @param {String} token - Token JWT
 */
const saveToken = (token) => {
  try {
    my.setStorageSync({
      key: 'token',
      data: token
    });
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

/**
 * Mengambil token autentikasi
 * @returns {String|null} Token JWT atau null jika tidak ada
 */
const getToken = () => {
  try {
    const result = my.getStorageSync({ key: 'token' });
    return result.data || null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Menghapus token autentikasi
 */
const removeToken = () => {
  try {
    my.removeStorageSync({
      key: 'token'
    });
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

/**
 * Menyimpan informasi pengguna dengan aman
 * @param {Object} userInfo - Informasi pengguna
 */
const saveUserInfo = (userInfo) => {
  try {
    my.setStorageSync({
      key: 'userInfo',
      data: userInfo
    });
  } catch (error) {
    console.error('Error saving user info:', error);
  }
};

/**
 * Mengambil informasi pengguna
 * @returns {Object|null} Informasi pengguna atau null jika tidak ada
 */
const getUserInfo = () => {
  try {
    const result = my.getStorageSync({ key: 'userInfo' });
    return result.data || null;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};

/**
 * Menghapus informasi pengguna
 */
const removeUserInfo = () => {
  try {
    my.removeStorageSync({
      key: 'userInfo'
    });
  } catch (error) {
    console.error('Error removing user info:', error);
  }
};

/**
 * Menyimpan pengaturan aplikasi
 * @param {Object} settings - Pengaturan aplikasi
 */
const saveSettings = (settings) => {
  try {
    my.setStorageSync({
      key: 'settings',
      data: settings
    });
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

/**
 * Mengambil pengaturan aplikasi
 * @returns {Object} Pengaturan aplikasi dengan nilai default
 */
const getSettings = () => {
  try {
    const result = my.getStorageSync({ key: 'settings' });
    return result.data || {
      notificationsEnabled: true,
      speakerEnabled: true
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      notificationsEnabled: true,
      speakerEnabled: true
    };
  }
};

/**
 * Logout - Menghapus semua data pengguna
 */
const clearAllUserData = () => {
  removeToken();
  removeUserInfo();
  
  // Hapus data lain yang mungkin ada
  try {
    my.clearStorageSync();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

export default {
  saveToken,
  getToken,
  removeToken,
  saveUserInfo,
  getUserInfo,
  removeUserInfo,
  saveSettings,
  getSettings,
  clearAllUserData
};
