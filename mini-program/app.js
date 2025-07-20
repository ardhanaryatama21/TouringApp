// Simpan referensi ke my.request asli
const originalRequest = my.request;

// Override my.request dengan interceptor
my.request = function(options) {
  // Log original request untuk debugging
  console.log('ORIGINAL REQUEST:', JSON.stringify(options));
  
  // Cek dan perbaiki URL jika menggunakan IP lokal atau localhost
  if (options.url) {
    // Deteksi URL yang menggunakan IP lokal atau localhost
    if (options.url.includes('192.168.18.191:5000') || 
        options.url.includes('192.168.18.206:5000') || 
        options.url.includes('localhost:5000') || 
        options.url.includes('127.0.0.1:5000')) {
      
      console.log('REQUEST INTERCEPTED: Local IP/localhost detected');
      
      // Ganti dengan URL Railway
      const railwayUrl = 'https://touringapp-backend-production.up.railway.app';
      
      // Ekstrak path dari URL asli
      let path = options.url.split('/').slice(3).join('/');
      
      // Perbaiki path jika perlu untuk semua endpoint yang memerlukan prefix /api/
      if (path.startsWith('auth/') || 
          path.startsWith('users/') || 
          path.startsWith('groups/') || 
          path.startsWith('calls/')) {
        path = 'api/' + path;
        console.log('PATH FIXED: Added /api prefix to', path);
      }
      
      // Buat URL baru
      const newUrl = `${railwayUrl}/${path}`;
      console.log(`URL FORCED to ${newUrl} (from ${options.url})`);
      
      // Update URL di options
      options.url = newUrl;
    }
  }
  
  // Panggil request asli dengan options yang sudah diperbaiki
  return originalRequest(options);
};

App({
  onLaunch(options) {
    console.log('App onLaunch - start');
    try {
      // 检查登录状态
      const token = my.getStorageSync({ key: 'token' }).data;
      const userInfo = my.getStorageSync({ key: 'userInfo' }).data;
      
      console.log('Token exists:', !!token);
      
      this.globalData.isLoggedIn = !!token;
      this.globalData.userInfo = userInfo || null;
      
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
    apiBaseUrl: 'https://touringapp-backend-production.up.railway.app', // Menggunakan Railway URL untuk produksi
    agoraAppId: '8aaf8e4b769a4859910b338b25658ef1' // Agora App ID
  }
});
