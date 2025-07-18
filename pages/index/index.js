const app = getApp();

Page({
  data: {
    debugInfo: 'TouringApp - Loading',
    apiStatus: '',
    backendUrl: ''
  },
  
  onLoad() {
    console.log('Index page loaded');
    
    // Tunggu sebentar untuk menampilkan splash screen
    setTimeout(() => {
      // Periksa status login
      const token = my.getStorageSync({ key: 'token' }).data;
      const userInfo = my.getStorageSync({ key: 'userInfo' }).data;
      
      console.log('Token exists:', !!token);
      console.log('UserInfo exists:', !!userInfo);
      
      if (token && userInfo) {
        // Update global data
        app.globalData.isLoggedIn = true;
        app.globalData.userInfo = userInfo;
        
        // Navigasi ke halaman grup
        console.log('Navigating to groups page');
        my.switchTab({
          url: '/pages/groups/groups'
        });
      } else {
        // Navigasi ke halaman login
        console.log('Navigating to login page');
        my.redirectTo({
          url: '/pages/login/login'
        });
      }
    }, 2000); // Tampilkan splash screen selama 2 detik
  },
  
  // Fungsi untuk memeriksa status backend
  checkBackendStatus() {
    const healthEndpoint = app.globalData.apiBaseUrl.replace('/api', '/health');
    
    my.request({
      url: healthEndpoint,
      method: 'GET',
      timeout: 5000,
      success: (res) => {
        console.log('Backend health check success:', res);
        this.setData({
          apiStatus: 'Online: ' + JSON.stringify(res.data)
        });
      },
      fail: (err) => {
        console.error('Backend health check failed:', err);
        this.setData({
          apiStatus: 'Offline: ' + JSON.stringify(err)
        });
      }
    });
  },
  
  // Fungsi untuk navigasi manual ke halaman lain
  navigateToLogin() {
    my.navigateTo({
      url: '/pages/login/login'
    });
  },
  
  navigateToGroups() {
    my.switchTab({
      url: '/pages/groups/groups'
    });
  }
});
