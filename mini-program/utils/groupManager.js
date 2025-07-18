/**
 * Utilitas untuk mengelola grup dan panggilan grup
 */

const app = getApp();
const secureStorage = require('./secureStorage');
const socketManager = require('./socketManager');

/**
 * Mendapatkan daftar grup yang dimiliki pengguna
 * @returns {Promise} Promise yang mengembalikan daftar grup
 */
const getUserGroups = async () => {
  try {
    const token = secureStorage.getToken();
    
    if (!token) {
      throw new Error('Token tidak ditemukan');
    }
    
    const response = await my.request({
      url: `${app.globalData.apiBaseUrl}/groups`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      dataType: 'json'
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to get user groups:', error);
    throw error;
  }
};

/**
 * Mendapatkan detail grup berdasarkan ID
 * @param {String} groupId - ID grup
 * @returns {Promise} Promise yang mengembalikan detail grup
 */
const getGroupDetails = async (groupId) => {
  try {
    const token = secureStorage.getToken();
    
    if (!token) {
      throw new Error('Token tidak ditemukan');
    }
    
    const response = await my.request({
      url: `${app.globalData.apiBaseUrl}/groups/${groupId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      dataType: 'json'
    });
    
    return response.data;
  } catch (error) {
    console.error(`Failed to get group details for ${groupId}:`, error);
    throw error;
  }
};

/**
 * Membuat grup baru
 * @param {Object} groupData - Data grup (name, description)
 * @returns {Promise} Promise yang mengembalikan grup yang dibuat
 */
const createGroup = async (groupData) => {
  try {
    const token = secureStorage.getToken();
    
    if (!token) {
      throw new Error('Token tidak ditemukan');
    }
    
    const response = await my.request({
      url: `${app.globalData.apiBaseUrl}/groups`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: groupData,
      dataType: 'json'
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to create group:', error);
    throw error;
  }
};

/**
 * Mengundang pengguna ke grup
 * @param {String} groupId - ID grup
 * @param {String} email - Email pengguna yang diundang
 * @returns {Promise} Promise yang mengembalikan status undangan
 */
const inviteUserToGroup = async (groupId, email) => {
  try {
    const token = secureStorage.getToken();
    
    if (!token) {
      throw new Error('Token tidak ditemukan');
    }
    
    const response = await my.request({
      url: `${app.globalData.apiBaseUrl}/groups/${groupId}/invite`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: { email },
      dataType: 'json'
    });
    
    return response.data;
  } catch (error) {
    console.error(`Failed to invite user to group ${groupId}:`, error);
    throw error;
  }
};

/**
 * Mendapatkan daftar undangan grup
 * @returns {Promise} Promise yang mengembalikan daftar undangan
 */
const getGroupInvitations = async () => {
  try {
    const token = secureStorage.getToken();
    
    if (!token) {
      throw new Error('Token tidak ditemukan');
    }
    
    const response = await my.request({
      url: `${app.globalData.apiBaseUrl}/groups/invitations`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      dataType: 'json'
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to get group invitations:', error);
    throw error;
  }
};

/**
 * Menerima undangan grup
 * @param {String} invitationId - ID undangan
 * @returns {Promise} Promise yang mengembalikan status undangan
 */
const acceptGroupInvitation = async (invitationId) => {
  try {
    const token = secureStorage.getToken();
    
    if (!token) {
      throw new Error('Token tidak ditemukan');
    }
    
    const response = await my.request({
      url: `${app.globalData.apiBaseUrl}/groups/invitations/${invitationId}/accept`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      dataType: 'json'
    });
    
    return response.data;
  } catch (error) {
    console.error(`Failed to accept invitation ${invitationId}:`, error);
    throw error;
  }
};

/**
 * Menolak undangan grup
 * @param {String} invitationId - ID undangan
 * @returns {Promise} Promise yang mengembalikan status undangan
 */
const rejectGroupInvitation = async (invitationId) => {
  try {
    const token = secureStorage.getToken();
    
    if (!token) {
      throw new Error('Token tidak ditemukan');
    }
    
    const response = await my.request({
      url: `${app.globalData.apiBaseUrl}/groups/invitations/${invitationId}/reject`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      dataType: 'json'
    });
    
    return response.data;
  } catch (error) {
    console.error(`Failed to reject invitation ${invitationId}:`, error);
    throw error;
  }
};

/**
 * Memulai panggilan grup
 * @param {String} groupId - ID grup
 * @returns {Promise} Promise yang mengembalikan token panggilan
 */
const startGroupCall = async (groupId) => {
  try {
    // Dapatkan token panggilan dari server
    const token = secureStorage.getToken();
    
    if (!token) {
      throw new Error('Token tidak ditemukan');
    }
    
    const response = await my.request({
      url: `${app.globalData.apiBaseUrl}/calls/${groupId}/token`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      dataType: 'json'
    });
    
    // Dapatkan detail grup untuk nama grup
    const groupDetails = await getGroupDetails(groupId);
    
    // Kirim sinyal ke server bahwa panggilan dimulai
    socketManager.sendMessage('start_call', {
      groupId,
      groupName: groupDetails.name
    });
    
    return response.data;
  } catch (error) {
    console.error(`Failed to start call for group ${groupId}:`, error);
    throw error;
  }
};

/**
 * Bergabung dengan panggilan grup
 * @param {String} groupId - ID grup
 * @returns {Promise} Promise yang mengembalikan token panggilan
 */
const joinGroupCall = async (groupId) => {
  try {
    // Dapatkan token panggilan dari server
    const token = secureStorage.getToken();
    
    if (!token) {
      throw new Error('Token tidak ditemukan');
    }
    
    const response = await my.request({
      url: `${app.globalData.apiBaseUrl}/calls/${groupId}/token`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      dataType: 'json'
    });
    
    // Kirim sinyal ke server bahwa pengguna bergabung dengan panggilan
    socketManager.sendMessage('join_call', {
      groupId
    });
    
    return response.data;
  } catch (error) {
    console.error(`Failed to join call for group ${groupId}:`, error);
    throw error;
  }
};

/**
 * Meninggalkan panggilan grup
 * @param {String} groupId - ID grup
 * @returns {Promise} Promise yang resolve ketika berhasil meninggalkan panggilan
 */
const leaveGroupCall = async (groupId) => {
  try {
    // Kirim sinyal ke server bahwa pengguna meninggalkan panggilan
    socketManager.sendMessage('leave_call', {
      groupId
    });
    
    return true;
  } catch (error) {
    console.error(`Failed to leave call for group ${groupId}:`, error);
    throw error;
  }
};

/**
 * Mengakhiri panggilan grup (hanya untuk pembuat grup)
 * @param {String} groupId - ID grup
 * @returns {Promise} Promise yang resolve ketika berhasil mengakhiri panggilan
 */
const endGroupCall = async (groupId) => {
  try {
    const token = secureStorage.getToken();
    
    if (!token) {
      throw new Error('Token tidak ditemukan');
    }
    
    // Dapatkan detail grup untuk nama grup
    const groupDetails = await getGroupDetails(groupId);
    
    // Kirim sinyal ke server bahwa panggilan diakhiri
    socketManager.sendMessage('end_call', {
      groupId,
      groupName: groupDetails.name
    });
    
    // Panggil API untuk mengakhiri panggilan
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
    console.error(`Failed to end call for group ${groupId}:`, error);
    throw error;
  }
};

export default {
  getUserGroups,
  getGroupDetails,
  createGroup,
  inviteUserToGroup,
  getGroupInvitations,
  acceptGroupInvitation,
  rejectGroupInvitation,
  startGroupCall,
  joinGroupCall,
  leaveGroupCall,
  endGroupCall
};
