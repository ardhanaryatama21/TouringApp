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
      
      // Redirect ke halaman login jika belum login
      if (!this.globalData.isLoggedIn) {
        console.log('Redirecting to login page');
        my.redirectTo({
          url: '/pages/login/login'
        });
      } else {
        // Jika sudah login, arahkan ke halaman groups
        console.log('User already logged in, redirecting to groups page');
        my.switchTab({
          url: '/pages/groups/groups'
        });
      }
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
    apiBaseUrl: 'http://192.168.18.191:5000', // URL API lokal tanpa /api di akhir
    agoraAppId: '8aaf8e4b769a4859910b338b25658ef1' // Agora App ID
  }
});
