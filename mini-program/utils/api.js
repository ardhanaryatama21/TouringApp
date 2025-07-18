const app = getApp();

/**
 * Fungsi untuk melakukan request API dengan token otentikasi
 * @param {String} url - URL endpoint API
 * @param {String} method - Metode HTTP (GET, POST, PUT, DELETE)
 * @param {Object} data - Data yang akan dikirim (opsional)
 * @returns {Promise} Promise yang mengembalikan response dari API
 */
const request = (url, method, data = {}) => {
  const app = getApp();
  const token = my.getStorageSync({ key: 'token' }).data || '';
  
  // FORCE set apiBaseUrl to Railway HTTPS
  app.globalData.apiBaseUrl = 'https://touringapp-backend-production.up.railway.app';
  
  // FORCE fix URL path jika tidak menggunakan /api prefix
  if (url.includes('/auth/') && !url.includes('/api/auth/')) {
    url = url.replace('/auth/', '/api/auth/');
  }
  
  const fullUrl = `${app.globalData.apiBaseUrl}${url}`;
  
  console.log('=== DEBUG API REQUEST START ===');
  console.log('API Request URL:', fullUrl);
  console.log('API Base URL:', app.globalData.apiBaseUrl);
  console.log('API Path:', url);
  console.log('API Method:', method);
  console.log('API Data:', JSON.stringify(data));
  
  // Verifikasi protokol HTTPS
  if (app.globalData.apiBaseUrl.startsWith('http://')) {
    console.error('ERROR: API Base URL menggunakan HTTP, bukan HTTPS!');
    console.error('Ini dapat menyebabkan error "http scheme is not allowed"');
    console.error('Base URL saat ini:', app.globalData.apiBaseUrl);
    // Auto-fix URL jika memungkinkan
    app.globalData.apiBaseUrl = app.globalData.apiBaseUrl.replace('http://', 'https://');
    console.log('URL diperbaiki menjadi:', app.globalData.apiBaseUrl);
  }
  
  return new Promise((resolve, reject) => {
    if (!token && url !== '/api/auth/login' && url !== '/api/auth/register') {
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
    
    // Fix URL jika perlu
    const fixedUrl = url.includes('/auth/') && !url.includes('/api/auth/') 
      ? url.replace('/auth/', '/api/auth/') 
      : url;
    
    // Pastikan menggunakan base URL dengan HTTPS
    let apiBaseUrl = app.globalData.apiBaseUrl;
    if (apiBaseUrl.startsWith('http://')) {
      console.error('ERROR: Mengubah HTTP ke HTTPS untuk request');
      apiBaseUrl = apiBaseUrl.replace('http://', 'https://');
    }
    
    const finalUrl = `${apiBaseUrl}${fixedUrl}`;
    console.log('Final Request URL:', finalUrl);
    console.log('URL Protocol:', finalUrl.startsWith('https://') ? 'HTTPS (aman)' : 'HTTP (tidak aman)');
    console.log('=== DEBUG API REQUEST END ===');
    
    my.request({
      url: finalUrl,
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
  return request('/api/auth/login', 'POST', { username, password });
};

/**
 * Fungsi untuk register
 * @param {Object} userData - Data pengguna (fullName, email, username, password)
 * @returns {Promise} Promise yang mengembalikan data pengguna dan token
 */
const register = (userData) => {
  return request('/api/auth/register', 'POST', userData);
};

/**
 * Fungsi untuk mendapatkan profil pengguna
 * @returns {Promise} Promise yang mengembalikan data profil pengguna
 */
const getProfile = () => {
  return request('/api/auth/profile', 'GET');
};

/**
 * Fungsi untuk mendapatkan daftar grup
 * @returns {Promise} Promise yang mengembalikan daftar grup
 */
const getGroups = () => {
  return request('/api/groups', 'GET');
};

/**
 * Fungsi untuk membuat grup baru
 * @param {Object} groupData - Data grup (name, description)
 * @returns {Promise} Promise yang mengembalikan data grup yang dibuat
 */
const createGroup = (groupData) => {
  return request('/api/groups', 'POST', groupData);
};

/**
 * Fungsi untuk mendapatkan detail grup
 * @param {String} groupId - ID grup
 * @returns {Promise} Promise yang mengembalikan detail grup
 */
const getGroupById = (groupId) => {
  return request(`/api/groups/${groupId}`, 'GET');
};

/**
 * Fungsi untuk mengundang pengguna ke grup
 * @param {String} groupId - ID grup
 * @param {String} email - Email pengguna yang diundang
 * @returns {Promise} Promise yang mengembalikan status undangan
 */
const inviteToGroup = (groupId, email) => {
  return request(`/api/groups/${groupId}/invite`, 'POST', { email });
};

/**
 * Fungsi untuk mendapatkan daftar undangan
 * @returns {Promise} Promise yang mengembalikan daftar undangan
 */
const getInvitations = () => {
  return request('/api/groups/invitations', 'GET');
};

/**
 * Fungsi untuk menerima undangan
 * @param {String} invitationId - ID undangan
 * @returns {Promise} Promise yang mengembalikan status undangan
 */
const acceptInvitation = (invitationId) => {
  return request(`/api/groups/invitations/${invitationId}/accept`, 'PUT');
};

/**
 * Fungsi untuk menolak undangan
 * @param {String} invitationId - ID undangan
 * @returns {Promise} Promise yang mengembalikan status undangan
 */
const rejectInvitation = (invitationId) => {
  return request(`/api/groups/invitations/${invitationId}/reject`, 'PUT');
};

/**
 * Fungsi untuk mendapatkan token panggilan
 * @param {String} groupId - ID grup
 * @returns {Promise} Promise yang mengembalikan token dan channel name
 */
const getCallToken = (groupId) => {
  return request(`/api/calls/${groupId}/token`, 'GET');
};

/**
 * Fungsi untuk mencari pengguna
 * @param {String} query - Query pencarian
 * @returns {Promise} Promise yang mengembalikan daftar pengguna
 */
const searchUsers = (query) => {
  return request(`/api/users/search?query=${encodeURIComponent(query)}`, 'GET');
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
