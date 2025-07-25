const app = getApp();

/**
 * Fungsi untuk melakukan request API dengan token otentikasi
 * @param {String} url - URL endpoint API
 * @param {String} method - Metode HTTP (GET, POST, PUT, DELETE)
 * @param {Object} data - Data yang akan dikirim (opsional)
 * @returns {Promise} Promise yang mengembalikan response dari API
 */
const request = (url, method, data = null) => {
  return new Promise((resolve, reject) => {
    const token = my.getStorageSync({ key: 'token' }).data;
    
    if (!token && url !== '/auth/login' && url !== '/auth/register') {
      // Redirect ke login jika tidak ada token
      my.redirectTo({
        url: '/pages/login/login'
      });
      reject(new Error('Token tidak ditemukan'));
      return;
    }
    
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    my.request({
      url: `${app.globalData.apiBaseUrl}${url}`,
      method,
      headers,
      data,
      dataType: 'json',
      success: (res) => {
        resolve(res.data);
      },
      fail: (err) => {
        // Cek apakah error karena token tidak valid
        if (err.status === 401) {
          // Hapus token dan redirect ke login
          my.removeStorageSync({
            key: 'token'
          });
          
          my.removeStorageSync({
            key: 'userInfo'
          });
          
          app.globalData.isLoggedIn = false;
          app.globalData.userInfo = null;
          
          my.redirectTo({
            url: '/pages/login/login'
          });
        }
        
        reject(err);
      }
    });
  });
};

/**
 * Fungsi untuk login
 * @param {String} username - Username pengguna
 * @param {String} password - Password pengguna
 * @returns {Promise} Promise yang mengembalikan data pengguna dan token
 */
const login = (username, password) => {
  return request('/auth/login', 'POST', { username, password });
};

/**
 * Fungsi untuk register
 * @param {Object} userData - Data pengguna (fullName, email, username, password)
 * @returns {Promise} Promise yang mengembalikan data pengguna dan token
 */
const register = (userData) => {
  return request('/auth/register', 'POST', userData);
};

/**
 * Fungsi untuk mendapatkan profil pengguna
 * @returns {Promise} Promise yang mengembalikan data profil pengguna
 */
const getProfile = () => {
  return request('/auth/profile', 'GET');
};

/**
 * Fungsi untuk mendapatkan daftar grup
 * @returns {Promise} Promise yang mengembalikan daftar grup
 */
const getGroups = () => {
  return request('/groups', 'GET');
};

/**
 * Fungsi untuk membuat grup baru
 * @param {Object} groupData - Data grup (name, description)
 * @returns {Promise} Promise yang mengembalikan data grup yang dibuat
 */
const createGroup = (groupData) => {
  return request('/groups', 'POST', groupData);
};

/**
 * Fungsi untuk mendapatkan detail grup
 * @param {String} groupId - ID grup
 * @returns {Promise} Promise yang mengembalikan detail grup
 */
const getGroupById = (groupId) => {
  return request(`/groups/${groupId}`, 'GET');
};

/**
 * Fungsi untuk mengundang pengguna ke grup
 * @param {String} groupId - ID grup
 * @param {String} email - Email pengguna yang diundang
 * @returns {Promise} Promise yang mengembalikan status undangan
 */
const inviteToGroup = (groupId, email) => {
  return request(`/groups/${groupId}/invite`, 'POST', { email });
};

/**
 * Fungsi untuk mendapatkan daftar undangan
 * @returns {Promise} Promise yang mengembalikan daftar undangan
 */
const getInvitations = () => {
  return request('/groups/invitations', 'GET');
};

/**
 * Fungsi untuk menerima undangan
 * @param {String} invitationId - ID undangan
 * @returns {Promise} Promise yang mengembalikan status undangan
 */
const acceptInvitation = (invitationId) => {
  return request(`/groups/invitations/${invitationId}/accept`, 'PUT');
};

/**
 * Fungsi untuk menolak undangan
 * @param {String} invitationId - ID undangan
 * @returns {Promise} Promise yang mengembalikan status undangan
 */
const rejectInvitation = (invitationId) => {
  return request(`/groups/invitations/${invitationId}/reject`, 'PUT');
};

/**
 * Fungsi untuk mendapatkan token panggilan
 * @param {String} groupId - ID grup
 * @returns {Promise} Promise yang mengembalikan token dan channel name
 */
const getCallToken = (groupId) => {
  return request(`/calls/${groupId}/token`, 'GET');
};

/**
 * Fungsi untuk mencari pengguna
 * @param {String} query - Query pencarian
 * @returns {Promise} Promise yang mengembalikan daftar pengguna
 */
const searchUsers = (query) => {
  return request(`/users/search?query=${encodeURIComponent(query)}`, 'GET');
};

export default {
  login,
  register,
  getProfile,
  getGroups,
  createGroup,
  getGroupById,
  inviteToGroup,
  getInvitations,
  acceptInvitation,
  rejectInvitation,
  getCallToken,
  searchUsers
};
