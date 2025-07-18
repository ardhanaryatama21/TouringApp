App({
  onLaunch(options) {
    console.log('App onLaunch - start');
    console.log('=== APP LAUNCHING ===');
    console.log('Options:', JSON.stringify(options));
    console.log('=== DEBUG APP INITIALIZATION ===');
    console.log('API Base URL (initial):', this.globalData.apiBaseUrl);
    
    // FORCE set apiBaseUrl to Railway HTTPS
    this.globalData.apiBaseUrl = 'https://touringapp-backend-production.up.railway.app';
    console.log('FORCE set API Base URL to Railway:', this.globalData.apiBaseUrl);
    
    // Override my.request untuk debugging dan memaksa URL Railway
    const originalRequest = my.request;
    my.request = function(options) {
      console.log('=== REQUEST INTERCEPTED ===');
      console.log('Original URL:', options.url);
      
      // Deteksi dan perbaiki URL yang salah
      if (options.url.includes('192.168.18.191:5000') || options.url.includes('localhost') || options.url.includes('127.0.0.1')) {
        console.log('DETECTED LOCAL URL - FORCING RAILWAY URL');
        
        // Extract path dari URL lokal
        let path = options.url.split('/').slice(3).join('/');
        
        // Pastikan path menggunakan /api/auth/ untuk endpoint auth
        if (path.includes('auth/') && !path.includes('api/auth/')) {
          path = path.replace('auth/', 'api/auth/');
          console.log('Fixed auth path to include /api prefix:', path);
        }
        
        // Set URL ke Railway + path yang sudah diperbaiki
        options.url = 'https://touringapp-backend-production.up.railway.app/' + path;
        console.log('URL FORCED to:', options.url);
      }
      
      // Log semua options setelah dimodifikasi
      console.log('Final request options:', JSON.stringify(options));
      
      // Panggil request asli dengan options yang sudah dimodifikasi
      return originalRequest(options);
    };
    
    // CRITICAL: Hapus semua cache yang mungkin menyimpan URL lama
    try {
      my.clearStorageSync();
      console.log('Cache cleared successfully');
    } catch (e) {
      console.error('Error clearing cache:', e);
    }
    
    // DEBUG: Log semua storage keys sebelum dihapus
    try {
      const keys = my.getStorageInfoSync();
      console.log('Storage info before clear:', JSON.stringify(keys));
    } catch (e) {
      console.error('Error getting storage info:', e);
    }
    
    try {
      // 检查登录状态
      const token = my.getStorageSync({ key: 'token' }).data;
      const userInfo = my.getStorageSync({ key: 'userInfo' }).data;
      
      console.log('Token from storage:', token ? 'exists' : 'not found');
      console.log('UserInfo from storage:', userInfo ? JSON.stringify(userInfo) : 'not found');
      
      console.log('Token exists:', !!token);
      
      this.globalData.isLoggedIn = !!token;
      this.globalData.userInfo = userInfo || null;
      
      if (token && userInfo) {
        console.log('User is logged in');
      } else {
        console.log('User is not logged in');
      }
      
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
