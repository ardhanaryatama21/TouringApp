const app = getApp();

Page({
  data: {
    userInfo: null,
    groupCount: 0,
    notificationsEnabled: true,
    speakerEnabled: true,
    showAboutModal: false,
    showLogoutModal: false
  },
  
  onLoad() {
    // Periksa status login
    if (!app.globalData.isLoggedIn) {
      my.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    
    // Muat data pengguna dari storage
    const userInfo = my.getStorageSync({ key: 'userInfo' }).data;
    if (userInfo) {
      this.setData({ userInfo });
    }
    
    // Muat pengaturan dari storage
    const settings = my.getStorageSync({ key: 'settings' }).data || {};
    this.setData({
      notificationsEnabled: settings.notificationsEnabled !== false,
      speakerEnabled: settings.speakerEnabled !== false
    });
    
    // Ambil jumlah grup dari server
    this.fetchGroupCount();
  },
  
  onShow() {
    // Refresh data saat halaman muncul kembali
    this.fetchGroupCount();
  },
  
  // Ambil jumlah grup dari server
  fetchGroupCount() {
    const token = my.getStorageSync({ key: 'token' }).data;
    if (!token) return;
    
    my.request({
      url: `${app.globalData.apiBaseUrl}/groups`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      dataType: 'json',
      success: (res) => {
        if (res.data) {
          this.setData({
            groupCount: res.data.length
          });
        }
      },
      fail: (err) => {
        console.error('Fetch groups error:', err);
      }
    });
  },
  
  // Toggle pengaturan notifikasi
  toggleNotifications(e) {
    const notificationsEnabled = e.detail.value;
    
    // Simpan pengaturan ke storage
    const settings = my.getStorageSync({ key: 'settings' }).data || {};
    settings.notificationsEnabled = notificationsEnabled;
    
    my.setStorageSync({
      key: 'settings',
      data: settings
    });
    
    this.setData({ notificationsEnabled });
  },
  
  // Toggle pengaturan speaker
  toggleSpeaker(e) {
    const speakerEnabled = e.detail.value;
    
    // Simpan pengaturan ke storage
    const settings = my.getStorageSync({ key: 'settings' }).data || {};
    settings.speakerEnabled = speakerEnabled;
    
    my.setStorageSync({
      key: 'settings',
      data: settings
    });
    
    this.setData({ speakerEnabled });
  },
  
  // Tampilkan modal tentang aplikasi
  showAbout() {
    this.setData({
      showAboutModal: true
    });
  },
  
  hideAboutModal() {
    this.setData({
      showAboutModal: false
    });
  },
  
  // Proses logout
  handleLogout() {
    this.setData({
      showLogoutModal: true
    });
  },
  
  cancelLogout() {
    this.setData({
      showLogoutModal: false
    });
  },
  
  confirmLogout() {
    // Hapus token dan data pengguna
    my.removeStorageSync({
      key: 'token'
    });
    
    my.removeStorageSync({
      key: 'userInfo'
    });
    
    // Update global data
    app.globalData.isLoggedIn = false;
    app.globalData.userInfo = null;
    
    // Navigasi ke halaman login
    my.redirectTo({
      url: '/pages/login/login'
    });
  }
});
