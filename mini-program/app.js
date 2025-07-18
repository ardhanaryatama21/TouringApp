App({
  onLaunch(options) {
    console.log('App onLaunch - start');
    console.log('=== DEBUG APP INITIALIZATION ===');
    console.log('API Base URL (initial):', this.globalData.apiBaseUrl);
    
    // FORCE set apiBaseUrl to Railway HTTPS
    this.globalData.apiBaseUrl = 'https://touringapp-backend-production.up.railway.app';
    console.log('API Base URL (forced):', this.globalData.apiBaseUrl);
    
    // CRITICAL: Hapus semua cache yang mungkin menyimpan URL lama
    try {
      my.clearStorageSync();
      console.log('Cache cleared successfully');
    } catch (e) {
      console.error('Error clearing cache:', e);
    }
    
    try {
      // 检查登录状态
      const token = my.getStorageSync({ key: 'token' }).data;
      const userInfo = my.getStorageSync({ key: 'userInfo' }).data;
      
      console.log('Token exists:', !!token);
      
      this.globalData.isLoggedIn = !!token;
      this.globalData.userInfo = userInfo || null;
      
      // Verifikasi apiBaseUrl sekali lagi
      console.log('API Base URL (after init):', this.globalData.apiBaseUrl);
      
      // SEMENTARA DINONAKTIFKAN: Redirect otomatis ke halaman login
      // Uncomment kode di bawah setelah masalah loading teratasi
      /*
      if (!this.globalData.isLoggedIn) {
        console.log('Redirecting to login page');
        my.redirectTo({
          url: '/pages/login/login'
        });
      }
      */
      
      // Tambahkan navigasi ke halaman index untuk testing
      console.log('Navigating to index page for testing');
      my.navigateTo({
        url: '/pages/index/index'
      });
    } catch (error) {
      console.error('Error in onLaunch:', error);
    }
    console.log('App onLaunch - end');
  },
  
  onShow(options) {
    // 应用被显示
  },
  
  onHide() {
    // 应用被隐藏
  },
  
  onError(msg) {
    console.log('App onError: ', msg);
  },
  
  globalData: {
    isLoggedIn: false,
    userInfo: null,
    apiBaseUrl: 'https://touringapp-backend-production.up.railway.app', // Menggunakan URL Railway yang dapat diakses dari mana saja
    agoraAppId: '8aaf8e4b769a4859910b338b25658ef1' // Agora App ID
  }
});
